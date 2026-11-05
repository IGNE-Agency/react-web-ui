import ErrorIcon from "@material-design-icons/svg/outlined/error_outline.svg?react";
import RestartIcon from "@material-design-icons/svg/outlined/restart_alt.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { Button } from "../button/button.tsx";
import { ErrorMessage } from "./error-message.tsx";

const TITLE = "The declarations could not be loaded";
const RETRYABLE =
	"Check your connection, then try again in a moment.";
const BROKEN =
	"Trying again won't help. Report this to the app's administrator.";
const RETRY = "Try again";

const ICONS = { none: undefined, error: ErrorIcon };

const ACTIONS = {
	none: undefined,
	retry: (
		<Button
			variant="primary"
			icon={RestartIcon}
			onClick={fn()}>
			{RETRY}
		</Button>
	),
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Patterns",
				section:
					"Trying again is offered only when it can help",
			},
			{
				page: "Principles/Language",
				section:
					"An error says what happened and what to do next",
			},
			{ component: "components/status-message" },
		],
	},
	component: ErrorMessage,
	args: {
		title: TITLE,
		description: RETRYABLE,
		icon: mappedArg(ICONS, "error"),
		action: mappedArg(ACTIONS, "retry"),
	},
	argTypes: {
		icon: {
			options: Object.keys(ICONS),
			mapping: ICONS,
			control: "radio",
		},
		action: {
			options: Object.keys(ACTIONS),
			mapping: ACTIONS,
			control: "radio",
		},
	},
} satisfies Meta<typeof ErrorMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Retryable: Story = {
	play: async ({ canvas }) => {
		const alert = canvas.getByRole("alert");

		await expect(alert).toHaveTextContent(TITLE);
		await expect(alert).toHaveTextContent(RETRYABLE);
		await expect(
			canvas.getByRole("button", { name: RETRY }),
		).toBeVisible();
		await expect(
			canvas.queryByRole("status"),
		).not.toBeInTheDocument();
	},
};

export const Broken: Story = {
	args: {
		description: BROKEN,
		action: mappedArg(ACTIONS, "none"),
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("alert"),
		).toHaveTextContent(BROKEN);
		await expect(
			canvas.queryByRole("button"),
		).not.toBeInTheDocument();
	},
};
