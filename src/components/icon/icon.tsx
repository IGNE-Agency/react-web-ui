import { clsx } from "clsx";
import type {
	FunctionComponent,
	ReactNode,
	SVGProps,
} from "react";
import style from "./icon.module.scss";

/**
 * The component type produced by SVGR's `?react` imports
 * (e.g. `import Close from "@material-design-icons/svg/outlined/close.svg?react"`).
 */
export type SvgComponent = FunctionComponent<
	SVGProps<SVGSVGElement>
>;

export type IconProps = Readonly<{
	/** The SVG component to render, from a SVGR `?react` import. */
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
 * Renders an SVG icon with a consistent size and accessibility treatment.
 * Decorative icons (`label=""`) are hidden from assistive tech; labelled icons
 * expose `role="img"` with an accessible name.
 *
 * @example
 * import Close from "@material-design-icons/svg/outlined/close.svg?react";
 * <Icon svg={Close} label="Close" />
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
