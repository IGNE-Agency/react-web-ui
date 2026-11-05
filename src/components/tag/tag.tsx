import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import type { Tone, ToneVariant } from "../../lib/tone.ts";
import style from "./tag.module.scss";

export type TagRootProps =
	useRender.ComponentProps<"span"> &
		Readonly<{
			/** Status colour. @default "neutral" */
			tone?: Tone;
			/** @default "subtle" */
			variant?: ToneVariant;
			children: ReactNode;
		}>;

/** The pill: a `<span>` in a status `tone` and `variant`. */
const Root = ({
	tone = "neutral",
	variant = "subtle",
	render,
	className,
	ref,
	...props
}: TagRootProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			"data-tone": tone,
			"data-variant": variant,
			...props,
			className: clsx(style.root, className),
		},
	});

export type TagDotProps = useRender.ComponentProps<"span">;

/** A dot in the tag's tone, leading its label. */
const Dot = ({
	render,
	className,
	ref,
	...props
}: TagDotProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.dot, className),
		},
	});

export type TagIconProps = useRender.ComponentProps<"span">;

/**
 * The glyph leading the label: its children, sized to the tag's text and drawn
 * in its ink. Renders nothing without children.
 */
const TagIcon = ({
	render,
	className,
	ref,
	children,
	...props
}: TagIconProps): ReactElement | null =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		enabled: children !== undefined && children !== null,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.icon, className),
			children,
		},
	});

type TagParts = Readonly<{
	Root: typeof Root;
	Dot: typeof Dot;
	Icon: typeof TagIcon;
}>;

/**
 * A static fact as a pill in a status `tone` and `variant`, leading with at
 * most one indicator: `Dot` or `Icon`. A removable tag is a `TagGroup.Tag`.
 *
 * @example
 * <Tag.Root tone="error">
 * 	<Tag.Icon><ErrorIcon /></Tag.Icon>
 * 	Returned
 * </Tag.Root>
 */
export const Tag: TagParts = {
	Root,
	Dot,
	Icon: TagIcon,
};
