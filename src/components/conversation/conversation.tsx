import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentProps,
	Fragment,
	type ReactElement,
	type ReactNode,
} from "react";
import {
	Intl as TemporalIntl,
	Temporal,
} from "temporal-polyfill";
import {
	Avatar,
	type AvatarProps,
} from "../avatar/index.ts";
import { IconButton } from "../button/index.ts";
import { useLocale } from "../locale-provider/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";
import type {
	ConversationMessageSide,
	ConversationMessageStatus,
} from "./conversation.context.ts";
import style from "./conversation.module.scss";
import {
	groupByBurst,
	groupByDay,
} from "./group-messages.ts";
import {
	type ConversationMoment,
	toZonedDateTime,
} from "./moment.ts";

const MISSING = "-";

export type ConversationRootProps =
	useRender.ComponentProps<"div">;

/**
 * A conversation's message log: a polite live region that announces new
 * messages, holding day groups of messages.
 */
const Root = ({
	className,
	render,
	...props
}: ConversationRootProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: mergeProps<"div">(
			{
				role: "log",
				"aria-live": "polite",
				className: clsx(style.root, className),
			},
			props,
		),
	});

export type ConversationGroupProps =
	useRender.ComponentProps<"section">;

/** One day's messages, under its `DateSeparator`. */
const Group = ({
	className,
	render,
	...props
}: ConversationGroupProps): ReactElement =>
	useRender({
		defaultTagName: "section",
		render,
		props: mergeProps<"section">(
			{ className: clsx(style.group, className) },
			props,
		),
	});

export type ConversationGroupSeparatorProps =
	useRender.ComponentProps<"div">;

/** A pill heading a group that sticks to the top while its group scrolls by. */
const GroupSeparator = ({
	className,
	render,
	...props
}: ConversationGroupSeparatorProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: mergeProps<"div">(
			{ className: clsx(style.groupSeparator, className) },
			props,
		),
	});

export type ConversationDateSeparatorProps = Readonly<{
	date: ConversationMoment;
	/** What the separator says for today's messages, such as "Today". */
	todayLabel: string;
	/** What the separator says for yesterday's messages, such as "Yesterday". */
	yesterdayLabel: string;
}> &
	Omit<ConversationGroupSeparatorProps, "children">;

/**
 * A `GroupSeparator` naming the day of `date` in the provider's time zone:
 * `todayLabel`, `yesterdayLabel`, or the long date.
 */
const DateSeparator = ({
	date,
	todayLabel,
	yesterdayLabel,
	...props
}: ConversationDateSeparatorProps): ReactNode => {
	const locale = useLocale();
	const timeZone = useTimeZone();
	const zoned = toZonedDateTime(date, timeZone);
	const label = (): string => {
		if (zoned === null) {
			return MISSING;
		}
		const day = zoned.toPlainDate();
		const today = Temporal.Now.plainDateISO(timeZone);
		if (day.equals(today)) {
			return todayLabel;
		}
		if (day.equals(today.subtract({ days: 1 }))) {
			return yesterdayLabel;
		}
		return new TemporalIntl.DateTimeFormat(locale, {
			dateStyle: "long",
			timeZone,
		}).format(zoned.toInstant());
	};

	return (
		<GroupSeparator {...props}>{label()}</GroupSeparator>
	);
};

export type ConversationMessageProps = Readonly<{
	side: ConversationMessageSide;
}> &
	useRender.ComponentProps<"div">;

/** A burst of messages from one author, aligned to its `side`. */
const Message = ({
	side,
	className,
	render,
	...props
}: ConversationMessageProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: {
			...props,
			className: clsx(style.message, className),
			"data-side": side,
		},
	});

export type ConversationMessageBubbleProps =
	useRender.ComponentProps<"div">;

/** One message's bubble, pointed toward its author. */
const MessageBubble = ({
	className,
	render,
	...props
}: ConversationMessageBubbleProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: mergeProps<"div">(
			{ className: clsx(style.messageBubble, className) },
			props,
		),
	});

export type ConversationMessageAuthorProps = Readonly<{
	/** Aligns an author line rendered outside a `Message`. */
	side?: ConversationMessageSide;
}> &
	useRender.ComponentProps<"div">;

/** The line above a burst: avatar, name, timestamp and read status. */
const MessageAuthor = ({
	side,
	className,
	render,
	...props
}: ConversationMessageAuthorProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: {
			...props,
			className: clsx(style.messageAuthor, className),
			"data-side": side,
		},
	});

export type ConversationMessageAvatarProps = AvatarProps;

/** The author's `Avatar`, sized for the author line: 1.5em unless `size` says otherwise. */
const MessageAvatar = ({
	size = 1.5,
	className,
	...props
}: ConversationMessageAvatarProps): ReactNode => (
	<Avatar
		{...props}
		size={size}
		className={clsx(style.messageAvatar, className)}
	/>
);

export type ConversationMessageTimestampProps = Readonly<{
	date: ConversationMoment;
	/** Shows the date as well as the time. @default false */
	withDate?: boolean;
}> &
	Omit<
		useRender.ComponentProps<"time">,
		"children" | "dateTime"
	>;

/** When a message was sent, in the provider's locale and time zone. */
const MessageTimestamp = ({
	date,
	withDate = false,
	className,
	render,
	...props
}: ConversationMessageTimestampProps): ReactElement => {
	const locale = useLocale();
	const timeZone = useTimeZone();
	const zoned = toZonedDateTime(date, timeZone);
	const formatter = new TemporalIntl.DateTimeFormat(
		locale,
		withDate
			? { dateStyle: "short", timeStyle: "short", timeZone }
			: { timeStyle: "short", timeZone },
	);

	return useRender({
		defaultTagName: "time",
		render,
		props: mergeProps<"time">(
			{
				dateTime: zoned
					?.toInstant()
					.toString({ fractionalSecondDigits: 3 }),
				className: clsx(style.messageTimestamp, className),
				children:
					zoned === null
						? MISSING
						: formatter.format(zoned.toInstant()),
			},
			props,
		),
	});
};

export type ConversationMessageReadIndicatorProps =
	Readonly<{
		status: ConversationMessageStatus;
		/** What the status is announced as, such as "Read" or "Unread". */
		label: string;
		/** Replaces the dot shown for the status. */
		children?: ReactNode;
	}> &
		Omit<ComponentProps<"div">, "children">;

/** Whether the other party has read the message: a dot, and its `label` for assistive tech. */
const MessageReadIndicator = ({
	status,
	label,
	className,
	children,
	...props
}: ConversationMessageReadIndicatorProps): ReactNode => (
	<div
		className={clsx(style.messageReadIndicator, className)}
		data-status={status}
		{...props}>
		{children ?? (
			<span
				aria-hidden="true"
				className={style.statusDot}
			/>
		)}
		<span className={style.visuallyHidden}>{label}</span>
	</div>
);

export type ConversationMessageContentProps = Readonly<{
	/** Cuts the text off after this many lines. */
	lineClamp?: number;
}> &
	useRender.ComponentProps<"div">;

/** A message's text, wrapped anywhere and kept as typed. */
const MessageContent = ({
	lineClamp,
	className,
	render,
	style: inlineStyle,
	...props
}: ConversationMessageContentProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: {
			...props,
			className: clsx(style.messageContent, className),
			"data-clamped":
				lineClamp === undefined ? undefined : "",
			style:
				lineClamp === undefined
					? inlineStyle
					: { ...inlineStyle, "--line-clamp": lineClamp },
		},
	});

export type ConversationMessageFilesProps =
	useRender.ComponentProps<"div">;

/** The files sent with a message, as a wrapping row of tiles. */
const MessageFiles = ({
	className,
	render,
	...props
}: ConversationMessageFilesProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: mergeProps<"div">(
			{ className: clsx(style.messageFiles, className) },
			props,
		),
	});

export type ConversationMessageFilesDownloadAllProps =
	Readonly<{
		/** The button's accessible name and tooltip, such as "Download all files". */
		label: string;
		/** The download glyph. */
		children: ReactNode;
	}> &
		Omit<useRender.ComponentProps<"button">, "children">;

/** An icon button that downloads every file of a message; its children are the glyph. */
const MessageFilesDownloadAll = ({
	label,
	children,
	render,
	...props
}: ConversationMessageFilesDownloadAllProps): ReactElement =>
	useRender({
		defaultTagName: "button",
		render: render ?? (
			<IconButton
				variant="tertiary"
				size="sm"
				label={label}>
				{children}
			</IconButton>
		),
		props: mergeProps<"button">(
			{
				type: "button",
				children:
					render === undefined ? undefined : children,
			},
			props,
		),
	});

export type ConversationScrollToBottomProps = Readonly<{
	/** The button's accessible name and tooltip, such as "Scroll to latest". */
	label: string;
	/** The jump glyph, such as a down arrow. */
	children: ReactNode;
}> &
	Omit<useRender.ComponentProps<"button">, "children">;

/** An icon button, pinned to the log's bottom corner, that jumps to the latest message; its children are the glyph. */
const ScrollToBottom = ({
	label,
	children,
	className,
	render,
	...props
}: ConversationScrollToBottomProps): ReactElement =>
	useRender({
		defaultTagName: "button",
		render: render ?? (
			<IconButton variant="tertiary" label={label}>
				{children}
			</IconButton>
		),
		props: mergeProps<"button">(
			{
				type: "button",
				className: clsx(style.scrollToBottom, className),
				children:
					render === undefined ? undefined : children,
			},
			props,
		),
	});

export type ConversationEmptyStateProps =
	useRender.ComponentProps<"div">;

/** What the log shows before there are any messages. */
const EmptyState = ({
	className,
	render,
	...props
}: ConversationEmptyStateProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: mergeProps<"div">(
			{ className: clsx(style.emptyState, className) },
			props,
		),
	});

/** One message, as the `Conversation` prefab takes it. */
export type ConversationMessage = Readonly<{
	id: string;
	/** Who sent it. Consecutive messages with the same author form one burst. */
	authorId: string;
	/** The author's display name, shown above the burst and drawn as initials. */
	authorName: string;
	side: ConversationMessageSide;
	sentAt: ConversationMoment;
	/** The message's text. */
	body: ReactNode;
	/** Whether the other party has read it. A burst shows its last message's status. */
	status?: ConversationMessageStatus;
	/** The files sent with it, such as `SentAttachmentTile`s, laid out as a row. */
	files?: ReactNode;
}>;

export type ConversationProps = Omit<
	ConversationRootProps,
	"children"
> &
	Readonly<{
		/** The messages, oldest first. */
		messages: ReadonlyArray<ConversationMessage>;
		/** What the separator says for today's messages, such as "Today". */
		todayLabel: string;
		/** What the separator says for yesterday's messages, such as "Yesterday". */
		yesterdayLabel: string;
		/** What a read message's status is announced as, such as "Read". */
		readLabel: string;
		/** What an unread message's status is announced as, such as "Unread". */
		unreadLabel: string;
		/** Cuts each message's text off after this many lines. */
		lineClamp?: number;
		/** What the log shows while there are no messages. */
		empty?: ReactNode;
		/** Anything after the messages, such as a `ScrollToBottom`. */
		children?: ReactNode;
	}>;

const Prefab = ({
	messages,
	todayLabel,
	yesterdayLabel,
	readLabel,
	unreadLabel,
	lineClamp,
	empty,
	children,
	...props
}: ConversationProps): ReactElement => {
	const days = groupByDay(
		messages,
		message => message.sentAt,
		useTimeZone(),
	);
	const statusLabel: Readonly<
		Record<ConversationMessageStatus, string>
	> = { read: readLabel, unread: unreadLabel };

	return (
		<Root {...props}>
			{days.length === 0 && empty !== undefined ? (
				<EmptyState>{empty}</EmptyState>
			) : null}
			{days.map(day => (
				<Group key={day.key}>
					<DateSeparator
						date={day.date}
						todayLabel={todayLabel}
						yesterdayLabel={yesterdayLabel}
					/>
					{groupByBurst(
						day.items,
						message => message.authorId,
					).map(burst => {
						const [first] = burst.items;
						const { status } = burst.items.at(-1) ?? first;

						return (
							<Message key={burst.key} side={first.side}>
								<MessageAuthor>
									<MessageAvatar name={first.authorName} />
									{first.authorName}
									<MessageTimestamp date={first.sentAt} />
									{status === undefined ? null : (
										<MessageReadIndicator
											status={status}
											label={statusLabel[status]}
										/>
									)}
								</MessageAuthor>
								{burst.items.map(message => (
									<Fragment key={message.id}>
										<MessageBubble>
											<MessageContent lineClamp={lineClamp}>
												{message.body}
											</MessageContent>
										</MessageBubble>
										{message.files === undefined ? null : (
											<MessageFiles>
												{message.files}
											</MessageFiles>
										)}
									</Fragment>
								))}
							</Message>
						);
					})}
				</Group>
			))}
			{children}
		</Root>
	);
};

/** The parts of a conversation, hanging off its prefab. */
export type ConversationParts = typeof Prefab &
	Readonly<{
		Root: typeof Root;
		EmptyState: typeof EmptyState;
		Group: typeof Group;
		GroupSeparator: typeof GroupSeparator;
		DateSeparator: typeof DateSeparator;
		Message: typeof Message;
		MessageBubble: typeof MessageBubble;
		MessageAuthor: typeof MessageAuthor;
		MessageAvatar: typeof MessageAvatar;
		MessageTimestamp: typeof MessageTimestamp;
		MessageReadIndicator: typeof MessageReadIndicator;
		MessageContent: typeof MessageContent;
		MessageFiles: typeof MessageFiles;
		MessageFilesDownloadAll: typeof MessageFilesDownloadAll;
		ScrollToBottom: typeof ScrollToBottom;
	}>;

/**
 * A message thread: a log of day groups, each a run of author bursts with their
 * bubbles, timestamps, read status and files. The prefab groups `messages` by
 * day and by author in the provider's time zone; the parts hanging off it build
 * a log by hand, grouped with `groupByDay` and `groupByBurst`.
 *
 * @example
 * <Conversation
 * 	messages={messages}
 * 	todayLabel="Today"
 * 	yesterdayLabel="Yesterday"
 * 	readLabel="Read"
 * 	unreadLabel="Unread"
 * />
 */
export const Conversation: ConversationParts =
	Object.assign(Prefab, {
		Root,
		EmptyState,
		Group,
		GroupSeparator,
		DateSeparator,
		Message,
		MessageBubble,
		MessageAuthor,
		MessageAvatar,
		MessageTimestamp,
		MessageReadIndicator,
		MessageContent,
		MessageFiles,
		MessageFilesDownloadAll,
		ScrollToBottom,
	});
