import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import DeleteIcon from "@material-design-icons/svg/outlined/delete.svg?react";
import SaveIcon from "@material-design-icons/svg/outlined/save.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { textGone } from "../../lib/storybook/waits.ts";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { Button } from "./button.tsx";

const LABEL = "Save declaration";
const ICON_ONLY_LABEL = "Next page";

const tooltipShown = () =>
	waitFor(() =>
		expect(screen.getByText(ICON_ONLY_LABEL)).toBeVisible(),
	);

const ICONS = {
	save: SaveIcon,
	delete: DeleteIcon,
	chevronRight: ChevronRightIcon,
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
			{
				page: "Foundation/Motion",
				section:
					"Every wait has an indicator, and that indicator keeps changing",
			},
		],
	},
	component: Button,
	args: {
		children: LABEL,
		onClick: fn(),
	},
	argTypes: {
		icon: {
			options: Object.keys(ICONS),
			mapping: ICONS,
			control: "select",
		},
	},
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: { variant: "primary" },
};

export const Secondary: Story = {
	args: { variant: "secondary" },
};

export const Tertiary: Story = {
	args: { variant: "tertiary" },
};

export const Danger: Story = {
	args: {
		variant: "primary",
		tone: "danger",
		children: "Delete declaration",
	},
};

export const Submit: Story = {
	args: { variant: "primary", type: "submit" },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: LABEL }),
		).toHaveAttribute("type", "submit");
	},
};

export const Small: Story = {
	args: { size: "sm" },
};

export const Medium: Story = {
	args: { size: "md" },
};

export const Large: Story = {
	args: { size: "lg" },
};

export const WithIcon: Story = {
	args: { icon: mappedArg(ICONS, "save") },
};

export const IconOnly: Story = {
	args: {
		iconOnly: true,
		icon: mappedArg(ICONS, "chevronRight"),
		label: ICON_ONLY_LABEL,
		children: undefined,
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", {
				name: ICON_ONLY_LABEL,
			}),
		).toBeInTheDocument();
	},
};

export const Disabled: Story = {
	tags: ["!dev", "!autodocs"],
	args: { disabled: true },
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(button).not.toHaveFocus();

		await userEvent.click(button);
		await userEvent.pointer({
			keys: "[TouchA]",
			target: button,
		});

		await expect(args.onClick).not.toHaveBeenCalled();
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(button).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await expect(args.onClick).toHaveBeenCalledOnce();

		await userEvent.keyboard(" ");
		await expect(args.onClick).toHaveBeenCalledTimes(2);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: LABEL,
			}),
		);

		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: LABEL,
			}),
		});

		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const IconOnlyKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: IconOnly.args,
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

export const IconOnlyMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: IconOnly.args,
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

export const IconOnlyTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: IconOnly.args,
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
