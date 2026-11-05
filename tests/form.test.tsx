import { act } from "react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { render } from "vitest-browser-react";
import { Form } from "../src/components/form/index.ts";
import { useAppForm } from "../src/lib/storybook/app-form.tsx";

const NAME_LABEL = "Name";
const SUBMIT_LABEL = "Save";
const BUSY_LABEL = "Saving";

const Example = ({
	onSubmit,
	busy,
}: Readonly<{
	onSubmit: () => Promise<void>;
	busy?: boolean;
}>) => {
	const form = useAppForm({
		defaultValues: { name: "" },
		onSubmit,
	});

	return (
		<Form.Root form={form} busy={busy}>
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
			<Form.Submit busyLabel={BUSY_LABEL}>
				{SUBMIT_LABEL}
			</Form.Submit>
		</Form.Root>
	);
};

const elapse = (ms: number) =>
	act(() => vi.advanceTimersByTimeAsync(ms));

const pendingSubmit = () => {
	const finish: { current: () => void } = {
		current: () => undefined,
	};
	const onSubmit = () =>
		new Promise<void>(resolve => {
			finish.current = resolve;
		});
	return { onSubmit, finish: () => finish.current() };
};

const setup = async (busy?: boolean) => {
	const submit = pendingSubmit();
	const screen = await render(
		<Example onSubmit={submit.onSubmit} busy={busy} />,
	);
	const status = screen.getByRole("status").element();
	const button = screen
		.getByRole("button", { name: SUBMIT_LABEL })
		.element();
	const input = screen
		.getByRole("textbox", { name: NAME_LABEL })
		.element();
	const fieldset =
		screen.container.querySelector("fieldset");
	return { ...submit, status, button, input, fieldset };
};

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("Form.Root", () => {
	test("renders a form that leaves validation to the form library", async () => {
		const { button } = await setup();

		expect(button.closest("form")).toHaveAttribute(
			"novalidate",
		);
	});

	test("disables and inerts its fields while a submit is in flight", async () => {
		const form = await setup();
		expect(form.fieldset).not.toHaveAttribute("disabled");
		expect(form.fieldset).not.toHaveAttribute("inert");

		await act(async () => {
			if (form.button instanceof HTMLElement) {
				form.button.click();
			}
		});
		await elapse(0);

		expect(form.fieldset).toHaveAttribute("disabled");
		expect(form.fieldset).toHaveAttribute("inert");
		expect(form.input).toBeDisabled();
		expect(form.button.closest("form")).toHaveAttribute(
			"aria-busy",
			"true",
		);

		form.finish();
		await elapse(0);

		expect(form.fieldset).not.toHaveAttribute("disabled");
		expect(form.input).toBeEnabled();
	});

	test("disables its fields while the caller says it is busy", async () => {
		const form = await setup(true);

		expect(form.fieldset).toHaveAttribute("disabled");
		expect(form.fieldset).toHaveAttribute("inert");
		expect(form.input).toBeDisabled();
	});
});

describe("Form.Submit", () => {
	test("mounts its live region empty, outside the inert fields", async () => {
		const { status } = await setup();

		expect(status).toBeEmptyDOMElement();
		expect(status.closest("[inert]")).toBeNull();
	});

	test("shows nothing for a submit shorter than 150 ms", async () => {
		const form = await setup();
		await act(async () => {
			if (form.button instanceof HTMLElement) {
				form.button.click();
			}
		});
		await elapse(140);
		form.finish();
		await elapse(1000);

		expect(form.status).toBeEmptyDOMElement();
		expect(form.button).not.toHaveAttribute("aria-busy");
	});

	test("announces the wait at 150 ms and holds it at least 200 ms", async () => {
		const form = await setup();
		const status = form.status;
		await act(async () => {
			if (form.button instanceof HTMLElement) {
				form.button.click();
			}
		});
		await elapse(149);
		expect(status).toBeEmptyDOMElement();
		expect(form.button).not.toHaveAttribute("aria-busy");

		await elapse(1);
		expect(status).toHaveTextContent(BUSY_LABEL);
		expect(form.button).toHaveAttribute(
			"aria-busy",
			"true",
		);

		form.finish();
		await elapse(199);
		expect(status).toHaveTextContent(BUSY_LABEL);

		await elapse(1);
		expect(status).toBeEmptyDOMElement();
		expect(form.button).not.toHaveAttribute("aria-busy");
		expect(status.isConnected).toBe(true);
	});
});
