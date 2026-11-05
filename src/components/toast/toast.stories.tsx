import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import { roleGone } from "../../lib/storybook/waits.ts";
import { withOverlayFrame } from "../../lib/storybook/overlay-frame.tsx";
import {
	STORY_TOAST_CLOSE_LABEL,
	STORY_TOAST_VIEWPORT_LABEL,
} from "../../lib/storybook/story-providers.tsx";
import { Button } from "../button/button.tsx";
import {
	type ToastAction,
	type ToastTone,
	toast,
	toastManager,
} from "./toast.ts";
import { ToastProvider } from "./toast-provider.tsx";

const SENT = "Declaration sent.";
const SEND_FAILED = "Declaration failed to send.";
const DRAFT_SAVED = "Draft saved.";
const OFFLINE = "You are offline. Declarations are queued.";
const SENT_DETAIL =
	"All twelve declarations reached the insurer. Nothing is left in the outbox.";
const RETRY_LABEL = "Retry";
const DELETE_LABEL = "Delete";

type ToastTriggerProps = Readonly<{
	tone: ToastTone;
	body: string;
	title?: string;
	actions?: ReadonlyArray<ToastAction>;
	timeout?: number;
	dedupeKey?: string;
}>;

const ToastTrigger = ({
	tone,
	body,
	title,
	actions,
	timeout,
	dedupeKey,
}: ToastTriggerProps) => (
	<Button
		variant="secondary"
		onClick={() =>
			toast.notify(tone, body, {
				title,
				actions,
				timeout,
				key: dedupeKey,
			})
		}>
		Show notification
	</Button>
);

const RETRY = fn().mockName("retry");
const DELETE = fn().mockName("delete");

const ACTIONS: ReadonlyArray<ToastAction> = [
	{ label: RETRY_LABEL, onClick: RETRY },
	{
		label: DELETE_LABEL,
		onClick: DELETE,
		variant: "tertiary",
	},
];

const SuccessToast = () => (
	<ToastTrigger tone="success" body={SENT} timeout={0} />
);

const ErrorToast = () => (
	<ToastTrigger
		tone="error"
		body={SEND_FAILED}
		timeout={0}
	/>
);

const InfoToast = () => (
	<ToastTrigger
		tone="info"
		body={DRAFT_SAVED}
		timeout={0}
	/>
);

const WarningToast = () => (
	<ToastTrigger tone="warning" body={OFFLINE} timeout={0} />
);

const HeadingToast = () => (
	<ToastTrigger
		tone="success"
		title={SENT}
		body={SENT_DETAIL}
		timeout={0}
	/>
);

const ActionsToast = () => (
	<ToastTrigger
		tone="error"
		title={SEND_FAILED}
		body="The insurer refused the batch. Check the client's policy number and send it again."
		actions={ACTIONS}
	/>
);

const DeduplicatedToast = () => (
	<ToastTrigger
		tone="success"
		body={SENT}
		timeout={0}
		dedupeKey="story-toast"
	/>
);

const AutoDismissToast = () => (
	<ToastTrigger tone="success" body={SENT} />
);

const findToast = (name: string) =>
	screen.findByRole("dialog", { name });

const toastClosed = (name: string) =>
	roleGone("dialog", { name });

const meta = {
	component: ToastProvider,
	render: SuccessToast,
	decorators: [withOverlayFrame("medium")],
	args: {
		closeLabel: STORY_TOAST_CLOSE_LABEL,
		viewportLabel: STORY_TOAST_VIEWPORT_LABEL,
		children: undefined,
	},
	argTypes: {
		children: { control: false },
	},
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Above the page" },
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
		],
		docs: { story: { inline: false, iframeHeight: 480 } },
	},
	beforeEach: () => () => {
		toastManager.close();
	},
} satisfies Meta<typeof ToastProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));

		await expect(await findToast(SENT)).toHaveAttribute(
			"data-tone",
			"success",
		);
	},
};

export const Error: Story = {
	tags: ["!dev", "!autodocs"],
	render: ErrorToast,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));

		await expect(
			await findToast(SEND_FAILED),
		).toHaveAttribute("data-tone", "error");
	},
};

export const Info: Story = {
	tags: ["!dev", "!autodocs"],
	render: InfoToast,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));

		await expect(
			await findToast(DRAFT_SAVED),
		).toHaveAttribute("data-tone", "info");
	},
};

export const Warning: Story = {
	tags: ["!dev", "!autodocs"],
	render: WarningToast,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));

		await expect(await findToast(OFFLINE)).toHaveAttribute(
			"data-tone",
			"warning",
		);
	},
};

export const WithHeading: Story = {
	tags: ["!dev", "!autodocs"],
	render: HeadingToast,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));

		await expect(
			await findToast(SENT),
		).toHaveAccessibleDescription(SENT_DETAIL);
	},
};

export const WithActions: Story = {
	tags: ["!dev", "!autodocs"],
	render: ActionsToast,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));
		const popup = await findToast(SEND_FAILED);

		await userEvent.click(
			within(popup).getByRole("button", {
				name: RETRY_LABEL,
			}),
		);
		await userEvent.click(
			within(popup).getByRole("button", {
				name: DELETE_LABEL,
			}),
		);

		await expect(RETRY).toHaveBeenCalledOnce();
		await expect(DELETE).toHaveBeenCalledOnce();
		await expect(popup).toBeInTheDocument();
	},
};

export const Stacked: Story = {
	play: async () => {
		toast.success(SENT);
		toast.error(SEND_FAILED);
		toast.info(DRAFT_SAVED);
		toast.warning(OFFLINE);

		await findToast(OFFLINE);
		await expect(
			screen.getAllByRole("dialog"),
		).toHaveLength(4);
	},
};

export const Deduplicated: Story = {
	tags: ["!dev", "!autodocs"],
	render: DeduplicatedToast,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button");

		await userEvent.click(trigger);
		await findToast(SENT);
		await userEvent.click(trigger);

		await expect(
			screen.getAllByRole("dialog", {
				name: SENT,
			}),
		).toHaveLength(1);
	},
};

export const AutoDismiss: Story = {
	tags: ["!dev", "!autodocs"],
	render: AutoDismissToast,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));
		await findToast(SENT);

		await toastClosed(SENT);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button");

		await userEvent.tab();
		await expect(trigger).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const popup = await findToast(SENT);

		await userEvent.keyboard("{F6}");
		await expect(
			screen.getByRole("region", {
				name: STORY_TOAST_VIEWPORT_LABEL,
			}),
		).toHaveFocus();
		await userEvent.tab();
		await expect(popup).toHaveFocus();
		await userEvent.keyboard("{Escape}");
		await toastClosed(SENT);
		await waitFor(() => expect(trigger).toHaveFocus());

		await userEvent.keyboard(" ");
		const second = await findToast(SENT);
		await userEvent.keyboard("{F6}");
		await userEvent.tab();
		await expect(second).toHaveFocus();
		await userEvent.tab();
		await expect(
			within(second).getByRole("button", {
				name: STORY_TOAST_CLOSE_LABEL,
			}),
		).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await toastClosed(SENT);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));

		await userEvent.click(
			within(await findToast(SENT)).getByRole("button", {
				name: STORY_TOAST_CLOSE_LABEL,
			}),
		);
		await toastClosed(SENT);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button"),
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: within(await findToast(SENT)).getByRole(
				"button",
				{ name: STORY_TOAST_CLOSE_LABEL },
			),
		});
		await toastClosed(SENT);
	},
};
