import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import style from "./link.module.scss";

export type LinkProps = ComponentPropsWithRef<"a">;

/**
 * The one text link: brand-coloured and underlined. It spreads every prop onto
 * the `<a>` and forwards its ref, so a router's `createLink` can wrap it.
 *
 * @example
 * const RouterLink = createLink(Link);
 * <RouterLink to="/register">Create an account</RouterLink>
 */
export const Link = ({
	className,
	...anchorProps
}: LinkProps): ReactNode => (
	<a
		className={clsx(style.link, className)}
		{...anchorProps}
	/>
);
