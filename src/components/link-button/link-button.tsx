import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import type {
	ButtonSize,
	ButtonTone,
	ButtonVariant,
} from "../button/button.tsx";
import style from "../button/button.module.scss";
import { Icon, type SvgComponent } from "../icon/icon.tsx";

export type LinkButtonProps = ComponentPropsWithRef<"a"> &
	Readonly<{
		/** Visual tier. @default "secondary" */
		variant?: ButtonVariant;
		/** @default "md" */
		size?: ButtonSize;
		/** Colour role. @default "brand" */
		tone?: ButtonTone;
		/** Optional leading icon rendered before the label. */
		icon?: SvgComponent;
		children: ReactNode;
	}>;

/**
 * A link that looks and sizes exactly like a `Button`. It spreads every other
 * prop onto the `<a>` and forwards its ref, so a router's `createLink` can wrap it.
 *
 * @example
 * const RouterLinkButton = createLink(LinkButton);
 * <RouterLinkButton to="/" variant="primary">Go to home page</RouterLinkButton>
 */
export const LinkButton = ({
	variant = "secondary",
	size = "md",
	tone = "brand",
	icon,
	className,
	children,
	...anchorProps
}: LinkButtonProps): ReactNode => (
	<a
		data-variant={variant}
		data-size={size}
		data-tone={tone}
		className={clsx(style.button, className)}
		{...anchorProps}>
		{icon ? <Icon svg={icon} label="" /> : null}
		{children}
	</a>
);
