import { ArrowLoop } from "./doodles/index.ts";
import styles from "./pointer.module.scss";

/**
 * A hand-drawn arrow after a sentence, looping back to point at it, in the
 * page's accent. At most one per page, on Introduction, Getting started and
 * Brand only.
 *
 * @example
 * Start with this. <Pointer />
 */
export const Pointer = () => (
	<ArrowLoop size={56} className={styles.pointer} />
);
