import type { ReactNode } from "react";
import { Icon, type SvgComponent } from "../icon/icon.tsx";

/** A button's icon: the app's own node, such as `<CloseIcon />`, or an SVG component. */
export type ButtonIcon = ReactNode | SvgComponent;

/**
 * Renders a button's icon: a node as it is, an SVG component through `Icon`.
 *
 * @example
 * renderButtonIcon(<CloseIcon />);
 */
export const renderButtonIcon = (
	icon: ButtonIcon,
): ReactNode =>
	typeof icon === "function" ? (
		<Icon svg={icon} label="" />
	) : (
		icon
	);
