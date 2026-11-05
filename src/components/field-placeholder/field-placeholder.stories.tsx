import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { FieldPlaceholder } from "./field-placeholder.tsx";
import style from "./field-placeholder.stories.module.scss";

const FramedPlaceholder = () => (
	<div className={style.frame}>
		<FieldPlaceholder />
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
					"A placeholder is hidden from assistive technology, and its region announces the wait once",
			},
			{ component: "components/field" },
		],
	},
	component: FieldPlaceholder,
	render: FramedPlaceholder,
} satisfies Meta<typeof FieldPlaceholder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const skeletons = [
			...canvasElement.querySelectorAll("span"),
		];
		await expect(skeletons.length).toBeGreaterThan(0);
		await expect(
			skeletons.filter(
				skeleton =>
					skeleton.getAttribute("aria-hidden") !== "true",
			),
		).toEqual([]);
	},
};
