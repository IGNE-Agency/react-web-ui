import RestartIcon from "@material-design-icons/svg/outlined/restart_alt.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement, ReactNode } from "react";
import {
	expect,
	fn,
	userEvent,
	waitFor,
} from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { Icon } from "../icon/icon.tsx";
import { ErrorBoundary } from "./error-boundary.tsx";

const CONTENT = "The declaration has loaded.";
const TITLE = "This part could not be shown";
const DESCRIPTION =
	"The rest of the page still works. Try again in a moment.";
const RETRY = "Try again";
const CUSTOM = "Something went wrong here.";

const reset = fn();
const caught = fn();

const Throwing = (): ReactNode => {
	throw new Error("The declaration could not be rendered.");
};

const CHILDREN = {
	healthy: <p>{CONTENT}</p>,
	throwing: <Throwing />,
};

const customFallback = (): ReactNode => <p>{CUSTOM}</p>;

const WithCustomFallback = (): ReactElement => (
	<ErrorBoundary fallbackRender={customFallback}>
		<Throwing />
	</ErrorBoundary>
);

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{
				page: "Patterns",
				section:
					"A failure keeps what is already on screen",
			},
			{
				page: "Patterns",
				section:
					"Trying again is offered only when it can help",
			},
			{ component: "components/error-message" },
		],
	},
	component: ErrorBoundary,
	args: {
		title: TITLE,
		description: DESCRIPTION,
		retryLabel: RETRY,
		retryIcon: <Icon svg={RestartIcon} label="" />,
		onReset: reset,
		onError: caught,
		children: mappedArg(CHILDREN, "healthy"),
	},
	argTypes: {
		retryIcon: { control: false },
		children: {
			options: Object.keys(CHILDREN),
			mapping: CHILDREN,
			control: "radio",
		},
	},
} satisfies Meta<typeof ErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByText(CONTENT)).toBeVisible();
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const Caught: Story = {
	args: { children: mappedArg(CHILDREN, "throwing") },
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(canvas.getByRole("alert")).toHaveTextContent(
				TITLE,
			),
		);
		await expect(
			canvas.queryByText(CONTENT),
		).not.toBeInTheDocument();
		await expect(caught).toHaveBeenCalledOnce();
	},
};

export const WithoutRetry: Story = {
	args: {
		children: mappedArg(CHILDREN, "throwing"),
		retryLabel: undefined,
	},
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("alert"),
		).toBeVisible();
		await expect(
			canvas.queryByRole("button"),
		).not.toBeInTheDocument();
	},
};

export const CustomFallback: Story = {
	render: WithCustomFallback,
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByText(CUSTOM),
		).toBeVisible();
	},
};

export const RetryKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: Caught.args,
	play: async ({ canvas }) => {
		const retry = await canvas.findByRole("button", {
			name: RETRY,
		});

		await userEvent.tab();
		await expect(retry).toHaveFocus();
		await userEvent.keyboard("{Enter}");

		await expect(reset).toHaveBeenCalledOnce();
		await expect(
			await canvas.findByRole("alert"),
		).toHaveTextContent(TITLE);
	},
};

export const RetryMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: Caught.args,
	play: async ({ canvas }) => {
		await userEvent.click(
			await canvas.findByRole("button", { name: RETRY }),
		);

		await expect(reset).toHaveBeenCalledOnce();
	},
};

export const RetryTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: Caught.args,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await canvas.findByRole("button", {
				name: RETRY,
			}),
		});

		await expect(reset).toHaveBeenCalledOnce();
	},
};
