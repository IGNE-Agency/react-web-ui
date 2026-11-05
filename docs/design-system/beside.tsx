import { Children, type ReactNode } from "react";
import styles from "./beside.module.scss";

/**
 * Sets a passage of rule text beside its one example, stacking them when the
 * page is too narrow. The last child is the example; everything before it is
 * the text.
 *
 * @example
 * <Beside>
 * 	<p>{ruleText}</p>
 * 	<Example kind="caution" caption={trap} />
 * </Beside>
 */
export const Beside = ({
	children,
}: Readonly<{ children: ReactNode }>) => {
	const parts = Children.toArray(children);

	return (
		<div className={styles.beside}>
			<div className={styles.text}>
				{parts.slice(0, -1)}
			</div>
			{parts.at(-1)}
		</div>
	);
};
