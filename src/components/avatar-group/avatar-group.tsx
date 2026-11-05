import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import { Avatar as KitAvatar } from "../avatar/avatar.tsx";
import { useLocale } from "../locale-provider/locale-provider.tsx";
import {
	Popover,
	type PopoverTriggerProps,
} from "../popover/popover.tsx";
import {
	AvatarGroupContext,
	useAvatarGroup,
} from "./avatar-group-context.ts";
import style from "./avatar-group.module.scss";

const LIST_AVATAR_SIZE = 1.5;

export type AvatarGroupRootProps = Omit<
	useRender.ComponentProps<"div">,
	"aria-label"
> &
	Readonly<{
		/** The group's accessible name, which its list carries too, such as "Invitees". */
		label: string;
		/** Avatar diameter relative to the surrounding font size (in `em`). @default 1.5 */
		size?: number;
	}>;

/** The stack: a named group of avatars, overlapping, with no control of its own. */
const Root = ({
	label,
	size = 1.5,
	render,
	className,
	style: inlineStyle,
	ref,
	...props
}: AvatarGroupRootProps): ReactElement => {
	const element = useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			role: "group",
			...props,
			"aria-label": label,
			className: clsx(style.group, className),
			style: {
				"--_avatar-group-size": `${size}em`,
				...inlineStyle,
			},
		},
	});

	return (
		<AvatarGroupContext value={{ label, size }}>
			{element}
		</AvatarGroupContext>
	);
};

export type AvatarGroupAvatarProps = Omit<
	useRender.ComponentProps<"span">,
	"children" | "aria-label"
> &
	Readonly<{
		/** Display name, drawn as initials and announced as the avatar's name. */
		name: string;
		/** Portrait to show in place of the initials, where there is one. */
		src?: string;
	}>;

/** One member of the stack, overlapping the one before it: an image named for its person. */
const Avatar = ({
	name,
	src,
	render,
	className,
	ref,
	...props
}: AvatarGroupAvatarProps): ReactElement => {
	const { size } = useAvatarGroup();

	return useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			role: "img",
			...props,
			"aria-label": name,
			className: clsx(style.member, className),
			children: (
				<KitAvatar name={name} src={src} size={size} />
			),
		},
	});
};

export type AvatarGroupOverflowProps = Omit<
	PopoverTriggerProps,
	"children" | "aria-label" | "className"
> &
	Readonly<{
		className?: string;
		/** How many people the stack leaves out, shown as a signed count such as "+3". */
		count: number;
		/** The button's name, saying what it opens, such as "Show all invitees (+3)". */
		label: string;
		/** What the popover lists, usually an `AvatarGroup.List`. */
		children: ReactNode;
	}>;

/**
 * The count of everyone the stack leaves out: a button that opens a popover
 * holding its children, on hover, on a tap or from the keyboard.
 */
const Overflow = ({
	count,
	label,
	children,
	className,
	...props
}: AvatarGroupOverflowProps): ReactNode => {
	const { label: groupLabel } = useAvatarGroup();
	const locale = useLocale();

	return (
		<Popover.Root>
			<Popover.Trigger
				openOnHover
				{...props}
				aria-label={label}
				className={clsx(
					style.member,
					style.overflow,
					className,
				)}>
				<span className={style.count}>
					{new Intl.NumberFormat(locale, {
						signDisplay: "always",
					}).format(count)}
				</span>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner side="top" sideOffset={8}>
					<Popover.Popup
						aria-label={groupLabel}
						className={style.popup}>
						{children}
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
};

export type AvatarGroupListProps =
	useRender.ComponentProps<"ul">;

/** The people in the overflow's popover, one `ListItem` each. */
const List = ({
	render,
	className,
	ref,
	...props
}: AvatarGroupListProps): ReactElement =>
	useRender({
		defaultTagName: "ul",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.list, className),
		},
	});

export type AvatarGroupListItemProps = Omit<
	useRender.ComponentProps<"li">,
	"children"
> &
	Readonly<{
		/** Display name, shown beside the avatar. */
		name: string;
		/** Portrait to show in place of the initials, where there is one. */
		src?: string;
		/** Muted words after the name, such as "(you)". */
		suffix?: string;
	}>;

/** One person in the list: their avatar, their name and any suffix. */
const ListItem = ({
	name,
	src,
	suffix,
	render,
	className,
	ref,
	...props
}: AvatarGroupListItemProps): ReactElement =>
	useRender({
		defaultTagName: "li",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.item, className),
			children: (
				<>
					<KitAvatar
						name={name}
						src={src}
						size={LIST_AVATAR_SIZE}
					/>
					<span>
						{name}
						{suffix === undefined ? null : (
							<>
								{" "}
								<span className={style.suffix}>
									{suffix}
								</span>
							</>
						)}
					</span>
				</>
			),
		},
	});

/** One person in an `AvatarGroup`. */
export type AvatarGroupPerson = Readonly<{
	id: string;
	/** Display name, shown in the list and drawn as initials. */
	name: string;
	/** Portrait to show in place of the initials, where there is one. */
	src?: string;
}>;

export type AvatarGroupProps = Readonly<{
	/** The people to show as stacked avatars. */
	people: ReadonlyArray<AvatarGroupPerson>;
	/** Accessible name of the group and its list, such as "Invitees". */
	label: string;
	/** The overflow button's name, given how many people it folds away, such as `count => \`Show all invitees (+${count})\``. */
	overflowLabel: (count: number) => string;
	/** The person viewing, and what their row in the list says after their name, such as "(you)". */
	currentUser?: Readonly<{ id: string; label: string }>;
	/** How many avatars to show before the rest fold into a count. @default 4 */
	max?: number;
	/** Avatar diameter relative to the surrounding font size (in `em`). @default 1.5 */
	size?: number;
	className?: string;
}>;

const Prefab = ({
	people,
	label,
	overflowLabel,
	currentUser,
	max = 4,
	size,
	className,
}: AvatarGroupProps): ReactNode => {
	const shown = people.slice(0, max);
	const overflow = people.length - shown.length;

	return (
		<Root label={label} size={size} className={className}>
			{shown.map(person => (
				<Avatar
					key={person.id}
					name={person.name}
					src={person.src}
				/>
			))}
			{overflow > 0 ? (
				<Overflow
					count={overflow}
					label={overflowLabel(overflow)}>
					<List>
						{people.map(person => (
							<ListItem
								key={person.id}
								name={person.name}
								src={person.src}
								suffix={
									currentUser?.id === person.id
										? currentUser.label
										: undefined
								}
							/>
						))}
					</List>
				</Overflow>
			) : null}
		</Root>
	);
};

/** The parts of an avatar group, hanging off its prefab. */
export type AvatarGroupParts = typeof Prefab &
	Readonly<{
		Root: typeof Root;
		Avatar: typeof Avatar;
		Overflow: typeof Overflow;
		List: typeof List;
		ListItem: typeof ListItem;
	}>;

/**
 * A compact stack of avatars that folds everyone past `max` into a count. The
 * count is a button that lists everyone by name; the stack itself is content.
 * The parts hanging off it compose a group by hand.
 *
 * @example
 * <AvatarGroup
 * 	people={invitees}
 * 	label="Invitees"
 * 	overflowLabel={count => `Show all invitees (+${count})`}
 * 	currentUser={{ id: me.id, label: "(you)" }}
 * />
 */
export const AvatarGroup: AvatarGroupParts = Object.assign(
	Prefab,
	{
		Root,
		Avatar,
		Overflow,
		List,
		ListItem,
	},
);
