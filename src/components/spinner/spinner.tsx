import { clsx } from "clsx";
import type { ReactNode } from "react";
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
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		className={clsx(style.spinner, className)}
		style={{ width: `${size}em`, height: `${size}em` }}
		aria-hidden="true">
		<g className={style.ring}>
			<circle
				className={style.arc}
				cx="12"
				cy="12"
				r="9.5"
				strokeWidth="3"
			/>
		</g>
	</svg>
);
