import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import style from "./avatar.module.scss";

const TONE_COUNT = 5;

const INITIALS_RATIO = 0.4;

const initialsOf = (name: string): string => {
	const [first, ...rest] = name
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (first === undefined) {
		return "?";
	}
	const last = rest.at(-1) ?? "";
	return (first.charAt(0) + last.charAt(0)).toUpperCase();
};

const toneOf = (name: string): number => {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash + name.charCodeAt(i)) % TONE_COUNT;
	}
	return hash;
};

export type AvatarRootProps =
	ComponentPropsWithRef<"span"> &
		Readonly<{
			/** Display name; drives the (stable) tone. */
			name: string;
			/** Diameter relative to the surrounding font size (in `em`). @default 2.5 */
			size?: number;
		}>;

/**
 * The circle, in a colour that stays the same for the same `name`. Decorative:
 * the name it stands for is always beside it, so it is not announced.
 *
 * @example
 * <Avatar.Root name="Ada Lovelace">
 * 	<Avatar.Image src={colleague.portraitUrl} />
 * 	<Avatar.Fallback>AL</Avatar.Fallback>
 * </Avatar.Root>
 */
const Root = ({
	name,
	size = 2.5,
	className,
	style: inlineStyle,
	...props
}: AvatarRootProps): ReactNode => (
	<BaseAvatar.Root
		{...props}
		className={clsx(style.avatar, className)}
		style={{
			fontSize: `${size * INITIALS_RATIO}em`,
			inlineSize: `${1 / INITIALS_RATIO}em`,
			blockSize: `${1 / INITIALS_RATIO}em`,
			...inlineStyle,
		}}
		data-tone={toneOf(name)}
		aria-hidden="true"
	/>
);

export type AvatarImageProps = Omit<
	BaseAvatar.Image.Props,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * The portrait, shown once it has loaded.
 *
 * @example
 * <Avatar.Image src={colleague.portraitUrl} />
 */
const Image = ({
	alt = "",
	className,
	...props
}: AvatarImageProps): ReactNode => (
	<BaseAvatar.Image
		{...props}
		alt={alt}
		className={clsx(style.image, className)}
	/>
);

export type AvatarFallbackProps = Omit<
	BaseAvatar.Fallback.Props,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * What shows while there is no portrait, or while it loads or fails, such as
 * the initials.
 *
 * @example
 * <Avatar.Fallback>AL</Avatar.Fallback>
 */
const Fallback = ({
	className,
	...props
}: AvatarFallbackProps): ReactNode => (
	<BaseAvatar.Fallback
		{...props}
		className={clsx(style.fallback, className)}
	/>
);

export type AvatarProps = Omit<
	AvatarRootProps,
	"children"
> &
	Readonly<{
		/** Display name; drives the initials and the (stable) tone. */
		name: string;
		/** Portrait to show in place of the initials, where there is one. */
		src?: string;
	}>;

const Prefab = ({
	name,
	src,
	...props
}: AvatarProps): ReactNode => (
	<Root {...props} name={name}>
		{src === undefined ? null : <Image src={src} />}
		<Fallback>{initialsOf(name)}</Fallback>
	</Root>
);

/** The parts of an avatar, hanging off its prefab. */
export type AvatarParts = typeof Prefab &
	Readonly<{
		Root: typeof Root;
		Image: typeof Image;
		Fallback: typeof Fallback;
	}>;

/**
 * A small circular avatar: the portrait at `src`, falling back to initials over
 * a colour that stays the same for the same name. Decorative: the name it
 * stands for is always beside it, so it is not announced. Other props go to
 * the `<span>`. The parts hanging off it compose one by hand.
 *
 * @example
 * <Avatar name="Ada Lovelace" src={colleague.portraitUrl} />
 */
export const Avatar: AvatarParts = Object.assign(Prefab, {
	Root,
	Image,
	Fallback,
});
