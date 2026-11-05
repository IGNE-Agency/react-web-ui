import { Popover } from "@base-ui/react/popover";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Avatar } from "../avatar/avatar.tsx";
import { useLocale } from "../locale-provider/locale-provider.tsx";
import style from "./avatar-group.module.scss";

const OVERLAP = 0.4;

const OVERFLOW_RATIO = 0.4;

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
	/**
	 * The person viewing, and what their row in the list says after their name,
	 * such as "(you)".
	 */
	currentUser?: Readonly<{ id: string; label: string }>;
	/** How many avatars to show before the rest fold into a count. @default 4 */
	max?: number;
	/** Avatar diameter relative to the surrounding font size (in `em`). @default 1.5 */
	size?: number;
	className?: string;
}>;

/**
 * A compact stack of avatars that folds everyone past `max` into a count.
 * Hovering or pressing it lists everyone by name.
 *
 * @example
 * <AvatarGroup
 * 	people={invitees}
 * 	label="Invitees"
 * 	currentUser={{ id: me.id, label: "(you)" }}
 * />
 */
export const AvatarGroup = ({
	people,
	label,
	currentUser,
	max = 4,
	size = 1.5,
	className,
}: AvatarGroupProps): ReactNode => {
	const locale = useLocale();
	const shown = people.slice(0, max);
	const overflow = people.length - shown.length;
	const overlap = {
		marginInlineStart: `-${size * OVERLAP}em`,
	};

	return (
		<Popover.Root>
			<Popover.Trigger
				openOnHover
				nativeButton={false}
				render={<div />}
				className={clsx(style.group, className)}>
				<span className={style.label}>{label}</span>
				{shown.map((person, index) => (
					<span
						key={person.id}
						className={style.member}
						style={index === 0 ? undefined : overlap}>
						<Avatar
							name={person.name}
							src={person.src}
							size={size}
						/>
					</span>
				))}
				{overflow > 0 ? (
					<span
						className={clsx(style.member, style.overflow)}
						style={{
							...overlap,
							inlineSize: `${size}em`,
							blockSize: `${size}em`,
						}}>
						<span
							style={{
								fontSize: `${size * OVERFLOW_RATIO}em`,
							}}>
							{new Intl.NumberFormat(locale, {
								signDisplay: "always",
							}).format(overflow)}
						</span>
					</span>
				) : null}
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner side="top" sideOffset={8}>
					<Popover.Popup
						aria-label={label}
						className={style.popup}>
						<ul className={style.list}>
							{people.map(person => (
								<li key={person.id} className={style.item}>
									<Avatar
										name={person.name}
										src={person.src}
										size={1.5}
									/>
									<span>
										{person.name}
										{currentUser?.id === person.id ? (
											<>
												{" "}
												<span className={style.you}>
													{currentUser.label}
												</span>
											</>
										) : null}
									</span>
								</li>
							))}
						</ul>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
};
