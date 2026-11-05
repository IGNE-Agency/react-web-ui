import ErrorIcon from "@material-design-icons/svg/outlined/error.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";
import { expect } from "storybook/test";
import { Tag } from "./tag.tsx";

type TagStoryProps = ComponentProps<typeof Tag.Root>;

const INFO_LABEL = "Outstanding";
const ERROR_LABEL = "Returned";

const DotTag = ({
	children,
	...args
}: TagStoryProps): ReactElement => (
	<Tag.Root {...args}>
		<Tag.Dot />
		{children}
	</Tag.Root>
);

const IconTag = ({
	children,
	...args
}: TagStoryProps): ReactElement => (
	<Tag.Root {...args}>
		<Tag.Icon svg={ErrorIcon} />
		{children}
	</Tag.Root>
);

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Patterns",
				section: "Labels pinned to things",
			},
			{ component: "components/tag-group" },
		],
	},
	component: Tag.Root,
	args: {
		children: "Ready",
	},
} satisfies Meta<typeof Tag.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
	args: { tone: "neutral" },
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Ready")).toHaveAttribute(
			"data-tone",
			"neutral",
		);
	},
};

export const Info: Story = {
	args: { tone: "info", children: INFO_LABEL },
};

export const Success: Story = {
	args: {
		tone: "success",
		children: "Processed",
	},
};

export const Warning: Story = {
	args: {
		tone: "warning",
		children: "Incomplete",
	},
};

export const ErrorTone: Story = {
	name: "Error",
	args: { tone: "error", children: ERROR_LABEL },
};

export const Solid: Story = {
	args: { variant: "solid" },
};

export const Outline: Story = {
	args: { variant: "outline" },
};

export const WithDot: Story = {
	args: { tone: "info", children: INFO_LABEL },
	render: DotTag,
};

export const WithIcon: Story = {
	args: { tone: "error", children: ERROR_LABEL },
	render: IconTag,
};
