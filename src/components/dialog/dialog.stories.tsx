import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import {
	roleGone,
	textGone,
} from "../../lib/storybook/waits.ts";
import { Button } from "../button/button.tsx";
import { Icon } from "../icon/icon.tsx";
import {
	useOpenArg,
	useOverlayFrame,
	withOverlayFrame,
} from "../../lib/storybook/overlay-frame.tsx";
import { Dialog } from "./dialog.tsx";

type DialogExampleProps = ComponentProps<
	typeof Dialog.Root
>;

const OPEN_LABEL = "Open";
const TITLE = "Edit declaration";
const CLOSE_LABEL = "Close";
const BODY =
	"A body long enough to sit under the title and show the room around it.";
const CANCEL_LABEL = "Cancel";
const SAVE_LABEL = "Save";

const DialogExample = (props: DialogExampleProps) => {
	const { container } = useOverlayFrame();

	return (
		<Dialog.Root {...props}>
			<Dialog.Trigger
				render={
					<Button variant="secondary">{OPEN_LABEL}</Button>
				}
			/>
			<Dialog.Content container={container}>
				<Dialog.Header>
					<Dialog.Title>{TITLE}</Dialog.Title>
					<Dialog.CloseButton
						closeLabel={CLOSE_LABEL}
						icon={<Icon svg={CloseIcon} label="" />}
					/>
				</Dialog.Header>
				<Dialog.Body>
					<Dialog.Description>{BODY}</Dialog.Description>
				</Dialog.Body>
				<Dialog.Footer>
					<Dialog.Close
						render={
							<Button variant="tertiary">
								{CANCEL_LABEL}
							</Button>
						}
					/>
					<Button variant="primary">{SAVE_LABEL}</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	);
};

const ControlledDialog = (args: DialogExampleProps) => {
	const setOpen = useOpenArg();

	return (
		<DialogExample
			{...args}
			onOpenChange={(open, details) => {
				args.onOpenChange?.(open, details);
				setOpen(open);
			}}
		/>
	);
};

const dialog = () =>
	screen.findByRole("dialog", {
		name: TITLE,
	});

const button = (popup: HTMLElement, name: string) =>
	within(popup).getByRole("button", { name });

const meta = {
	component: Dialog.Root,
	render: ControlledDialog,
	decorators: [withOverlayFrame()],
	args: {
		open: true,
		onOpenChange: fn(),
	},
	argTypes: {
		open: { control: "boolean" },
	},
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Above the page" },
			{
				page: "Patterns",
				section:
					"A dismissable surface says so on its title's line",
			},
		],
	},
} satisfies Meta<typeof Dialog.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NonModal: Story = {
	name: "Non-modal",
	args: { modal: false },
	play: async () => {
		await expect(
			await dialog(),
		).toHaveAccessibleDescription(BODY);
	},
};

export const Modal: Story = {
	args: { open: undefined },
	render: DialogExample,
	parameters: { overlayFrame: { interactive: true } },
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: DialogExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		const popup = await dialog();
		await waitFor(() =>
			expect(
				within(popup).getByRole("button", {
					name: CLOSE_LABEL,
				}),
			).toHaveFocus(),
		);
		await screen.findByText(CLOSE_LABEL);
		await userEvent.keyboard("{Escape}");
		await textGone(CLOSE_LABEL);
		await expect(popup).toBeInTheDocument();

		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard(" ");
		const reopened = await dialog();
		const close = button(reopened, CLOSE_LABEL);
		const cancel = button(reopened, CANCEL_LABEL);
		const save = button(reopened, SAVE_LABEL);
		await waitFor(() => expect(close).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(cancel).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(save).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(close).toHaveFocus());
		await userEvent.tab({ shift: true });
		await waitFor(() => expect(save).toHaveFocus());
		await userEvent.tab({ shift: true });
		await waitFor(() => expect(cancel).toHaveFocus());
		await userEvent.keyboard("{Enter}");
		await roleGone("dialog");
		await expect(trigger).toHaveFocus();

		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			4,
		);
		await expect(
			args.onOpenChange,
		).toHaveBeenLastCalledWith(false, expect.anything());
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: DialogExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.click(trigger);
		await userEvent.click(
			within(await dialog()).getByRole("button", {
				name: CANCEL_LABEL,
			}),
		);
		await roleGone("dialog");
		await expect(trigger).toHaveFocus();

		await userEvent.click(trigger);
		await userEvent.click(
			within(await dialog()).getByRole("button", {
				name: CLOSE_LABEL,
			}),
		);
		await roleGone("dialog");

		await userEvent.click(trigger);
		await dialog();
		await userEvent.click(document.body);
		await roleGone("dialog");

		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			6,
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: DialogExample,
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
			target: within(await dialog()).getByRole("button", {
				name: CANCEL_LABEL,
			}),
		});
		await roleGone("dialog");

		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			2,
		);
		await expect(
			args.onOpenChange,
		).toHaveBeenLastCalledWith(false, expect.anything());
	},
};
