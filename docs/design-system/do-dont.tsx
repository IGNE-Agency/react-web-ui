import type { ReactNode } from "react";
import styles from "./do-dont.module.scss";

/**
 * Lays a rule's do and don't examples side by side, stacking them when the
 * page is too narrow.
 *
 * @example
 * <DoDont>
 * 	<pre>{doExample}</pre>
 * 	<pre>{dontExample}</pre>
 * </DoDont>
 */
export const DoDont = ({
	children,
}: Readonly<{ children: ReactNode }>) => (
	<div className={styles.pair}>{children}</div>
);
