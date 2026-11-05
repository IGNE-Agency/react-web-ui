import type {
	Decorator,
	Meta,
	StoryObj,
} from "@storybook/react-vite";
import { Fragment, type ReactNode } from "react";
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
import type {
	ConversationMessageSide,
	ConversationMessageStatus,
} from "./conversation.context.ts";
import { Conversation } from "./conversation.tsx";
import styles from "./conversation.stories.module.scss";
import {
	type ConversationBurst,
	groupByBurst,
	groupByDay,
} from "./group-messages.ts";

type StoryMessage = Readonly<{
	id: string;
	author: string;
	side: ConversationMessageSide;
	body: string;
	sentAt: string | Temporal.Instant;
	status?: ConversationMessageStatus;
	files?: readonly string[];
}>;

const OWN = "Sanne de Vries";
const OTHER = "Mark Jansen";
const COLLEAGUE = "Fatima El Amrani";

const TODAY = "Today";
const YESTERDAY = "Yesterday";
const STATUS_LABELS: Readonly<
	Record<ConversationMessageStatus, string>
> = {
	read: "Read",
	unread: "Unread",
};
const DOWNLOAD_ALL = "Download all files";
const SCROLL_TO_LATEST = "Scroll to latest";

const QUESTION =
	"Could you take another look at the 12 May declaration? The tariff doesn't look right.";
const FOLLOW_UP = "The client called about it as well.";
const ANSWER =
	"I've corrected the tariff and resubmitted the declaration.";
const LONG_MESSAGE =
	"The insurer rejected the declaration with reference VECOZO-RETURN-2026-05-000184736251-REJECTED-TARIFF-CODE-UNKNOWN. According to their explanation, a sixty-minute group treatment needs a different service code from the one we used, and the GP's referral has to be attached before they will process it again.";
const EMPTY_TITLE = "No messages yet";

const THREAD: readonly StoryMessage[] = [
	{
		id: "1",
		author: OTHER,
		side: "other",
		body: QUESTION,
		sentAt: "2026-05-26T08:12:00Z",
	},
	{
		id: "2",
		author: OTHER,
		side: "other",
		body: FOLLOW_UP,
		sentAt: "2026-05-26T08:14:00Z",
	},
	{
		id: "3",
		author: OWN,
		side: "own",
		body: ANSWER,
		sentAt: "2026-05-26T09:30:00Z",
		status: "read",
	},
	{
		id: "4",
		author: COLLEAGUE,
		side: "colleague",
		body: "Thanks, I'll mark it as sent.",
		sentAt: "2026-05-27T07:45:00Z",
	},
	{
		id: "5",
		author: OTHER,
		side: "other",
		body: "Great, that settles it.",
		sentAt: "2026-05-27T10:02:00Z",
	},
	{
		id: "6",
		author: OWN,
		side: "own",
		body: FOLLOW_UP,
		sentAt: "2026-05-27T10:20:00Z",
		status: "unread",
	},
];

const now = Temporal.Now.zonedDateTimeISO(STORY_TIME_ZONE);

const RECENT: readonly StoryMessage[] = [
	{
		id: "1",
		author: OTHER,
		side: "other",
		body: QUESTION,
		sentAt: now.subtract({ days: 1 }).toInstant(),
	},
	{
		id: "2",
		author: OWN,
		side: "own",
		body: ANSWER,
		sentAt: now.toInstant(),
		status: "unread",
	},
];

const LONG: readonly StoryMessage[] = [
	{
		id: "1",
		author: OTHER,
		side: "other",
		body: LONG_MESSAGE,
		sentAt: "2026-05-26T08:12:00Z",
	},
	{
		id: "2",
		author: OWN,
		side: "own",
		body: LONG_MESSAGE,
		sentAt: "2026-05-26T09:30:00Z",
		status: "read",
	},
];

const WITH_FILES: readonly StoryMessage[] = [
	{
		id: "1",
		author: OTHER,
		side: "other",
		body: QUESTION,
		sentAt: "2026-05-26T08:12:00Z",
		files: ["gp-referral.pdf", "invoice-may.pdf"],
	},
];

const downloadAll = fn().mockName("downloadAll");
const scrollToBottom = fn().mockName("scrollToBottom");

const Burst = ({
	messages,
	lineClamp,
}: Readonly<{
	messages: ConversationBurst<StoryMessage>["items"];
	lineClamp?: number;
}>) => {
	const [first] = messages;

	return (
		<Conversation.Message side={first.side}>
			<Conversation.MessageAuthor>
				<Conversation.MessageAvatar name={first.author} />
				{first.author}
				<Conversation.MessageTimestamp
					date={first.sentAt}
				/>
				{first.status === undefined ? null : (
					<Conversation.MessageReadIndicator
						status={first.status}
						label={STATUS_LABELS[first.status]}
					/>
				)}
			</Conversation.MessageAuthor>
			{messages.map(message => (
				<Fragment key={message.id}>
					<Conversation.MessageBubble>
						<Conversation.MessageContent
							lineClamp={lineClamp}>
							{message.body}
						</Conversation.MessageContent>
					</Conversation.MessageBubble>
					{message.files === undefined ? null : (
						<Conversation.MessageFiles>
							{message.files.map(name => (
								<SentAttachmentTile
									key={name}
									name={name}
									hint={name}
									src={undefined}
								/>
							))}
							<Conversation.MessageFilesDownloadAll
								label={DOWNLOAD_ALL}
								onClick={downloadAll}
							/>
						</Conversation.MessageFiles>
					)}
				</Fragment>
			))}
		</Conversation.Message>
	);
};

const MessageThread = ({
	messages,
	lineClamp,
}: Readonly<{
	messages: readonly StoryMessage[];
	lineClamp?: number;
}>): ReactNode =>
	groupByDay(
		messages,
		message => message.sentAt,
		useTimeZone(),
	).map(day => (
		<Conversation.Group key={day.key}>
			<Conversation.DateSeparator
				date={day.date}
				todayLabel={TODAY}
				yesterdayLabel={YESTERDAY}
			/>
			{groupByBurst(
				day.items,
				message => message.author,
			).map(burst => (
				<Burst
					key={burst.key}
					messages={burst.items}
					lineClamp={lineClamp}
				/>
			))}
		</Conversation.Group>
	));

const CONVERSATIONS = {
	thread: <MessageThread messages={THREAD} />,
	recent: <MessageThread messages={RECENT} />,
	long: <MessageThread messages={LONG} />,
	clamped: <MessageThread messages={LONG} lineClamp={3} />,
	withFiles: <MessageThread messages={WITH_FILES} />,
	scrolledUp: (
		<>
			<MessageThread messages={THREAD} />
			<Conversation.ScrollToBottom
				label={SCROLL_TO_LATEST}
				onClick={scrollToBottom}
			/>
		</>
	),
	empty: (
		<Conversation.EmptyState>
			<p>{EMPTY_TITLE}</p>
			<p>Ask a question about this declaration.</p>
		</Conversation.EmptyState>
	),
};

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
	component: Conversation.Root,
	decorators: [inFrame],
	args: {
		children: mappedArg(CONVERSATIONS, "thread"),
	},
	argTypes: {
		children: {
			options: Object.keys(CONVERSATIONS),
			mapping: CONVERSATIONS,
			control: "select",
		},
	},
} satisfies Meta<typeof Conversation.Root>;

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
			within(log).getByText(STATUS_LABELS.unread),
		).toBeInTheDocument();
	},
};

export const Recent: Story = {
	args: { children: mappedArg(CONVERSATIONS, "recent") },
	play: async ({ canvas }) => {
		await expect(canvas.getByText(YESTERDAY)).toBeVisible();
		await expect(canvas.getByText(TODAY)).toBeVisible();
	},
};

export const LongMessage: Story = {
	args: { children: mappedArg(CONVERSATIONS, "long") },
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
	args: { children: mappedArg(CONVERSATIONS, "clamped") },
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
	args: { children: mappedArg(CONVERSATIONS, "withFiles") },
};

export const ScrolledUp: Story = {
	args: {
		children: mappedArg(CONVERSATIONS, "scrolledUp"),
	},
};

export const Empty: Story = {
	args: { children: mappedArg(CONVERSATIONS, "empty") },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText(EMPTY_TITLE),
		).toBeVisible();
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
