import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { textGone } from "../../lib/storybook/waits.ts";
import { Icon } from "../icon/index.ts";
import { IconButton } from "./button.tsx";

const ICON_ONLY_LABEL = "Next page";

const tooltipShown = () =>
	waitFor(() =>
		expect(screen.getByText(ICON_ONLY_LABEL)).toBeVisible(),
	);

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
			{ component: "components/button" },
		],
	},
	component: IconButton,
	args: {
		label: ICON_ONLY_LABEL,
		children: <Icon svg={ChevronRightIcon} label="" />,
		onClick: fn(),
	},
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", {
				name: ICON_ONLY_LABEL,
			}),
		).toBeInTheDocument();
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", {
			name: ICON_ONLY_LABEL,
		});

		await userEvent.tab();
		await expect(button).toHaveFocus();
		await tooltipShown();

		await userEvent.keyboard("{Enter}");
		await expect(args.onClick).toHaveBeenCalledOnce();

		await userEvent.keyboard("{Escape}");
		await textGone(ICON_ONLY_LABEL);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", {
			name: ICON_ONLY_LABEL,
		});

		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledOnce();

		await userEvent.hover(button);
		await tooltipShown();

		await userEvent.unhover(button);
		await textGone(ICON_ONLY_LABEL);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: ICON_ONLY_LABEL,
			}),
		});

		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};
