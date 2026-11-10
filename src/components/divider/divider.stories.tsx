import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect } from "storybook/test";
import { Divider } from "./divider.tsx";

const SUBTITLE = "Earlier messages";

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Separation",
				section: "The four cases that justify a line",
			},
		],
	},
	component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("separator"),
		).toBeVisible();
	},
};

export const WithSubtitle: Story = {
	args: { subtitle: SUBTITLE },
	play: async ({ canvas }) => {
		await expect(canvas.getByText(SUBTITLE)).toBeVisible();
	},
};

const ComposedDivider = (): ReactElement => (
	<Divider.Root>
		<Divider.Rule />
		<Divider.Label>{SUBTITLE}</Divider.Label>
	</Divider.Root>
);

export const Composed: Story = {
	render: ComposedDivider,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("separator"),
		).toBeVisible();
		await expect(canvas.getByText(SUBTITLE)).toBeVisible();
	},
};
