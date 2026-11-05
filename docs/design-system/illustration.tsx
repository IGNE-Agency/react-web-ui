import type { ReactNode } from "react";
import styles from "./illustration.module.scss";

/**
 * A drawing in a figure frame, with a caption that states its point in words.
 * The drawing is hidden from assistive technology, so the caption carries the
 * whole idea.
 *
 * @example
 * <Illustration caption="Work down the ladder and stop at the first rung that works.">
 * 	<Ladder />
 * </Illustration>
 */
export const Illustration = ({
	caption,
	children,
}: Readonly<{ caption: string; children: ReactNode }>) => (
	<figure className={`${styles.illustration} sb-unstyled`}>
		<div className={styles.frame} aria-hidden inert>
			{children}
		</div>
		<figcaption className={styles.caption}>
			{caption}
		</figcaption>
	</figure>
);
