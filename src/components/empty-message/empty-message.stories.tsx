import AddIcon from "@material-design-icons/svg/outlined/add.svg?react";
import InboxIcon from "@material-design-icons/svg/outlined/inbox.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { Button } from "../button/button.tsx";
import { EmptyMessage } from "./empty-message.tsx";
import { Icon } from "../icon/index.ts";

const TITLE = "No invoices yet";
const DESCRIPTION = "Invoices you send show up here.";
const ADD = "New invoice";

const ICONS = { none: undefined, inbox: <Icon svg={InboxIcon} label="" /> };

const ACTIONS = {
	none: undefined,
	add: (
		<Button
			variant="primary"
			icon={<Icon svg={AddIcon} label="" />}
			onClick={fn()}>
			{ADD}
		</Button>
	),
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Patterns",
				section: "An empty region says so in its own place",
			},
			{ component: "components/status-message" },
		],
	},
	component: EmptyMessage,
	args: {
		title: TITLE,
		description: DESCRIPTION,
		icon: mappedArg(ICONS, "inbox"),
	},
	argTypes: {
		icon: {
			options: Object.keys(ICONS),
			mapping: ICONS,
			control: "radio",
		},
		action: {
			options: Object.keys(ACTIONS),
			mapping: ACTIONS,
			control: "radio",
		},
	},
} satisfies Meta<typeof EmptyMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		const status = canvas.getByRole("status");

		await expect(status).toHaveTextContent(TITLE);
		await expect(status).toHaveTextContent(DESCRIPTION);
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const WithAction: Story = {
	args: { action: mappedArg(ACTIONS, "add") },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: ADD }),
		).toBeVisible();
	},
};

export const TitleOnly: Story = {
	args: {
		description: undefined,
		icon: mappedArg(ICONS, "none"),
	},
};
