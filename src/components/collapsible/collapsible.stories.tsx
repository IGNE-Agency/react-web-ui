import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { Icon } from "../icon/icon.tsx";
import { Collapsible } from "./collapsible.tsx";

const TRIGGER = "Advanced settings";
const CONTENT =
	"Choose how long a declaration stays editable after it is sent.";

type Canvas = ReturnType<typeof within>;

const trigger = (canvas: Canvas) =>
	canvas.getByRole("button", { name: TRIGGER });

const opened = async (canvas: Canvas) => {
	await expect(trigger(canvas)).toHaveAttribute(
		"aria-expanded",
		"true",
	);
	await expect(
		await canvas.findByText(CONTENT),
	).toBeVisible();
};

const closed = async (canvas: Canvas) => {
	await expect(trigger(canvas)).toHaveAttribute(
		"aria-expanded",
		"false",
	);
	await waitFor(() =>
		expect(
			canvas.queryByText(CONTENT),
		).not.toBeInTheDocument(),
	);
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{
				page: "Foundation/Motion",
				section:
					"Every transition runs only for someone who hasn't asked for less motion",
			},
		],
	},
	component: Collapsible.Root,
	args: {
		children: (
			<>
				<Collapsible.Trigger>
					{TRIGGER}
					<Collapsible.Indicator>
						<Icon svg={ExpandMoreIcon} label="" />
					</Collapsible.Indicator>
				</Collapsible.Trigger>
				<Collapsible.Panel>{CONTENT}</Collapsible.Panel>
			</>
		),
	},
} satisfies Meta<typeof Collapsible.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {
	play: async ({ canvas }) => {
		await closed(canvas);
	},
};

export const Open: Story = {
	args: { defaultOpen: true },
	play: async ({ canvas }) => {
		await opened(canvas);
	},
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(trigger(canvas)).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await opened(canvas);

		await userEvent.keyboard(" ");
		await closed(canvas);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(trigger(canvas));
		await opened(canvas);

		await userEvent.click(trigger(canvas));
		await closed(canvas);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: trigger(canvas),
		});
		await opened(canvas);
	},
};
