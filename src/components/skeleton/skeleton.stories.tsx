import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Skeleton,
	type SkeletonProps,
} from "./skeleton.tsx";
import styles from "./skeleton.stories.module.scss";

const SkeletonParagraph = (args: SkeletonProps) => (
	<div className={styles.paragraph}>
		<Skeleton {...args} />
		<Skeleton {...args} />
		<Skeleton {...args} className={styles.lastLine} />
	</div>
);

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Foundation/Motion",
				section:
					"A wait whose shape is known ahead of its content is drawn as that shape",
			},
			{
				page: "Foundation/Motion",
				section:
					"Every wait has an indicator, and that indicator keeps changing",
			},
		],
	},
	component: Skeleton,
	args: { className: styles.line },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {};

export const Paragraph: Story = {
	args: { className: undefined },
	render: SkeletonParagraph,
};
