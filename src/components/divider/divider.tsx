import { clsx } from "clsx";
import type { ReactNode } from "react";
import style from "./divider.module.scss";

export type DividerProps = Readonly<{
	/** A short line under the rule, naming what follows it. */
	subtitle?: string;
	className?: string;
}>;

/**
 * A horizontal rule between two groups, with an optional subtitle under it.
 *
 * @example
 * <Divider subtitle="Earlier messages" />
 */
export const Divider = ({
	subtitle,
	className,
}: DividerProps): ReactNode => (
	<div className={clsx(style.container, className)}>
		<hr className={style.divider} />
		{subtitle === undefined ? null : (
			<p className={style.subtitle}>{subtitle}</p>
		)}
	</div>
);
