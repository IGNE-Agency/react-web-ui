import { useRender } from "@base-ui/react/use-render";
import type {
	ComponentPropsWithRef,
	ReactElement,
	ReactNode,
} from "react";
import { Tooltip } from "../tooltip/tooltip.tsx";
import { buttonAttributes } from "./button-attributes.ts";

/** A button's visual tier. */
export type ButtonVariant =
	| "primary"
	| "secondary"
	| "tertiary";

/** A button's size. */
export type ButtonSize = "sm" | "md" | "lg";

/** A button's colour role. */
export type ButtonTone = "brand" | "danger";

/** The props every button takes, whatever it shows. */
export type ButtonBaseProps =
	ComponentPropsWithRef<"button"> &
		Readonly<{
			/** Visual tier. @default "secondary" */
			variant?: ButtonVariant;
			/** @default "md" */
			size?: ButtonSize;
			/**
			 * Colour role. `danger` re-points every tier to the error role, for
			 * irreversible actions. @default "brand"
			 */
			tone?: ButtonTone;
			/** A library part this button should render as, e.g. `<Menu.Trigger />`. */
			render?: ReactElement;
		}>;

type ElementProps = ComponentPropsWithRef<"button"> &
	Readonly<{ render?: ReactElement }>;

const ButtonElement = ({
	render,
	...props
}: ElementProps): ReactElement =>
	useRender({ defaultTagName: "button", render, props });

export type ButtonProps = ButtonBaseProps &
	Readonly<{
		/** Optional leading icon rendered before the label. */
		icon?: ReactNode;
		/** The button's text, which is also its accessible name. */
		children: ReactNode;
	}>;

/**
 * Composite button over Material 3's tiers: `primary` is a filled button,
 * `secondary` a tonal one, and `tertiary` a text button. A button whose only
 * content is an icon is an `IconButton`.
 *
 * @example
 * <Button variant="primary" size="md" onClick={apply}>Apply</Button>
 */
export const Button = ({
	variant,
	size,
	tone,
	className,
	icon,
	children,
	render,
	...nativeProps
}: ButtonProps): ReactNode => (
	<ButtonElement
		render={render}
		type="button"
		{...buttonAttributes({
			variant,
			size,
			tone,
			className,
		})}
		{...nativeProps}>
		{icon}
		{children}
	</ButtonElement>
);

export type IconButtonProps = ButtonBaseProps &
	Readonly<{
		/** Accessible name, surfaced as the tooltip hint and set as `aria-label`, since the icon alone conveys no text. */
		label: string;
		/** The icon, drawn in `currentColor` at `1em`. */
		children: ReactNode;
	}>;

/**
 * A button whose only content is an icon: a circle with its `label` as its
 * accessible name and as a tooltip, since the icon alone says nothing.
 *
 * @example
 * <IconButton label="Export" onClick={exportRows}><DownloadIcon /></IconButton>
 */
export const IconButton = ({
	variant,
	size,
	tone,
	className,
	label,
	children,
	render,
	...nativeProps
}: IconButtonProps): ReactNode => (
	<Tooltip content={label}>
		<ButtonElement
			render={render}
			type="button"
			aria-label={label}
			{...buttonAttributes({
				variant,
				size,
				tone,
				className,
			})}
			data-icon-only={true}
			{...nativeProps}>
			{children}
		</ButtonElement>
	</Tooltip>
);
