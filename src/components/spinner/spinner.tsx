import { clsx } from "clsx";
import type { ReactNode } from "react";
import SpinnerSvg from "../../assets/spinner.svg?react";
import style from "./spinner.module.scss";

export type SpinnerProps = Readonly<{
	/** Size relative to the current font size (in `em`). @default 1.5 */
	size?: number;
	className?: string;
}>;

/**
 * Minor inline loading indicator for small, in-place waits: a button, a field,
 * a widget. Hidden from assistive tech, so the region it sits in carries the
 * busy state.
 *
 * @example
 * {isPending ? <Spinner size={1} /> : <List items={data} />}
 */
export const Spinner = ({
	size = 1.5,
	className,
}: SpinnerProps): ReactNode => (
	<SpinnerSvg
		className={clsx(style.spinner, className)}
		style={{ width: `${size}em`, height: `${size}em` }}
		aria-hidden="true"
	/>
);
