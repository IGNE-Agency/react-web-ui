import CheckCircleIcon from "@material-design-icons/svg/outlined/check_circle.svg?react";
import InfoIcon from "@material-design-icons/svg/outlined/info.svg?react";
import WarningAmberIcon from "@material-design-icons/svg/outlined/warning_amber.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { Icon } from "./icon.tsx";

const ICONS = {
	warning: WarningAmberIcon,
	info: InfoIcon,
	checkCircle: CheckCircleIcon,
};

const LARGE_SIZE = 2;

const ICON_LABEL = "Warning";

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Foundation/Iconography",
				section: "An app's icons come from one set",
			},
			{
				page: "Principles/Accessibility",
				section: "Decoration is `aria-hidden`",
			},
		],
	},
	component: Icon,
	args: {
		svg: mappedArg(ICONS, "warning"),
		label: "",
	},
	argTypes: {
		svg: {
			options: Object.keys(ICONS),
			mapping: ICONS,
			control: "select",
		},
	},
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Decorative: Story = {
	play: async ({ canvasElement }) => {
		await expect(
			canvasElement.querySelector("svg"),
		).toHaveAttribute("aria-hidden", "true");
	},
};

export const Labelled: Story = {
	args: { label: ICON_LABEL },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("img", {
				name: ICON_LABEL,
			}),
		).toBeInTheDocument();
	},
};

export const Large: Story = {
	args: { size: LARGE_SIZE },
};
