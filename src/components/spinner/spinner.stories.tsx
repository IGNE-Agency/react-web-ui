import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./spinner.tsx";

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Foundation/Motion",
				section:
					"Every wait has an indicator, and that indicator keeps changing",
			},
		],
	},
	component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
	args: { size: 1 },
};

export const Large: Story = {
	args: { size: 3 },
};
