import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import {
	expect,
	fn,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { Button } from "../button/button.tsx";
import { Spinner } from "../spinner/spinner.tsx";
import { Stale, type StaleRootProps } from "./stale.tsx";

const CONTENT = "This week's invoices";
const SLOW_MESSAGE = "This is taking longer than usual.";
const TRY_AGAIN = "Try again";
const FINISH_REFRESH = "Finish refresh";

const HOUR = 60 * 60 * 1000;

const retried = fn();

const StaleExample = (
	props: StaleRootProps,
): ReactElement => (
	<Stale.Root {...props}>
		<Stale.Content>
			<p>{CONTENT}</p>
		</Stale.Content>
		<Stale.Overlay>
			<Stale.Message>{SLOW_MESSAGE}</Stale.Message>
			<Stale.Retry onRetry={retried}>
				{TRY_AGAIN}
			</Stale.Retry>
		</Stale.Overlay>
	</Stale.Root>
);

const ComposedStale = (
	props: StaleRootProps,
): ReactElement => (
	<Stale.Root {...props}>
		<Stale.Content>
			<p>{CONTENT}</p>
		</Stale.Content>
		<Stale.Overlay>
			<Stale.Status>
				<Stale.Illustration>
					<Spinner size={3} />
				</Stale.Illustration>
				{SLOW_MESSAGE}
			</Stale.Status>
		</Stale.Overlay>
	</Stale.Root>
);

const RefreshingStale = (
	args: StaleRootProps,
): ReactElement => {
	const [busy, setBusy] = useState(args.busy);

	return (
		<>
			<Button
				variant="secondary"
				onClick={() => setBusy(!busy)}>
				{busy ? FINISH_REFRESH : "Start refresh"}
			</Button>
			<StaleExample {...args} busy={busy} />
		</>
	);
};

type Canvas = ReturnType<typeof within>;

const content = (canvas: Canvas) => {
	const element = canvas.getByText(CONTENT).parentElement;
	if (element === null) {
		throw new Error("The stale content has no wrapper.");
	}
	return element;
};

const isFresh = (canvas: Canvas) =>
	waitFor(() =>
		expect(content(canvas)).not.toHaveAttribute(
			"aria-busy",
		),
	);

const isBusy = (canvas: Canvas) =>
	waitFor(() =>
		expect(content(canvas)).toHaveAttribute(
			"aria-busy",
			"true",
		),
	);

const retryButton = (canvas: Canvas) =>
	canvas.findByRole("button", {
		name: TRY_AGAIN,
	});

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{
				page: "Foundation/Motion",
				section:
					"A wait announces itself late, and then stays a moment",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Inert beats disabled for content that is only stale",
			},
		],
	},
	component: Stale.Root,
	render: StaleExample,
	args: {
		busy: false,
	},
} satisfies Meta<typeof Stale.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fresh: Story = {
	play: async ({ canvas }) => {
		await expect(content(canvas)).not.toHaveAttribute(
			"aria-busy",
		);
		await expect(
			canvas.queryByRole("status"),
		).not.toBeInTheDocument();
	},
};

export const Busy: Story = {
	parameters: {
		a11y: {
			config: {
				rules: [
					{
						id: "color-contrast-apca-bronze",
						enabled: false,
					},
					{
						id: "color-contrast-apca-custom",
						enabled: false,
					},
				],
			},
		},
		docs: {
			description: {
				story:
					"Busy content is dimmed on purpose; it is not meant to be read while the refresh runs.",
			},
		},
	},
	args: {
		busy: true,
		busyAfter: 0,
		slowAfter: HOUR,
		stuckAfter: HOUR,
	},
	play: async ({ canvas }) => {
		await isBusy(canvas);
		await expect(content(canvas)).not.toHaveAttribute(
			"inert",
		);
		await expect(
			canvas.queryByRole("status"),
		).not.toBeInTheDocument();
	},
};

export const Slow: Story = {
	args: {
		busy: true,
		busyAfter: 0,
		slowAfter: 0,
		stuckAfter: HOUR,
	},
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("status"),
		).toHaveTextContent(SLOW_MESSAGE);
		await expect(content(canvas)).toHaveAttribute("inert");
		await expect(
			canvas.queryByRole("button", {
				name: TRY_AGAIN,
			}),
		).not.toBeInTheDocument();
	},
};

export const ComposedStatus: Story = {
	args: Slow.args,
	render: ComposedStale,
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("status"),
		).toHaveTextContent(SLOW_MESSAGE);
	},
};

export const Stuck: Story = {
	args: {
		busy: true,
		busyAfter: 0,
		slowAfter: 0,
		stuckAfter: 0,
	},
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("status"),
		).toHaveTextContent(SLOW_MESSAGE);
		const retry = await retryButton(canvas);
		await waitFor(() => expect(retry).toBeVisible());
	},
};

export const Escalates: Story = {
	args: {
		busy: true,
		busyAfter: 1000,
		slowAfter: 2000,
		stuckAfter: 3000,
	},
	play: async ({ canvas }) => {
		await expect(content(canvas)).not.toHaveAttribute(
			"aria-busy",
		);

		await isBusy(canvas);
		await expect(
			canvas.queryByRole("status"),
		).not.toBeInTheDocument();

		await waitFor(() =>
			expect(canvas.getByRole("status")).toHaveTextContent(
				SLOW_MESSAGE,
			),
		);
		await expect(
			canvas.queryByRole("button", {
				name: TRY_AGAIN,
			}),
		).not.toBeInTheDocument();

		await waitFor(() =>
			expect(
				canvas.getByRole("button", {
					name: TRY_AGAIN,
				}),
			).toBeVisible(),
		);
	},
};

export const QuickRefresh: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		busy: true,
		busyAfter: 3000,
	},
	render: RefreshingStale,
	play: async ({ canvas }) => {
		const busyChanges: MutationRecord[] = [];
		const observer = new MutationObserver(records => {
			busyChanges.push(...records);
		});
		observer.observe(content(canvas), {
			attributeFilter: ["aria-busy"],
		});

		await userEvent.click(
			canvas.getByRole("button", {
				name: FINISH_REFRESH,
			}),
		);
		await new Promise(resolve => setTimeout(resolve, 3500));
		observer.disconnect();

		await expect(busyChanges).toEqual([]);
	},
};

export const HoldsAfterRefresh: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		busy: true,
		busyAfter: 0,
		busyMinDuration: 1000,
		slowAfter: HOUR,
		stuckAfter: HOUR,
	},
	render: RefreshingStale,
	play: async ({ canvas }) => {
		await isBusy(canvas);

		await userEvent.click(
			canvas.getByRole("button", {
				name: FINISH_REFRESH,
			}),
		);

		await expect(content(canvas)).toHaveAttribute(
			"aria-busy",
			"true",
		);
		await isFresh(canvas);
	},
};

export const RetryKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: Stuck.args,
	play: async ({ canvas }) => {
		const retry = await retryButton(canvas);

		await userEvent.tab();
		await expect(retry).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(retried).toHaveBeenCalledOnce();
		await userEvent.keyboard(" ");
		await expect(retried).toHaveBeenCalledTimes(2);
	},
};

export const RetryMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: Stuck.args,
	play: async ({ canvas }) => {
		await userEvent.click(await retryButton(canvas));

		await expect(retried).toHaveBeenCalledOnce();
	},
};

export const RetryTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: Stuck.args,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await retryButton(canvas),
		});

		await expect(retried).toHaveBeenCalledOnce();
	},
};
