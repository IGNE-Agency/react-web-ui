import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { clsx } from "clsx";
import type { ReactNode } from "react";
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

export type AvatarProps = Readonly<{
	/** Display name; drives the initials and the (stable) tone. */
	name: string;
	/** Portrait to show in place of the initials, where there is one. */
	src?: string;
	/** Diameter relative to the surrounding font size (in `em`). @default 2.5 */
	size?: number;
	className?: string;
}>;

/**
 * A small circular avatar: the portrait at `src`, falling back to initials over
 * a colour that stays the same for the same name. Decorative: the name it
 * stands for is always beside it, so it is not announced.
 *
 * @example
 * <Avatar name="Ada Lovelace" src={colleague.portraitUrl} />
 */
export const Avatar = ({
	name,
	src,
	size = 2.5,
	className,
}: AvatarProps): ReactNode => (
	<BaseAvatar.Root
		className={clsx(style.avatar, className)}
		style={{
			fontSize: `${size * INITIALS_RATIO}em`,
			inlineSize: `${1 / INITIALS_RATIO}em`,
			blockSize: `${1 / INITIALS_RATIO}em`,
		}}
		data-tone={toneOf(name)}
		aria-hidden="true">
		{src === undefined ? null : (
			<BaseAvatar.Image
				src={src}
				alt=""
				className={style.image}
			/>
		)}
		<BaseAvatar.Fallback className={style.fallback}>
			{initialsOf(name)}
		</BaseAvatar.Fallback>
	</BaseAvatar.Root>
);
