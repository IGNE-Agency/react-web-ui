import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import type { Tone, ToneVariant } from "../../lib/tone.ts";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
import style from "./tag.module.scss";

export type TagRootProps = ComponentPropsWithRef<"span"> &
	Readonly<{
		/** Status colour. @default "neutral" */
		tone?: Tone;
		/** @default "subtle" */
		variant?: ToneVariant;
		children: ReactNode;
	}>;

const Root = ({
	tone = "neutral",
	variant = "subtle",
	className,
	children,
	...props
}: TagRootProps): ReactNode => (
	<span
		data-tone={tone}
		data-variant={variant}
		className={clsx(style.root, className)}
		{...props}>
		{children}
	</span>
);

export type TagDotProps = ComponentPropsWithRef<"span">;

const Dot = ({
	className,
	...props
}: TagDotProps): ReactNode => (
	<span
		aria-hidden="true"
		className={clsx(style.dot, className)}
		{...props}
	/>
);

export type TagIconProps = Readonly<{
	/** The glyph, from a SVGR `?react` import. */
	svg: SvgComponent;
	className?: string;
}>;

const TagIcon = ({
	svg,
	className,
}: TagIconProps): ReactNode => (
	<Icon
		svg={svg}
		label=""
		className={clsx(style.icon, className)}
	/>
);

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
 * <Tag.Root tone="info">
 * 	<Tag.Dot />
 * 	Outstanding
 * </Tag.Root>
 */
export const Tag: TagParts = {
	Root,
	Dot,
	Icon: TagIcon,
};
