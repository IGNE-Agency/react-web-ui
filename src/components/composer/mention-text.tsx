import { clsx } from "clsx";
import { Fragment, type ReactNode } from "react";
import style from "./mention-text.module.scss";

const MENTION_PATTERN =
	/@\[(?<name>[^\]]+)\]\((?<id>[^)]+)\)/g;

/** A mention in a message string, as `@[label](id)` stores it. */
export type MentionToken = Readonly<{
	type: "mention";
	label: string;
	id: string;
}>;

/** A run of plain text in a message string. */
export type TextToken = Readonly<{
	type: "text";
	text: string;
}>;

export type ContentToken = TextToken | MentionToken;

/**
 * Splits a message string holding `@[label](id)` mentions into its text and
 * mention tokens, in order.
 *
 * @example
 * parseMentionString("Hi @[Ann](u1)!");
 * // [{ type: "text", text: "Hi " }, { type: "mention", label: "Ann", id: "u1" }, { type: "text", text: "!" }]
 */
export const parseMentionString = (
	value: string,
): readonly ContentToken[] => {
	const tokens: ContentToken[] = [];
	let lastIndex = 0;
	for (const match of value.matchAll(MENTION_PATTERN)) {
		const start = match.index;
		if (start > lastIndex) {
			tokens.push({
				type: "text",
				text: value.slice(lastIndex, start),
			});
		}
		tokens.push({
			type: "mention",
			label: match.groups?.["name"] ?? "",
			id: match.groups?.["id"] ?? "",
		});
		lastIndex = start + match[0].length;
	}
	if (lastIndex < value.length) {
		tokens.push({
			type: "text",
			text: value.slice(lastIndex),
		});
	}
	return tokens;
};

/**
 * Writes one mention in the `@[label](id)` syntax.
 *
 * @example
 * serializeMention({ label: "Ann", id: "u1" }); // "@[Ann](u1)"
 */
export const serializeMention = ({
	label,
	id,
}: Readonly<{
	label: string;
	id: string;
}>): string => `@[${label}](${id})`;

/**
 * Flattens a message string to plain text, each `@[label](id)` mention to its
 * bare `label`. This is the body a composer sends.
 *
 * @example
 * toPlainText("Hi @[@Ann](u1)!"); // "Hi @Ann!"
 */
export const toPlainText = (value: string): string =>
	parseMentionString(value)
		.map(token =>
			token.type === "text" ? token.text : token.label,
		)
		.join("");

export type MentionPillProps = Readonly<{
	/** Marks a mention of the viewer. */
	isYou?: boolean;
	className?: string;
	children: ReactNode;
}>;

/**
 * A mention as an inline pill.
 *
 * @example
 * <MentionPill isYou>@AnnDoe</MentionPill>
 */
export const MentionPill = ({
	isYou = false,
	className,
	children,
}: MentionPillProps): ReactNode => (
	<span
		className={clsx(style.mention, className)}
		data-you={isYou ? "" : undefined}>
		{children}
	</span>
);

export type MentionTextProps = Readonly<{
	children: string;
	/** Renders a mention in place of the default `MentionPill`. */
	renderMention?: (mention: MentionToken) => ReactNode;
}>;

/**
 * Renders a message string with its `@[label](id)` mentions as inline pills,
 * or as whatever `renderMention` returns, and its text as typed.
 *
 * @example
 * <MentionText>{"Hi @[Ann](u1)!"}</MentionText>
 */
export const MentionText = ({
	children,
	renderMention,
}: MentionTextProps): ReactNode =>
	parseMentionString(children).map((token, index) => {
		const content =
			token.type === "text" ? (
				token.text
			) : renderMention === undefined ? (
				<MentionPill>{token.label}</MentionPill>
			) : (
				renderMention(token)
			);
		// oxlint-disable-next-line react/no-array-index-key -- the tokens of one string never reorder
		return <Fragment key={index}>{content}</Fragment>;
	});
