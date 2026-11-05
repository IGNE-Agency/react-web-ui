import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import type {
	ButtonSize,
	ButtonTone,
	ButtonVariant,
} from "../button/button.tsx";
import { buttonAttributes } from "../button/button-attributes.ts";
import {
	type ButtonIcon,
	renderButtonIcon,
} from "../button/button-icon.tsx";

export type LinkButtonProps = ComponentPropsWithRef<"a"> &
	Readonly<{
		/** Visual tier. @default "secondary" */
		variant?: ButtonVariant;
		/** @default "md" */
		size?: ButtonSize;
		/** Colour role. @default "brand" */
		tone?: ButtonTone;
		/** Optional leading icon rendered before the label. */
		icon?: ButtonIcon;
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
	variant,
	size,
	tone,
	icon,
	className,
	children,
	...anchorProps
}: LinkButtonProps): ReactNode => (
	<a
		{...buttonAttributes({
			variant,
			size,
			tone,
			className,
		})}
		{...anchorProps}>
		{renderButtonIcon(icon)}
		{children}
	</a>
);
