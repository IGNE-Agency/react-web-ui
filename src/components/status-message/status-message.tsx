import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import type { Tone } from "../../lib/tone.ts";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
import style from "./status-message.module.scss";

/**
 * How a message is announced: `status` waits for a pause in what a screen
 * reader is saying, `alert` interrupts it.
 */
export type StatusMessageLive = "status" | "alert";

export type StatusMessageRootProps = Readonly<{
	/**
	 * Makes the message a live region, announced when it appears or changes.
	 * Leave it out for a message that is not news.
	 */
	live?: StatusMessageLive;
	className?: string;
	children?: ReactNode;
}>;

export type StatusMessageIconProps = Readonly<{
	/** The glyph, from a SVGR `?react` import. */
	svg: SvgComponent;
	/** The disc's colour. @default "neutral" */
	tone?: Tone;
	className?: string;
}>;

export type StatusMessageIllustrationProps = Readonly<{
	/** A picture, a logo or an indicator, hidden from assistive technology. */
	children: ReactNode;
	className?: string;
}>;

export type StatusMessageTitleProps = Readonly<{
	/** A heading to render as, such as `<h2 />`, where the page's outline needs one. */
	render?: ReactElement;
	className?: string;
	children: ReactNode;
}>;

export type StatusMessageDescriptionProps = Readonly<{
	className?: string;
	children: ReactNode;
}>;

export type StatusMessageActionProps = Readonly<{
	className?: string;
	/** The buttons or links that lead on from the message. */
	children: ReactNode;
}>;

/** The message's frame, and its live region when `live` is set. */
const Root = ({
	live,
	className,
	children,
}: StatusMessageRootProps): ReactNode => (
	<div role={live} className={clsx(style.root, className)}>
		{children}
	</div>
);

/** The caller's glyph, on a disc tinted in `tone`. */
const StatusIcon = ({
	svg,
	tone = "neutral",
	className,
}: StatusMessageIconProps): ReactNode => (
	<span
		data-tone={tone}
		data-variant="subtle"
		className={clsx(style.disc, className)}>
		<Icon svg={svg} label="" size={2} />
	</span>
);

/** The caller's picture in place of an icon, hidden from assistive technology. */
const Illustration = ({
	className,
	children,
}: StatusMessageIllustrationProps): ReactNode => (
	<div
		className={clsx(style.illustration, className)}
		aria-hidden="true">
		{children}
	</div>
);

/** What happened, in one sentence. A paragraph unless `render` names a heading. */
const Title = ({
	render,
	className,
	children,
}: StatusMessageTitleProps): ReactElement =>
	useRender({
		defaultTagName: "p",
		render,
		props: {
			className: clsx(style.title, className),
			children,
		},
	});

/** What to do next, or who can help. */
const Description = ({
	className,
	children,
}: StatusMessageDescriptionProps): ReactNode => (
	<p className={clsx(style.description, className)}>
		{children}
	</p>
);

/** The way on: the buttons or links under the message. */
const Action = ({
	className,
	children,
}: StatusMessageActionProps): ReactNode => (
	<div className={clsx(style.action, className)}>
		{children}
	</div>
);

type StatusMessageNamespace = Readonly<{
	Root: typeof Root;
	Icon: typeof StatusIcon;
	Illustration: typeof Illustration;
	Title: typeof Title;
	Description: typeof Description;
	Action: typeof Action;
}>;

/**
 * The message a region shows in place of its content, as parts: an icon on a
 * tinted disc or an illustration, a title, a description and an action. `Root`
 * is the live region. Where it sits is the caller's.
 *
 * @example
 * <StatusMessage.Root live="status">
 * 	<StatusMessage.Icon svg={InboxIcon} />
 * 	<StatusMessage.Title>Your inbox is empty</StatusMessage.Title>
 * 	<StatusMessage.Description>New messages show up here.</StatusMessage.Description>
 * </StatusMessage.Root>
 */
export const StatusMessage: StatusMessageNamespace = {
	Root,
	Icon: StatusIcon,
	Illustration,
	Title,
	Description,
	Action,
};
