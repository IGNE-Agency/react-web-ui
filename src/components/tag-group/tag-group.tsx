import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	Tag as AriaTag,
	TagGroup as AriaTagGroup,
	type TagGroupProps as AriaTagGroupProps,
	TagList as AriaTagList,
	type TagListProps as AriaTagListProps,
	type TagProps as AriaTagProps,
} from "react-aria-components";
import type { Tone, ToneVariant } from "../../lib/tone.ts";
import { Tooltip } from "../tooltip/tooltip.tsx";
import style from "./tag-group.module.scss";

export type TagGroupRootProps = Omit<
	AriaTagGroupProps,
	"aria-label" | "className"
> &
	Readonly<{
		/** What the tags are, such as "Active filters". */
		"aria-label": string;
		className?: string;
	}>;

/** The group: named by `aria-label`, and calling `onRemove` with the keys removed. */
const Root = ({
	className,
	...props
}: TagGroupRootProps): ReactNode => (
	<AriaTagGroup
		className={clsx(style.root, className)}
		{...props}
	/>
);

export type TagGroupListProps<T extends object> = Omit<
	AriaTagListProps<T>,
	"className"
> &
	Readonly<{ className?: string }>;

/** The row of tags, from `items` or from its children. */
const List = <T extends object>({
	className,
	...props
}: TagGroupListProps<T>): ReactNode => (
	<AriaTagList
		className={clsx(style.list, className)}
		{...props}
	/>
);

export type TagGroupTagProps = Omit<
	AriaTagProps,
	"className"
> &
	Readonly<{
		/** Status colour. @default "neutral" */
		tone?: Tone;
		/** @default "subtle" */
		variant?: ToneVariant;
		className?: string;
	}>;

/** One tag, in a status `tone` and `variant`. */
const GroupTag = ({
	tone = "neutral",
	variant = "subtle",
	className,
	...props
}: TagGroupTagProps): ReactNode => (
	<AriaTag
		data-tone={tone}
		data-variant={variant}
		className={clsx(style.tag, className)}
		{...props}
	/>
);

export type TagGroupRemoveProps = Omit<
	AriaButtonProps,
	"slot" | "children" | "className"
> &
	Readonly<{
		/** The action's name, such as "Remove", surfaced as the tooltip hint; the button is named by it followed by its tag. */
		label: string;
		/** The glyph, such as a cross. */
		children: ReactNode;
		className?: string;
	}>;

/** The tag's icon-only remove button, named by `label` and its tag, and left out of the tab order. */
const Remove = ({
	label,
	className,
	children,
	...props
}: TagGroupRemoveProps): ReactNode => (
	<Tooltip content={label}>
		<AriaButton
			slot="remove"
			excludeFromTabOrder
			aria-label={label}
			className={clsx(style.remove, className)}
			{...props}>
			{children}
		</AriaButton>
	</Tooltip>
);

type TagGroupParts = Readonly<{
	Root: typeof Root;
	List: typeof List;
	Tag: typeof GroupTag;
	Remove: typeof Remove;
}>;

/**
 * A row of tags the reader moves through with the arrow keys and removes,
 * on react-aria's `TagGroup`. `Root` takes `onRemove`, called with the keys
 * of the tags removed by their `Remove` button or by Backspace or Delete. A
 * tag leads with `Tag.Dot` or `Tag.Icon` like a static `Tag`.
 *
 * @example
 * <TagGroup.Root aria-label="Active filters" onRemove={keys => removeFilters(keys)}>
 * 	<TagGroup.List items={filters}>
 * 		{filter => (
 * 			<TagGroup.Tag id={filter.id} textValue={filter.label}>
 * 				{filter.label}
 * 				<TagGroup.Remove label="Remove"><CloseIcon /></TagGroup.Remove>
 * 			</TagGroup.Tag>
 * 		)}
 * 	</TagGroup.List>
 * </TagGroup.Root>
 */
export const TagGroup: TagGroupParts = {
	Root,
	List,
	Tag: GroupTag,
	Remove,
};
