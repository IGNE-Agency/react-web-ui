import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge.tsx";

const COUNT = 12;

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Patterns",
				section: "Labels pinned to things",
			},
		],
	},
	component: Badge,
	args: {
		children: "New",
	},
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
	args: { tone: "neutral" },
};

export const Info: Story = {
	args: { tone: "info" },
};

export const Success: Story = {
	args: { tone: "success" },
};

export const Warning: Story = {
	args: { tone: "warning" },
};

export const ErrorTone: Story = {
	name: "Error",
	args: { tone: "error" },
};

export const Solid: Story = {
	args: { variant: "solid" },
};

export const Outline: Story = {
	args: { variant: "outline" },
};

export const Count: Story = {
	args: { tone: "info", children: COUNT },
};
