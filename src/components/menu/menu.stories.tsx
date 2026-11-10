import ArchiveIcon from "@material-design-icons/svg/outlined/archive.svg?react";
import CommentIcon from "@material-design-icons/svg/outlined/comment.svg?react";
import DownloadIcon from "@material-design-icons/svg/outlined/download.svg?react";
import MoreVertIcon from "@material-design-icons/svg/outlined/more_vert.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { roleGone } from "../../lib/storybook/waits.ts";
import {
	useOpenArg,
	useOverlayFrame,
	withOverlayFrame,
} from "../../lib/storybook/overlay-frame.tsx";
import { Button, IconButton } from "../button/button.tsx";
import { Menu } from "./menu.tsx";
import { Icon } from "../icon/index.ts";

type MenuExampleProps = ComponentProps<typeof Menu.Root>;

const ROW_ACTIONS = "Row actions";
const ACTIONS = "Actions";
const DOWNLOAD = "Download";
const ADD_COMMENT = "Add a comment";
const ARCHIVE = "Archive";
const EXPORT = "Export";
const DOWNLOAD_CSV = "Download as CSV";
const DOWNLOAD_PDF = "Download as PDF";

const download = fn().mockName("download");
const comment = fn().mockName("comment");
const exportCsv = fn().mockName("exportCsv");
const exportPdf = fn().mockName("exportPdf");

const MenuItems = () => {
	const { container } = useOverlayFrame();

	return (
		<Menu.Content container={container} sideOffset={8}>
			<Menu.Arrow />
			<Menu.Item onClick={download}>
				<Icon svg={DownloadIcon} label="" />
				{DOWNLOAD}
			</Menu.Item>
			<Menu.Item onClick={comment}>
				<Icon svg={CommentIcon} label="" />
				{ADD_COMMENT}
			</Menu.Item>
			<Menu.Item disabled>
				<Icon svg={ArchiveIcon} label="" />
				{ARCHIVE}
			</Menu.Item>
			<Menu.Separator />
			<Menu.Group>
				<Menu.GroupLabel>{EXPORT}</Menu.GroupLabel>
				<Menu.Item onClick={exportCsv}>
					{DOWNLOAD_CSV}
				</Menu.Item>
				<Menu.Item onClick={exportPdf}>
					{DOWNLOAD_PDF}
				</Menu.Item>
			</Menu.Group>
		</Menu.Content>
	);
};

const MenuExample = (props: MenuExampleProps) => (
	<Menu.Root {...props}>
		<Menu.Trigger
			render={
				<IconButton label={ROW_ACTIONS} variant="tertiary">
					<Icon svg={MoreVertIcon} label="" />
				</IconButton>
			}
		/>
		<MenuItems />
	</Menu.Root>
);

const TextTriggerMenu = (props: MenuExampleProps) => (
	<Menu.Root {...props}>
		<Menu.Trigger
			render={
				<Button variant="secondary">{ACTIONS}</Button>
			}
		/>
		<MenuItems />
	</Menu.Root>
);

const useControlledMenu = (
	args: MenuExampleProps,
): MenuExampleProps => {
	const setOpen = useOpenArg();
	const { docs } = useOverlayFrame();

	return {
		...args,
		modal: docs ? false : args.modal,
		onOpenChange: (open, details) => {
			args.onOpenChange?.(open, details);
			setOpen(open);
		},
	};
};

const ControlledMenu = (args: MenuExampleProps) => {
	const props = useControlledMenu(args);

	return <MenuExample {...props} />;
};

const ControlledTextTriggerMenu = (
	args: MenuExampleProps,
) => {
	const props = useControlledMenu(args);

	return <TextTriggerMenu {...props} />;
};

const item = (name: string) =>
	screen.findByRole("menuitem", { name });

const highlighted = (name: string) =>
	waitFor(() =>
		expect(
			screen.getByRole("menuitem", { name }),
		).toHaveFocus(),
	);

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Above the page" },
			{
				page: "Patterns",
				section:
					"Every popup that lists things shares one surface and one row",
			},
			{
				page: "Foundation/Elevation",
				section:
					"A popup with an arrow casts one shadow around the whole silhouette",
			},
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
		],
	},
	component: Menu.Root,
	render: ControlledMenu,
	decorators: [withOverlayFrame("medium")],
	args: {
		open: true,
		onOpenChange: fn(),
	},
	argTypes: {
		open: { control: "boolean" },
	},
} satisfies Meta<typeof Menu.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
	play: async () => {
		await expect(
			await screen.findByRole("group", {
				name: EXPORT,
			}),
		).toBeVisible();
		await expect(await item(ARCHIVE)).toHaveAttribute(
			"aria-disabled",
			"true",
		);
	},
};

export const TextTrigger: Story = {
	render: ControlledTextTriggerMenu,
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: MenuExample,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: ROW_ACTIONS,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await highlighted(DOWNLOAD);
		await userEvent.keyboard("{ArrowDown}");
		await highlighted(ADD_COMMENT);
		await userEvent.keyboard("{ArrowUp}");
		await highlighted(DOWNLOAD);
		await userEvent.keyboard("{End}");
		await highlighted(DOWNLOAD_PDF);
		await userEvent.keyboard("{Escape}");
		await roleGone("menu");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard(" ");
		await highlighted(DOWNLOAD);
		await userEvent.keyboard("{ArrowDown}");
		await highlighted(ADD_COMMENT);
		await userEvent.keyboard("{Enter}");
		await roleGone("menu");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{ArrowDown}");
		await highlighted(DOWNLOAD);
		await userEvent.keyboard("{ArrowUp}");
		await highlighted(DOWNLOAD_PDF);
		await userEvent.keyboard("{ArrowUp}");
		await highlighted(DOWNLOAD_CSV);
		await userEvent.keyboard(" ");
		await roleGone("menu");

		await expect(comment).toHaveBeenCalledOnce();
		await expect(exportCsv).toHaveBeenCalledOnce();
		await expect(download).not.toHaveBeenCalled();
		await expect(exportPdf).not.toHaveBeenCalled();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: TextTriggerMenu,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: ACTIONS,
		});

		await userEvent.click(trigger);
		await userEvent.click(await item(ARCHIVE));
		await expect(await item(ARCHIVE)).toBeInTheDocument();
		await userEvent.click(await item(DOWNLOAD));
		await roleGone("menu");

		await userEvent.click(trigger);
		await item(DOWNLOAD);
		await userEvent.click(document.body);
		await roleGone("menu");

		await expect(download).toHaveBeenCalledOnce();
		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			4,
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: MenuExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: ROW_ACTIONS,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: trigger,
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await item(DOWNLOAD_PDF),
		});
		await roleGone("menu");

		await userEvent.pointer({
			keys: "[TouchA]",
			target: trigger,
		});
		await item(DOWNLOAD);
		await userEvent.pointer({
			keys: "[TouchA]",
			target: document.body,
		});
		await roleGone("menu");

		await expect(exportPdf).toHaveBeenCalledOnce();
		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			4,
		);
	},
};
