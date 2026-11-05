import ErrorIcon from "@material-design-icons/svg/outlined/error_outline.svg?react";
import InboxIcon from "@material-design-icons/svg/outlined/inbox.svg?react";
import RestartIcon from "@material-design-icons/svg/outlined/restart_alt.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	type ReactElement,
	type ReactNode,
	useState,
} from "react";
import { expect, fn, userEvent } from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { Button } from "../button/button.tsx";
import {
	StatusMessage,
	type StatusMessageRootProps,
} from "./status-message.tsx";
import { Icon } from "../icon/index.ts";

const EMPTY_TITLE = "No invoices yet";
const EMPTY_BODY = "Invoices you send show up here.";
const ERROR_TITLE = "The invoices could not be loaded";
const ERROR_BODY =
	"Check your connection, then try again in a moment.";
const RETRY = "Try again";
const WELCOME_TITLE = "Welcome to your invoices";
const SHOW = "Show the message";

const retried = fn();

const Mark = (): ReactNode => (
	<svg viewBox="0 0 48 48" width="64" height="64">
		<circle
			cx="24"
			cy="24"
			r="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="4"
		/>
		<path
			d="M16 25l6 6 11-13"
			fill="none"
			stroke="currentColor"
			strokeWidth="4"
		/>
	</svg>
);

const CONTENT = {
	empty: (
		<>
			<StatusMessage.Icon><Icon svg={InboxIcon} label="" /></StatusMessage.Icon>
			<StatusMessage.Title>
				{EMPTY_TITLE}
			</StatusMessage.Title>
			<StatusMessage.Description>
				{EMPTY_BODY}
			</StatusMessage.Description>
		</>
	),
	error: (
		<>
			<StatusMessage.Icon tone="error"><Icon svg={ErrorIcon} label="" /></StatusMessage.Icon>
			<StatusMessage.Title>
				{ERROR_TITLE}
			</StatusMessage.Title>
			<StatusMessage.Description>
				{ERROR_BODY}
			</StatusMessage.Description>
			<StatusMessage.Action>
				<Button
					variant="primary"
					icon={<Icon svg={RestartIcon} label="" />}
					onClick={retried}>
					{RETRY}
				</Button>
			</StatusMessage.Action>
		</>
	),
	illustration: (
		<>
			<StatusMessage.Illustration>
				<Mark />
			</StatusMessage.Illustration>
			<StatusMessage.Title render={<h2 />}>
				{WELCOME_TITLE}
			</StatusMessage.Title>
		</>
	),
};

const ShowsLater = ({
	live,
}: StatusMessageRootProps): ReactElement => {
	const [shown, setShown] = useState(false);

	return (
		<>
			<Button onClick={() => setShown(true)}>{SHOW}</Button>
			<StatusMessage.Root live={live}>
				{shown ? CONTENT.empty : null}
			</StatusMessage.Root>
		</>
	);
};

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{
				page: "Patterns",
				section: "An empty region says so in its own place",
			},
			{
				page: "Patterns",
				section:
					"A failure keeps what is already on screen",
			},
			{
				page: "Patterns",
				section:
					"Feedback appears where the user is looking",
			},
		],
	},
	component: StatusMessage.Root,
	args: {
		live: "status",
		children: mappedArg(CONTENT, "empty"),
	},
	argTypes: {
		children: {
			options: Object.keys(CONTENT),
			mapping: CONTENT,
			control: "radio",
		},
	},
} satisfies Meta<typeof StatusMessage.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Status: Story = {
	play: async ({ canvas }) => {
		const status = canvas.getByRole("status");

		await expect(status).toHaveTextContent(EMPTY_TITLE);
		await expect(status).toHaveTextContent(EMPTY_BODY);
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const Alert: Story = {
	args: {
		live: "alert",
		children: mappedArg(CONTENT, "error"),
	},
	play: async ({ canvas }) => {
		const alert = canvas.getByRole("alert");

		await expect(alert).toHaveTextContent(ERROR_TITLE);
		await expect(
			canvas.getByRole("button", { name: RETRY }),
		).toBeVisible();
		await expect(
			canvas.queryByRole("status"),
		).not.toBeInTheDocument();
	},
};

export const Quiet: Story = {
	args: {
		live: undefined,
		children: mappedArg(CONTENT, "illustration"),
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("heading", {
				level: 2,
				name: WELCOME_TITLE,
			}),
		).toBeVisible();
		await expect(
			canvas.queryByRole("status"),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByRole("alert"),
		).not.toBeInTheDocument();
	},
};

export const AnnouncesWhatAppears: Story = {
	tags: ["!dev", "!autodocs"],
	render: ShowsLater,
	play: async ({ canvas }) => {
		const status = canvas.getByRole("status");

		await expect(status).toBeEmptyDOMElement();

		await userEvent.click(
			canvas.getByRole("button", { name: SHOW }),
		);

		await expect(canvas.getByRole("status")).toBe(status);
		await expect(status).toHaveTextContent(EMPTY_TITLE);
	},
};

export const ActionKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: Alert.args,
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: RETRY }),
		).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await expect(retried).toHaveBeenCalledOnce();
	},
};
