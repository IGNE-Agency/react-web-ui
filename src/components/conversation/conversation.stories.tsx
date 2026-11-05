import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import DownloadIcon from "@material-design-icons/svg/outlined/download.svg?react";
import ScrollDownIcon from "@material-design-icons/svg/outlined/keyboard_arrow_down.svg?react";
import type {
	Decorator,
	Meta,
	StoryObj,
} from "@storybook/react-vite";
import { Fragment, type ReactElement } from "react";
import {
	expect,
	fn,
	userEvent,
	within,
} from "storybook/test";
import { Temporal } from "temporal-polyfill";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { STORY_TIME_ZONE } from "../../lib/storybook/story-providers.tsx";
import { SentAttachmentTile } from "../attachment-tile/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";
import {
	Conversation,
	type ConversationMessage,
} from "./conversation.tsx";
import styles from "./conversation.stories.module.scss";
import {
	type ConversationBurst,
	groupByBurst,
	groupByDay,
} from "./group-messages.ts";
import { Icon } from "../icon/index.ts";

const OWN = "Sanne de Vries";
const OTHER = "Mark Jansen";
const COLLEAGUE = "Fatima El Amrani";

const TODAY = "Today";
const YESTERDAY = "Yesterday";
const READ = "Read";
const UNREAD = "Unread";
const DOWNLOAD_ALL = "Download all files";
const SCROLL_TO_LATEST = "Scroll to latest";

const QUESTION =
	"Could you take another look at the May invoice? The hourly rate doesn't look right.";
const FOLLOW_UP = "The client called about it as well.";
const ANSWER =
	"I've corrected the rate and sent the invoice again.";
const LONG_MESSAGE =
	"The client's accounts team returned the invoice with reference AP-RETURN-2026-05-000184736251-PURCHASE-ORDER-NUMBER-MISSING. According to their explanation, every line needs the purchase order number from their system, and the signed timesheet has to be attached before they will process it again.";
const EMPTY_TITLE = "No messages yet";

const downloadAll = fn().mockName("downloadAll");
const scrollToBottom = fn().mockName("scrollToBottom");

const message = (
	id: string,
	author: string,
	side: ConversationMessage["side"],
	body: string,
	sentAt: string | Temporal.Instant,
	extra: Pick<ConversationMessage, "status" | "files"> = {},
): ConversationMessage => ({
	id,
	authorId: author,
	authorName: author,
	side,
	body,
	sentAt,
	...extra,
});

const FILE_NAMES = ["timesheet-may.pdf", "invoice-may.pdf"];

const FILES = (
	<>
		{FILE_NAMES.map(name => (
			<SentAttachmentTile
				key={name}
				name={name}
				hint={name}
				src={undefined}
				icon={<Icon svg={DescriptionIcon} label="" />}
			/>
		))}
		<Conversation.MessageFilesDownloadAll
			label={DOWNLOAD_ALL}
			onClick={downloadAll}>
			<Icon svg={DownloadIcon} label="" />
		</Conversation.MessageFilesDownloadAll>
	</>
);

const now = Temporal.Now.zonedDateTimeISO(STORY_TIME_ZONE);

const MESSAGES = {
	thread: [
		message(
			"1",
			OTHER,
			"other",
			QUESTION,
			"2026-05-26T08:12:00Z",
		),
		message(
			"2",
			OTHER,
			"other",
			FOLLOW_UP,
			"2026-05-26T08:14:00Z",
		),
		message(
			"3",
			OWN,
			"own",
			ANSWER,
			"2026-05-26T09:30:00Z",
			{
				status: "read",
			},
		),
		message(
			"4",
			COLLEAGUE,
			"colleague",
			"Thanks, I'll mark it as sent.",
			"2026-05-27T07:45:00Z",
		),
		message(
			"5",
			OTHER,
			"other",
			"Great, that settles it.",
			"2026-05-27T10:02:00Z",
		),
		message(
			"6",
			OWN,
			"own",
			FOLLOW_UP,
			"2026-05-27T10:20:00Z",
			{
				status: "unread",
			},
		),
	],
	recent: [
		message(
			"1",
			OTHER,
			"other",
			QUESTION,
			now.subtract({ days: 1 }).toInstant(),
		),
		message("2", OWN, "own", ANSWER, now.toInstant(), {
			status: "unread",
		}),
	],
	long: [
		message(
			"1",
			OTHER,
			"other",
			LONG_MESSAGE,
			"2026-05-26T08:12:00Z",
		),
		message(
			"2",
			OWN,
			"own",
			LONG_MESSAGE,
			"2026-05-26T09:30:00Z",
			{
				status: "read",
			},
		),
	],
	withFiles: [
		message(
			"1",
			OTHER,
			"other",
			QUESTION,
			"2026-05-26T08:12:00Z",
			{
				files: FILES,
			},
		),
	],
	empty: [],
} satisfies Readonly<
	Record<string, ReadonlyArray<ConversationMessage>>
>;

const SCROLL_BUTTON = {
	none: undefined,
	scrollToBottom: (
		<Conversation.ScrollToBottom
			label={SCROLL_TO_LATEST}
			onClick={scrollToBottom}>
			<Icon svg={ScrollDownIcon} label="" />
		</Conversation.ScrollToBottom>
	),
};

const Burst = ({
	messages,
}: Readonly<{
	messages: ConversationBurst<ConversationMessage>["items"];
}>) => {
	const [first] = messages;

	return (
		<Conversation.Message side={first.side}>
			<Conversation.MessageAuthor>
				<Conversation.MessageAvatar
					name={first.authorName}
				/>
				{first.authorName}
				<Conversation.MessageTimestamp
					date={first.sentAt}
				/>
			</Conversation.MessageAuthor>
			{messages.map(item => (
				<Fragment key={item.id}>
					<Conversation.MessageBubble>
						<Conversation.MessageContent>
							{item.body}
						</Conversation.MessageContent>
					</Conversation.MessageBubble>
				</Fragment>
			))}
		</Conversation.Message>
	);
};

const HandBuilt = (): ReactElement => (
	<Conversation.Root>
		{groupByDay(
			MESSAGES.thread,
			item => item.sentAt,
			useTimeZone(),
		).map(day => (
			<Conversation.Group key={day.key}>
				<Conversation.DateSeparator
					date={day.date}
					todayLabel={TODAY}
					yesterdayLabel={YESTERDAY}
				/>
				{groupByBurst(day.items, item => item.authorId).map(
					burst => (
						<Burst key={burst.key} messages={burst.items} />
					),
				)}
			</Conversation.Group>
		))}
	</Conversation.Root>
);

const inFrame: Decorator = Story => (
	<div className={styles.frame}>
		<Story />
	</div>
);

const meta = {
	parameters: {
		layout: "padded",
		test: { clearMocks: true },
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
		],
	},
	component: Conversation,
	decorators: [inFrame],
	args: {
		messages: mappedArg(MESSAGES, "thread"),
		todayLabel: TODAY,
		yesterdayLabel: YESTERDAY,
		readLabel: READ,
		unreadLabel: UNREAD,
		empty: (
			<>
				<p>{EMPTY_TITLE}</p>
				<p>Ask a question about this invoice.</p>
			</>
		),
	},
	argTypes: {
		messages: {
			options: Object.keys(MESSAGES),
			mapping: MESSAGES,
			control: "select",
		},
		children: {
			options: Object.keys(SCROLL_BUTTON),
			mapping: SCROLL_BUTTON,
			control: "select",
		},
		empty: { control: false },
	},
} satisfies Meta<typeof Conversation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Thread: Story = {
	play: async ({ canvas }) => {
		const log = canvas.getByRole("log");

		await expect(
			within(log).getAllByText(OTHER),
		).toHaveLength(2);
		await expect(
			within(log).getAllByText(OWN),
		).toHaveLength(2);
		await expect(
			within(log).getByText(UNREAD),
		).toBeInTheDocument();
	},
};

export const Recent: Story = {
	args: { messages: mappedArg(MESSAGES, "recent") },
	play: async ({ canvas }) => {
		await expect(canvas.getByText(YESTERDAY)).toBeVisible();
		await expect(canvas.getByText(TODAY)).toBeVisible();
	},
};

export const LongMessage: Story = {
	args: { messages: mappedArg(MESSAGES, "long") },
	play: async ({ canvas }) => {
		await Promise.all(
			canvas
				.getAllByText(LONG_MESSAGE)
				.map(content =>
					expect(content.scrollWidth).toBeLessThanOrEqual(
						content.clientWidth,
					),
				),
		);
	},
};

export const Clamped: Story = {
	args: {
		messages: mappedArg(MESSAGES, "long"),
		lineClamp: 3,
	},
	play: async ({ canvas }) => {
		await Promise.all(
			canvas
				.getAllByText(LONG_MESSAGE)
				.map(content =>
					expect(content.scrollHeight).toBeGreaterThan(
						content.clientHeight,
					),
				),
		);
	},
};

export const WithFiles: Story = {
	args: { messages: mappedArg(MESSAGES, "withFiles") },
};

export const ScrolledUp: Story = {
	args: {
		children: mappedArg(SCROLL_BUTTON, "scrollToBottom"),
	},
};

export const Empty: Story = {
	args: { messages: mappedArg(MESSAGES, "empty") },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText(EMPTY_TITLE),
		).toBeVisible();
	},
};

export const Parts: Story = {
	render: HandBuilt,
	play: async ({ canvas }) => {
		await expect(
			within(canvas.getByRole("log")).getAllByText(OTHER),
		).toHaveLength(2);
	},
};

export const DownloadAllKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: WithFiles.args,
	play: async ({ canvas }) => {
		const button = canvas.getByRole("button", {
			name: DOWNLOAD_ALL,
		});

		await userEvent.tab();
		await expect(button).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await expect(downloadAll).toHaveBeenCalledOnce();

		await userEvent.keyboard(" ");
		await expect(downloadAll).toHaveBeenCalledTimes(2);
	},
};

export const DownloadAllMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: WithFiles.args,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: DOWNLOAD_ALL }),
		);

		await expect(downloadAll).toHaveBeenCalledOnce();
	},
};

export const DownloadAllTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: WithFiles.args,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: DOWNLOAD_ALL,
			}),
		});

		await expect(downloadAll).toHaveBeenCalledOnce();
	},
};

export const ScrollToBottomKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: ScrolledUp.args,
	play: async ({ canvas }) => {
		const button = canvas.getByRole("button", {
			name: SCROLL_TO_LATEST,
		});

		await userEvent.tab();
		await expect(button).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await expect(scrollToBottom).toHaveBeenCalledOnce();

		await userEvent.keyboard(" ");
		await expect(scrollToBottom).toHaveBeenCalledTimes(2);
	},
};

export const ScrollToBottomMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: ScrolledUp.args,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: SCROLL_TO_LATEST,
			}),
		);

		await expect(scrollToBottom).toHaveBeenCalledOnce();
	},
};

export const ScrollToBottomTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: ScrolledUp.args,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: SCROLL_TO_LATEST,
			}),
		});

		await expect(scrollToBottom).toHaveBeenCalledOnce();
	},
};
