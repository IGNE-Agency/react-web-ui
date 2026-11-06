import styles from "./pill.module.scss";

/**
 * A word on a tilted yellow pill: New on a changelog entry.
 *
 * @example
 * <Pill>New</Pill>
 */
export const Pill = ({
	children,
}: Readonly<{
	/** The word on the pill, never a sentence. */
	children: string;
}>) => <span className={styles.pill}>{children}</span>;
