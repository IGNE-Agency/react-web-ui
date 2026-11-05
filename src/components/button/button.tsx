import { useRender } from "@base-ui/react/use-render";
import type {
	ComponentPropsWithRef,
	ReactElement,
	ReactNode,
} from "react";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
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

type BaseProps = ComponentPropsWithRef<"button"> &
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

type TextButtonProps = BaseProps &
	Readonly<{
		iconOnly?: false;
		/** Optional leading icon rendered before the label. */
		icon?: SvgComponent;
		children: ReactNode;
	}>;

type IconOnlyButtonProps = BaseProps &
	Readonly<{
		iconOnly: true;
		/** Icon to render; required in icon-only mode. */
		icon: SvgComponent;
		/** Accessible name, surfaced as the tooltip hint and set as `aria-label`, since the icon alone conveys no text. */
		label: string;
		children?: never;
	}>;

export type ButtonProps =
	| TextButtonProps
	| IconOnlyButtonProps;

/**
 * Composite button over Material 3's tiers: `primary` is a filled button,
 * `secondary` a tonal one, and `tertiary` a text button. In icon-only mode an
 * accessible `label` is required and surfaced as both a tooltip and an
 * `aria-label`.
 *
 * @example
 * <Button variant="primary" size="md" onClick={apply}>Apply</Button>
 */
export const Button = (props: ButtonProps): ReactNode => {
	if (props.iconOnly) {
		const {
			variant,
			size,
			tone,
			className,
			iconOnly,
			icon,
			label,
			render,
			...nativeProps
		} = props;
		return (
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
					data-icon-only={iconOnly}
					{...nativeProps}>
					<Icon svg={icon} label="" />
				</ButtonElement>
			</Tooltip>
		);
	}

	const {
		variant,
		size,
		tone,
		className,
		iconOnly: _iconOnly,
		icon,
		children,
		render,
		...nativeProps
	} = props;
	return (
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
			{icon ? <Icon svg={icon} label="" /> : null}
			{children}
		</ButtonElement>
	);
};
