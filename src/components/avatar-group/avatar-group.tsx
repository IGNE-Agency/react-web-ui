import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import { Avatar as KitAvatar } from "../avatar/avatar.tsx";
import { useLocale } from "../locale-provider/locale-provider.tsx";
import {
	Popover,
	type PopoverPopupProps,
} from "../popover/popover.tsx";
import {
	AvatarGroupContext,
	useAvatarGroup,
} from "./avatar-group-context.ts";
import style from "./avatar-group.module.scss";

const DEFAULT_SIZE = 1.5;

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
	size = DEFAULT_SIZE,
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
		<AvatarGroupContext value={{ label }}>
			{element}
		</AvatarGroupContext>
	);
};

export type AvatarGroupAvatarProps = Omit<
	useRender.ComponentProps<"span">,
	"aria-label"
> &
	Readonly<{
		/** The person's display name, announced as the avatar's name. */
		name: string;
		/** The person's `Avatar`, at the group's `size`. */
		children: ReactNode;
	}>;

/**
 * One member of the stack, overlapping the one before it: an image named for
 * its person, holding their `Avatar`.
 *
 * @example
 * <AvatarGroup.Avatar name="Ada Lovelace">
 * 	<Avatar name="Ada Lovelace" size={1.5} />
 * </AvatarGroup.Avatar>
 */
const Avatar = ({
	name,
	render,
	className,
	ref,
	...props
}: AvatarGroupAvatarProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			role: "img",
			...props,
			"aria-label": name,
			className: clsx(style.member, className),
		},
	});

export type AvatarGroupOverflowProps = Omit<
	useRender.ComponentProps<"button">,
	"aria-label"
> &
	Readonly<{
		/** The button's name, saying what it opens, such as "+3, show all invitees". */
		label: string;
	}>;

/**
 * The last member of the stack: the button that stands for everyone it leaves
 * out, holding a `Count`. Render it as the trigger of a `Popover`.
 *
 * @example
 * <AvatarGroup.Overflow
 * 	label="+3, show all invitees"
 * 	render={<Popover.Trigger openOnHover />}>
 * 	<AvatarGroup.Count count={3} />
 * </AvatarGroup.Overflow>
 */
const Overflow = ({
	label,
	render,
	className,
	ref,
	...props
}: AvatarGroupOverflowProps): ReactElement =>
	useRender({
		defaultTagName: "button",
		render,
		ref,
		props: {
			type: "button",
			...props,
			"aria-label": label,
			className: clsx(
				style.member,
				style.overflow,
				className,
			),
		},
	});

export type AvatarGroupCountProps = Omit<
	useRender.ComponentProps<"span">,
	"children"
> &
	Readonly<{
		/** How many people the stack leaves out, shown as a signed count such as "+3". */
		count: number;
	}>;

/**
 * How many people the stack leaves out, as a signed number in the reader's
 * own format.
 *
 * @example
 * <AvatarGroup.Count count={3} />
 */
const Count = ({
	count,
	render,
	className,
	ref,
	...props
}: AvatarGroupCountProps): ReactElement => {
	const locale = useLocale();

	return useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.count, className),
			children: new Intl.NumberFormat(locale, {
				signDisplay: "always",
			}).format(count),
		},
	});
};

export type AvatarGroupPopupProps = PopoverPopupProps;

/**
 * The overflow's popover surface, named after the group.
 *
 * @example
 * <Popover.Portal>
 * 	<Popover.Positioner side="top" sideOffset={8}>
 * 		<AvatarGroup.Popup><AvatarGroup.List>…</AvatarGroup.List></AvatarGroup.Popup>
 * 	</Popover.Positioner>
 * </Popover.Portal>
 */
const Popup = ({
	className,
	...props
}: AvatarGroupPopupProps): ReactNode => {
	const { label } = useAvatarGroup();

	return (
		<Popover.Popup
			aria-label={label}
			{...props}
			className={clsx(style.popup, className)}
		/>
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

export type AvatarGroupListItemProps =
	useRender.ComponentProps<"li">;

/**
 * One person in the list: their `Avatar`, then their `Name`.
 *
 * @example
 * <AvatarGroup.ListItem>
 * 	<Avatar name="Ada Lovelace" size={1.5} />
 * 	<AvatarGroup.Name>Ada Lovelace</AvatarGroup.Name>
 * </AvatarGroup.ListItem>
 */
const ListItem = ({
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
		},
	});

export type AvatarGroupNameProps =
	useRender.ComponentProps<"span">;

/**
 * A person's name in the list, with any `Suffix` after it.
 *
 * @example
 * <AvatarGroup.Name>
 * 	Ada Lovelace <AvatarGroup.Suffix>(you)</AvatarGroup.Suffix>
 * </AvatarGroup.Name>
 */
const Name = ({
	render,
	ref,
	...props
}: AvatarGroupNameProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props,
	});

export type AvatarGroupSuffixProps =
	useRender.ComponentProps<"span">;

/**
 * Muted words after a name, such as "(you)".
 *
 * @example
 * <AvatarGroup.Suffix>(you)</AvatarGroup.Suffix>
 */
const Suffix = ({
	render,
	className,
	ref,
	...props
}: AvatarGroupSuffixProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.suffix, className),
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
	/** The overflow button's name, given how many people it folds away, such as `count => \`+${count}, show all invitees\``. */
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
	size = DEFAULT_SIZE,
	className,
}: AvatarGroupProps): ReactNode => {
	const shown = people.slice(0, max);
	const overflow = people.length - shown.length;

	return (
		<Root label={label} size={size} className={className}>
			{shown.map(person => (
				<Avatar key={person.id} name={person.name}>
					<KitAvatar
						name={person.name}
						src={person.src}
						size={size}
					/>
				</Avatar>
			))}
			{overflow > 0 ? (
				<Popover.Root>
					<Overflow
						label={overflowLabel(overflow)}
						render={<Popover.Trigger openOnHover />}>
						<Count count={overflow} />
					</Overflow>
					<Popover.Portal>
						<Popover.Positioner side="top" sideOffset={8}>
							<Popup>
								<List>
									{people.map(person => (
										<ListItem key={person.id}>
											<KitAvatar
												name={person.name}
												src={person.src}
												size={LIST_AVATAR_SIZE}
											/>
											<Name>
												{person.name}
												{currentUser?.id === person.id ? (
													<>
														{" "}
														<Suffix>
															{currentUser.label}
														</Suffix>
													</>
												) : null}
											</Name>
										</ListItem>
									))}
								</List>
							</Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
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
		Count: typeof Count;
		Popup: typeof Popup;
		List: typeof List;
		ListItem: typeof ListItem;
		Name: typeof Name;
		Suffix: typeof Suffix;
	}>;

/**
 * A compact stack of avatars that folds everyone past `max` into a count. The
 * count is a button that lists everyone by name; the stack itself is content.
 * The parts hanging off it compose a group by hand, with the overflow's
 * `Popover` composed around them.
 *
 * @example
 * <AvatarGroup
 * 	people={invitees}
 * 	label="Invitees"
 * 	overflowLabel={count => `+${count}, show all invitees`}
 * 	currentUser={{ id: me.id, label: "(you)" }}
 * />
 */
export const AvatarGroup: AvatarGroupParts = Object.assign(
	Prefab,
	{
		Root,
		Avatar,
		Overflow,
		Count,
		Popup,
		List,
		ListItem,
		Name,
		Suffix,
	},
);
