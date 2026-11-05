import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, waitFor } from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { LoadingMessage } from "./loading-message.tsx";

const TITLE = "Loading your declarations";
const DESCRIPTION = "This can take a few seconds.";

const Mark = (): ReactNode => (
	<svg viewBox="0 0 48 48" width="64" height="64">
		<rect
			x="8"
			y="8"
			width="32"
			height="32"
			rx="8"
			fill="none"
			stroke="currentColor"
			strokeWidth="4"
		/>
	</svg>
);

const ILLUSTRATIONS = {
	spinner: undefined,
	logo: <Mark />,
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Foundation/Motion",
				section:
					"A wait announces itself late, and then stays a moment",
			},
			{
				page: "Foundation/Motion",
				section:
					"Every wait has an indicator, and that indicator keeps changing",
			},
			{
				page: "Patterns",
				section: "A wait is drawn in the region that waits",
			},
			{ component: "components/status-message" },
		],
	},
	component: LoadingMessage,
	args: {
		title: TITLE,
		busyAfter: 0,
	},
	argTypes: {
		illustration: {
			options: Object.keys(ILLUSTRATIONS),
			mapping: ILLUSTRATIONS,
			control: "radio",
		},
	},
} satisfies Meta<typeof LoadingMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(canvas.getByRole("status")).toHaveTextContent(
				TITLE,
			),
		);
	},
};

export const WithDescription: Story = {
	args: { description: DESCRIPTION },
};

export const WithLogo: Story = {
	args: { illustration: mappedArg(ILLUSTRATIONS, "logo") },
};

export const AnnouncesLate: Story = {
	tags: ["!dev", "!autodocs"],
	args: { busyAfter: 1000 },
	play: async ({ canvas }) => {
		const status = canvas.getByRole("status");

		await expect(status).toBeEmptyDOMElement();

		await waitFor(
			() => expect(status).toHaveTextContent(TITLE),
			{ timeout: 2000 },
		);
		await expect(canvas.getByRole("status")).toBe(status);
	},
};
