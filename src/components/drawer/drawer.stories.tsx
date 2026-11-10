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
import { roleGone } from "../../lib/storybook/waits.ts";
import { Button, IconButton } from "../button/button.tsx";
import { Icon } from "../icon/icon.tsx";
import {
	useOpenArg,
	useOverlayFrame,
	withOverlayFrame,
} from "../../lib/storybook/overlay-frame.tsx";
import { Drawer } from "./drawer.tsx";

type DrawerExampleProps = ComponentProps<
	typeof Drawer.Root
>;

const OPEN_LABEL = "Show filters";
const TITLE = "Filters";
const CLOSE_LABEL = "Close";
const DONE_LABEL = "Done";

const DrawerExample = (props: DrawerExampleProps) => {
	const { container } = useOverlayFrame();

	return (
		<Drawer.Root {...props}>
			<Drawer.Trigger
				render={
					<Button variant="secondary">{OPEN_LABEL}</Button>
				}
			/>
			<Drawer.Sheet container={container}>
				<Drawer.Header>
					<Drawer.Title>{TITLE}</Drawer.Title>
					<Drawer.Close
						render={
							<IconButton
								label={CLOSE_LABEL}
								variant="tertiary">
								<Icon svg={CloseIcon} label="" />
							</IconButton>
						}
					/>
				</Drawer.Header>
				<Drawer.Close
					render={
						<Button variant="primary">{DONE_LABEL}</Button>
					}
				/>
			</Drawer.Sheet>
		</Drawer.Root>
	);
};

const ControlledDrawer = (args: DrawerExampleProps) => {
	const setOpen = useOpenArg();
	const { docs } = useOverlayFrame();

	return (
		<DrawerExample
			{...args}
			modal={docs ? false : args.modal}
			onOpenChange={(open, details) => {
				args.onOpenChange?.(open, details);
				setOpen(open);
			}}
		/>
	);
};

const drawer = () =>
	screen.findByRole("dialog", {
		name: TITLE,
	});

const button = (popup: HTMLElement, name: string) =>
	within(popup).getByRole("button", { name });

const meta = {
	component: Drawer.Root,
	render: ControlledDrawer,
	decorators: [withOverlayFrame()],
	args: {
		open: true,
		swipeDirection: "right",
		onOpenChange: fn(),
	},
	argTypes: {
		open: { control: "boolean" },
		swipeDirection: {
			control: "radio",
			options: ["right", "down"],
		},
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
} satisfies Meta<typeof Drawer.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const BottomSheet: Story = {
	tags: ["!autodocs"],
	args: { swipeDirection: "down" },
	globals: { viewport: { value: "mobile1" } },
	play: async () => {
		const popup = await drawer();

		await expect(popup).toBeVisible();
		await expect(popup).toHaveAttribute(
			"data-swipe-direction",
			"down",
		);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: DrawerExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		const popup = await drawer();
		await waitFor(() => expect(popup).toHaveFocus());
		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard(" ");
		const reopened = await drawer();
		const close = button(reopened, CLOSE_LABEL);
		const done = button(reopened, DONE_LABEL);
		await waitFor(() => expect(reopened).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(close).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(done).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(close).toHaveFocus());
		await userEvent.tab({ shift: true });
		await waitFor(() => expect(done).toHaveFocus());
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
	render: DrawerExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: OPEN_LABEL,
		});

		await userEvent.click(trigger);
		await userEvent.click(
			button(await drawer(), DONE_LABEL),
		);
		await roleGone("dialog");
		await expect(trigger).toHaveFocus();

		await userEvent.click(trigger);
		await userEvent.click(
			button(await drawer(), CLOSE_LABEL),
		);
		await roleGone("dialog");

		await userEvent.click(trigger);
		await drawer();
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
	render: DrawerExample,
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
			target: button(await drawer(), DONE_LABEL),
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
