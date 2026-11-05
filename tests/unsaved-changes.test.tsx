import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Link,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Form } from "../src/components/form/index.ts";
import { useAppForm } from "../src/lib/forms/index.ts";
import {
	type LeaveGuardPolicy,
	LeaveGuardDialog,
	never,
	useLeaveGuard,
	useUnsavedChanges,
	whenDirty,
} from "../src/lib/unsaved-changes/index.ts";
import { createUnsavedChangesRegistry } from "../src/lib/unsaved-changes/registry.ts";
import { useRouterLeaveGuard } from "../src/lib/unsaved-changes/tanstack-router.ts";

const NAME_LABEL = "Name";
const UNSAVED = "Unsaved changes";
const SAVED = "Nothing unsaved";
const RESET_LABEL = "Reset";
const UNMOUNT_LABEL = "Close the form";
const LEAVE_LABEL = "Leave";
const QUESTION = "Discard your changes?";
const DISCARD_LABEL = "Discard";
const STAY_LABEL = "Keep editing";
const OTHER_PAGE = "Other page";

const NameForm = ({
	leaveGuard,
}: Readonly<{
	leaveGuard?: LeaveGuardPolicy;
}>): ReactNode => {
	const form = useAppForm({ defaultValues: { name: "" } });

	return (
		<Form.Root form={form} leaveGuard={leaveGuard}>
			<form.Field name="name">
				{field => (
					<input
						aria-label={NAME_LABEL}
						value={field.state.value}
						onChange={event =>
							field.handleChange(event.target.value)
						}
					/>
				)}
			</form.Field>
			<button type="button" onClick={() => form.reset()}>
				{RESET_LABEL}
			</button>
		</Form.Root>
	);
};

const Unsaved = (): ReactNode => (
	<output>{useUnsavedChanges() ? UNSAVED : SAVED}</output>
);

const Page = ({
	leaveGuard,
}: Readonly<{
	leaveGuard?: LeaveGuardPolicy;
}>): ReactNode => {
	const [shown, setShown] = useState(true);

	return (
		<>
			{shown ? <NameForm leaveGuard={leaveGuard} /> : null}
			<button type="button" onClick={() => setShown(false)}>
				{UNMOUNT_LABEL}
			</button>
			<Unsaved />
		</>
	);
};

const Dialog = ({
	guard,
}: Readonly<{
	guard: ReturnType<typeof useLeaveGuard>;
}>): ReactNode => (
	<LeaveGuardDialog
		guard={guard}
		title={QUESTION}
		confirmLabel={DISCARD_LABEL}
		cancelLabel={STAY_LABEL}
	/>
);

const GuardedPage = ({
	onLeave,
}: Readonly<{ onLeave: () => void }>): ReactNode => {
	const guard = useLeaveGuard();

	return (
		<>
			<NameForm />
			<button
				type="button"
				onClick={() =>
					guard.blocking ? guard.hold(onLeave) : onLeave()
				}>
				{LEAVE_LABEL}
			</button>
			<Dialog guard={guard} />
		</>
	);
};

const unloadHeld = (): boolean => {
	const event = new Event("beforeunload", {
		cancelable: true,
	});
	window.dispatchEvent(event);
	return event.defaultPrevented;
};

const nameInput = () =>
	page.getByRole("textbox", { name: NAME_LABEL });

const question = () =>
	page.getByRole("alertdialog", { name: QUESTION });

describe("createUnsavedChangesRegistry", () => {
	test("has unsaved changes while any source is registered", () => {
		const registry = createUnsavedChangesRegistry();
		const first = registry.register();
		const second = registry.register();

		first();
		expect(registry.hasUnsavedChanges()).toBe(true);

		second();
		expect(registry.hasUnsavedChanges()).toBe(false);
	});

	test("tells its listeners when the answer changes, until they unsubscribe", () => {
		const registry = createUnsavedChangesRegistry();
		const listener = vi.fn();
		const unsubscribe = registry.subscribe(listener);

		const unregister = registry.register();
		unregister();
		unregister();
		expect(listener).toHaveBeenCalledTimes(2);

		unsubscribe();
		registry.register();
		expect(listener).toHaveBeenCalledTimes(2);
	});
});

describe("Form.Root", () => {
	test("reports unsaved changes once a field is edited", async () => {
		await render(<Page />);
		await expect
			.element(page.getByText(SAVED))
			.toBeVisible();

		await nameInput().fill("Ada");

		await expect
			.element(page.getByText(UNSAVED))
			.toBeVisible();
	});

	test("stops reporting once the form is reset", async () => {
		await render(<Page />);
		await nameInput().fill("Ada");
		await expect
			.element(page.getByText(UNSAVED))
			.toBeVisible();

		await page
			.getByRole("button", { name: RESET_LABEL })
			.click();

		await expect
			.element(page.getByText(SAVED))
			.toBeVisible();
	});

	test("reports under whenDirty as it does by default", async () => {
		await render(<Page leaveGuard={whenDirty} />);
		await expect
			.element(page.getByText(SAVED))
			.toBeVisible();

		await nameInput().fill("Ada");

		await expect
			.element(page.getByText(UNSAVED))
			.toBeVisible();
	});

	test("reports nothing under a policy that never guards", async () => {
		await render(<Page leaveGuard={never} />);

		await nameInput().fill("Ada");

		await expect.element(nameInput()).toHaveValue("Ada");
		await expect
			.element(page.getByText(SAVED))
			.toBeVisible();
		expect(unloadHeld()).toBe(false);
	});

	test("asks its policy with the form's live state", async () => {
		const policy = vi.fn<LeaveGuardPolicy>(
			state => state.values.name === "Ada",
		);
		await render(<Page leaveGuard={policy} />);
		await expect
			.element(page.getByText(SAVED))
			.toBeVisible();

		await nameInput().fill("Ada");

		await expect
			.element(page.getByText(UNSAVED))
			.toBeVisible();
		expect(policy).toHaveBeenLastCalledWith(
			expect.objectContaining({
				values: { name: "Ada" },
				isDirty: true,
			}),
		);
	});

	test("stops reporting once its policy says so", async () => {
		await render(
			<Page
				leaveGuard={state => state.values.name !== "Ada"}
			/>,
		);
		await nameInput().fill("Ad");
		await expect
			.element(page.getByText(UNSAVED))
			.toBeVisible();

		await nameInput().fill("Ada");

		await expect
			.element(page.getByText(SAVED))
			.toBeVisible();
	});

	test("stops reporting once it unmounts", async () => {
		await render(<Page />);
		await nameInput().fill("Ada");
		await expect
			.element(page.getByText(UNSAVED))
			.toBeVisible();

		await page
			.getByRole("button", { name: UNMOUNT_LABEL })
			.click();

		await expect
			.element(page.getByText(SAVED))
			.toBeVisible();
	});
});

describe("useLeaveGuard", () => {
	test("holds a reload only while there are unsaved changes", async () => {
		await render(<GuardedPage onLeave={vi.fn()} />);
		expect(unloadHeld()).toBe(false);

		await nameInput().fill("Ada");
		await expect.poll(unloadHeld).toBe(true);

		await page
			.getByRole("button", { name: RESET_LABEL })
			.click();
		await expect.poll(unloadHeld).toBe(false);
	});

	test("lets a leave through at once while there is nothing unsaved", async () => {
		const onLeave = vi.fn();
		await render(<GuardedPage onLeave={onLeave} />);

		await page
			.getByRole("button", { name: LEAVE_LABEL })
			.click();

		expect(onLeave).toHaveBeenCalledOnce();
		await expect
			.element(question())
			.not.toBeInTheDocument();
	});

	test("asks before a held leave, and goes through on discard", async () => {
		const onLeave = vi.fn();
		await render(<GuardedPage onLeave={onLeave} />);
		await nameInput().fill("Ada");

		await page
			.getByRole("button", { name: LEAVE_LABEL })
			.click();
		await expect.element(question()).toBeVisible();
		expect(onLeave).not.toHaveBeenCalled();

		await page
			.getByRole("button", { name: DISCARD_LABEL })
			.click();

		expect(onLeave).toHaveBeenCalledOnce();
		await expect
			.element(question())
			.not.toBeInTheDocument();
	});

	test("stays when the question is answered with keep editing", async () => {
		const onLeave = vi.fn();
		await render(<GuardedPage onLeave={onLeave} />);
		await nameInput().fill("Ada");

		await page
			.getByRole("button", { name: LEAVE_LABEL })
			.click();
		await page
			.getByRole("button", { name: STAY_LABEL })
			.click();

		await expect
			.element(question())
			.not.toBeInTheDocument();
		expect(onLeave).not.toHaveBeenCalled();
		await expect.element(nameInput()).toHaveValue("Ada");
	});
});

const RouterGuard = (): ReactNode => (
	<Dialog guard={useRouterLeaveGuard()} />
);

const routedApp = () => {
	const rootRoute = createRootRoute({
		component: () => (
			<>
				<RouterGuard />
				<Outlet />
			</>
		),
	});
	const editRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => (
			<>
				<NameForm />
				<Link to="/other">{LEAVE_LABEL}</Link>
			</>
		),
	});
	const otherRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/other",
		component: () => <h1>{OTHER_PAGE}</h1>,
	});
	const history = createMemoryHistory({
		initialEntries: ["/"],
	});
	const router = createRouter({
		routeTree: rootRoute.addChildren([
			editRoute,
			otherRoute,
		]),
		history,
	});

	return { router, history };
};

describe("useRouterLeaveGuard", () => {
	test("lets a navigation through while there is nothing unsaved", async () => {
		const { router, history } = routedApp();
		await render(<RouterProvider router={router} />);

		await page
			.getByRole("link", { name: LEAVE_LABEL })
			.click();

		await expect
			.element(
				page.getByRole("heading", { name: OTHER_PAGE }),
			)
			.toBeVisible();
		expect(history.location.pathname).toBe("/other");
	});

	test("holds a navigation away from unsaved changes, and goes through on discard", async () => {
		const { router, history } = routedApp();
		await render(<RouterProvider router={router} />);
		await nameInput().fill("Ada");

		await page
			.getByRole("link", { name: LEAVE_LABEL })
			.click();
		await expect.element(question()).toBeVisible();
		expect(history.location.pathname).toBe("/");

		await page
			.getByRole("button", { name: DISCARD_LABEL })
			.click();

		await expect
			.element(
				page.getByRole("heading", { name: OTHER_PAGE }),
			)
			.toBeVisible();
		expect(history.location.pathname).toBe("/other");
		await expect
			.element(question())
			.not.toBeInTheDocument();
	});

	test("keeps the route when the question is answered with keep editing", async () => {
		const { router, history } = routedApp();
		await render(<RouterProvider router={router} />);
		await nameInput().fill("Ada");

		await page
			.getByRole("link", { name: LEAVE_LABEL })
			.click();
		await page
			.getByRole("button", { name: STAY_LABEL })
			.click();

		await expect
			.element(question())
			.not.toBeInTheDocument();
		expect(history.location.pathname).toBe("/");
		await expect.element(nameInput()).toHaveValue("Ada");
	});

	test("asks the router to hold a reload only while there are unsaved changes", async () => {
		const { router, history } = routedApp();
		await render(<RouterProvider router={router} />);
		const reloadHeld = () =>
			history
				// oxlint-disable-next-line no-underscore-dangle -- memory history installs no beforeunload listener; its blockers say what a browser history would hold
				._getBlockers()
				.some(
					blocker => blocker.enableBeforeUnload === true,
				);
		await expect.poll(reloadHeld).toBe(false);

		await nameInput().fill("Ada");

		await expect.poll(reloadHeld).toBe(true);
	});
});
