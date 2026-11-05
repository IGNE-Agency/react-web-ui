import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ErrorText } from "./error-text.tsx";

const MESSAGE = "Enter a valid email address.";
const SECOND_MESSAGE =
	"Enter a password of at least 12 characters.";

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Accessibility",
				section:
					"A description and an error chain into `aria-describedby`",
			},
			{
				page: "Principles/Accessibility",
				section: "A field's error is its only live region",
			},
			{
				page: "Foundation/Motion",
				section:
					"Every transition runs only for someone who hasn't asked for less motion",
			},
			{ component: "components/form" },
		],
	},
	component: ErrorText,
	args: {
		children: MESSAGE,
	},
} satisfies Meta<typeof ErrorText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
	play: async ({ canvas }) => {
		const text = canvas.getByText(MESSAGE);
		await expect(
			text.parentElement?.style.getPropertyValue(
				"--error-index",
			),
		).toBe("0");
		await waitFor(() => expect(text).toBeVisible());
	},
};

export const Multiple: Story = {
	args: {
		children: [MESSAGE, SECOND_MESSAGE],
	},
	play: async ({ canvas }) => {
		const lines = [
			canvas.getByText(MESSAGE),
			canvas.getByText(SECOND_MESSAGE),
		];
		await Promise.all(
			lines.map(line =>
				waitFor(() => expect(line).toBeVisible()),
			),
		);
	},
};

export const Inline: Story = {
	args: { el: "span" },
};

export const Empty: Story = {
	args: { children: [null, false, ""] },
	play: async ({ canvasElement }) => {
		await expect(canvasElement).toBeEmptyDOMElement();
	},
};
