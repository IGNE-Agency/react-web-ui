import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import { roleGone } from "../../lib/storybook/waits.ts";
import {
	useOpenArg,
	withOverlayFrame,
} from "../../lib/storybook/overlay-frame.tsx";
import { Button } from "../button/button.tsx";
import {
	ConfirmDialog,
	type ConfirmDialogProps,
} from "./confirm-dialog.tsx";

const OPEN_LABEL = "Delete declaration";
const TITLE = "Delete this declaration?";
const DESCRIPTION = "This cannot be undone.";
const CONFIRM_LABEL = "Delete";
const CANCEL_LABEL = "Cancel";
const SEND_TITLE = "Send this declaration?";
const SEND_CONFIRM_LABEL = "Send";

const confirmLater =
	fn<() => Promise<void>>().mockName("confirmLater");

const ControlledConfirmDialog = (
	args: ConfirmDialogProps,
) => {
	const setOpen = useOpenArg();

	return (
		<>
			<Button
				variant="secondary"
				onClick={() => setOpen(true)}>
				{OPEN_LABEL}
			</Button>
			<ConfirmDialog
				{...args}
				onOpenChange={open => {
					args.onOpenChange(open);
					setOpen(open);
				}}
			/>
		</>
	);
};

const ConfirmDialogFromTrigger = (
	args: ConfirmDialogProps,
) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				variant="secondary"
				onClick={() => setOpen(true)}>
				{OPEN_LABEL}
			</Button>
			<ConfirmDialog
				{...args}
				open={open}
				onOpenChange={next => {
					args.onOpenChange(next);
					setOpen(next);
				}}
			/>
		</>
	);
};

const alertDialog = () =>
	screen.findByRole("alertdialog", {
		name: TITLE,
	});

const focusInside = (popup: HTMLElement) =>
	waitFor(() =>
		expect(popup.contains(document.activeElement)).toBe(
			true,
		),
	);

const action = (popup: HTMLElement, name: string) =>
	within(popup).getByRole("button", { name });

const settle = () =>
	new Promise(resolve => {
		setTimeout(resolve, 300);
	});

const meta = {
	component: ConfirmDialog,
	render: ControlledConfirmDialog,
	decorators: [withOverlayFrame()],
	tags: ["!dev", "!autodocs"],
	args: {
		open: true,
		title: TITLE,
		description: DESCRIPTION,
		confirmLabel: CONFIRM_LABEL,
		cancelLabel: CANCEL_LABEL,
		tone: "danger",
		onConfirm: fn(),
		onOpenChange: fn(),
	},
	argTypes: {
		title: { control: "text" },
		description: { control: "text" },
	},
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Above the page" },
			{ component: "components/button" },
		],
	},
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
	play: async () => {
		const popup = await alertDialog();

		await expect(popup).toHaveAccessibleDescription(
			DESCRIPTION,
		);
		await expect(
			action(popup, CONFIRM_LABEL),
		).toHaveAttribute("data-tone", "danger");
	},
};

export const NotDestructive: Story = {
	args: {
		tone: "brand",
		title: SEND_TITLE,
		description: undefined,
		confirmLabel: SEND_CONFIRM_LABEL,
	},
	play: async () => {
		const popup = await screen.findByRole("alertdialog", {
			name: SEND_TITLE,
		});

		await expect(
			action(popup, SEND_CONFIRM_LABEL),
		).toHaveAttribute("data-tone", "brand");
	},
};

export const WithoutDescription: Story = {
	args: { description: undefined },
	play: async () => {
		await expect(
			await alertDialog(),
		).not.toHaveAccessibleDescription();
	},
};

export const Keyboard: Story = {
	render: ConfirmDialogFromTrigger,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		const popup = await alertDialog();
		await focusInside(popup);
		await userEvent.tab();
		await focusInside(popup);
		await userEvent.tab();
		await focusInside(popup);
		await userEvent.tab({ shift: true });
		await focusInside(popup);

		await userEvent.keyboard("{Escape}");
		await roleGone("alertdialog");
		await expect(trigger).toHaveFocus();
		await expect(args.onConfirm).not.toHaveBeenCalled();

		await userEvent.keyboard(" ");
		const reopened = await alertDialog();
		const confirm = action(reopened, CONFIRM_LABEL);
		await waitFor(() =>
			expect(action(reopened, CANCEL_LABEL)).toHaveFocus(),
		);
		await userEvent.tab();
		await expect(confirm).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await roleGone("alertdialog");

		await expect(trigger).toHaveFocus();
		await expect(args.onConfirm).toHaveBeenCalledOnce();
		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			2,
		);
		await expect(
			args.onOpenChange,
		).toHaveBeenLastCalledWith(false);
	},
};

export const Mouse: Story = {
	render: ConfirmDialogFromTrigger,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.click(trigger);
		const popup = await alertDialog();
		await userEvent.click(document.body);
		await expect(popup).toBeInTheDocument();

		await userEvent.click(action(popup, CANCEL_LABEL));
		await roleGone("alertdialog");
		await expect(args.onConfirm).not.toHaveBeenCalled();

		await userEvent.click(trigger);
		await userEvent.click(
			action(await alertDialog(), CONFIRM_LABEL),
		);
		await roleGone("alertdialog");

		await expect(args.onConfirm).toHaveBeenCalledOnce();
		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			2,
		);
	},
};

export const Touch: Story = {
	render: ConfirmDialogFromTrigger,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: trigger,
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: action(await alertDialog(), CANCEL_LABEL),
		});
		await roleGone("alertdialog");
		await expect(args.onConfirm).not.toHaveBeenCalled();

		await userEvent.pointer({
			keys: "[TouchA]",
			target: trigger,
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: action(await alertDialog(), CONFIRM_LABEL),
		});
		await roleGone("alertdialog");

		await expect(args.onConfirm).toHaveBeenCalledOnce();
	},
};

export const PendingResolves: Story = {
	render: ConfirmDialogFromTrigger,
	args: { onConfirm: confirmLater },
	parameters: {
		docs: {
			description: {
				story:
					"`onConfirm` returns a promise: the dialog stays open, busy and undismissable until it resolves, then closes.",
			},
		},
	},
	play: async ({ args, canvas }) => {
		const { promise, resolve } =
			Promise.withResolvers<void>();
		confirmLater.mockReturnValueOnce(promise);
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.click(trigger);
		const popup = await alertDialog();
		const confirm = action(popup, CONFIRM_LABEL);
		await userEvent.click(confirm);

		await expect(confirmLater).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(confirm).toHaveAttribute("aria-busy", "true"),
		);
		await expect(
			action(popup, CANCEL_LABEL),
		).toBeDisabled();

		await userEvent.keyboard("{Escape}");
		await userEvent.click(action(popup, CANCEL_LABEL));
		await userEvent.click(confirm);
		await settle();
		await expect(popup).toBeInTheDocument();
		await expect(confirmLater).toHaveBeenCalledOnce();
		await expect(
			args.onOpenChange,
		).not.toHaveBeenCalledWith(false);

		resolve();
		await roleGone("alertdialog");
		await expect(
			args.onOpenChange,
		).toHaveBeenLastCalledWith(false);
		await expect(trigger).toHaveFocus();
	},
};

export const PendingRejects: Story = {
	render: ConfirmDialogFromTrigger,
	args: { onConfirm: confirmLater },
	parameters: {
		docs: {
			description: {
				story:
					"`onConfirm` returns a promise that rejects: the dialog stays open and becomes dismissable again, so the user can retry or cancel.",
			},
		},
	},
	play: async ({ args, canvas }) => {
		const { promise, reject } =
			Promise.withResolvers<void>();
		confirmLater.mockReturnValueOnce(promise);

		await userEvent.click(
			canvas.getByRole("button", { name: OPEN_LABEL }),
		);
		const popup = await alertDialog();
		const confirm = action(popup, CONFIRM_LABEL);
		await userEvent.click(confirm);
		await waitFor(() =>
			expect(confirm).toHaveAttribute("aria-busy", "true"),
		);

		reject(new Error("The insurer refused the request."));
		await waitFor(() =>
			expect(confirm).not.toHaveAttribute("aria-busy"),
		);
		await expect(popup).toBeInTheDocument();
		await expect(
			action(popup, CANCEL_LABEL),
		).not.toBeDisabled();
		await expect(
			args.onOpenChange,
		).not.toHaveBeenCalledWith(false);

		await userEvent.keyboard("{Escape}");
		await roleGone("alertdialog");
		await expect(
			args.onOpenChange,
		).toHaveBeenLastCalledWith(false);
	},
};
