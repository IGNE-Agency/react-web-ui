import { clsx } from "clsx";
import type {
	FunctionComponent,
	ReactNode,
	SVGProps,
} from "react";
import style from "./icon.module.scss";

/** An SVG as a React component, such as an SVGR `?react` import from the app's icon set. */
export type SvgComponent = FunctionComponent<
	SVGProps<SVGSVGElement>
>;

export type IconProps = Readonly<{
	/** The app's SVG component to render. */
	svg: SvgComponent;

	/**
	 * Size relative to the current font size (in `em`). Defaults to `1`
	 * so the icon matches the surrounding text.
	 */
	size?: number;

	/**
	 * Human-readable label for assistive tech. An empty string (`""`) hides the
	 * icon from the accessibility tree, for a decorative or already-labelled one.
	 */
	label: string;

	className?: string;
}>;

/**
 * Sizes, colours and labels the app's SVG, from any icon set. `label=""` hides
 * it from assistive tech; a label names it as an image.
 *
 * @example
 * <Icon svg={CloseIcon} label="Close" />
 */
export const Icon = ({
	svg: Svg,
	size = 1,
	label,
	className,
}: IconProps): ReactNode => {
	const decorative = label === "";
	return (
		<Svg
			className={clsx(style.icon, className)}
			style={{ width: `${size}em`, height: `${size}em` }}
			focusable="false"
			aria-hidden={decorative || undefined}
			role={decorative ? undefined : "img"}
			aria-label={decorative ? undefined : label}
		/>
	);
};
