import { clsx } from "clsx";
import type {
	ButtonSize,
	ButtonTone,
	ButtonVariant,
} from "./button.tsx";
import style from "./button.module.scss";

/** How a button looks, before its defaults are filled in. */
export type ButtonLook = Readonly<{
	variant?: ButtonVariant;
	size?: ButtonSize;
	tone?: ButtonTone;
	className?: string;
}>;

/** The attributes the button stylesheet keys off. */
export type ButtonLookAttributes = Readonly<{
	"data-variant": ButtonVariant;
	"data-size": ButtonSize;
	"data-tone": ButtonTone;
	className: string;
}>;

/**
 * The button stylesheet's class and `data-*` attributes for a look, with its
 * defaults filled in.
 *
 * @example
 * <a {...buttonAttributes({ variant: "primary" })} href="/" />
 */
export const buttonAttributes = ({
	variant = "secondary",
	size = "md",
	tone = "brand",
	className,
}: ButtonLook): ButtonLookAttributes => ({
	"data-variant": variant,
	"data-size": size,
	"data-tone": tone,
	className: clsx(style.button, className),
});
