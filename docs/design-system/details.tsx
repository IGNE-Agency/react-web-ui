import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import { slug } from "github-slugger";
import type { ReactNode } from "react";
import styles from "./details.module.scss";

/**
 * A folded block for one technical rule: its title states the rule and doubles
 * as its anchor, and the rest opens on demand.
 *
 * @example
 * <Details title="A control never carries a shadow">
 * 	<p>{implementationNote}</p>
 * </Details>
 */
export const Details = ({
	title,
	children,
}: Readonly<{ title: string; children: ReactNode }>) => (
	<details id={slug(title)} className={styles.details}>
		<summary className={styles.summary}>
			<ExpandMoreIcon className={styles.icon} aria-hidden />
			<span>{title}</span>
		</summary>
		<div className={styles.body}>{children}</div>
	</details>
);

/**
 * Stacks several `Details` into one tight list, so a run of folded notes
 * reads as a set of questions rather than separate blocks.
 *
 * @example
 * <DetailsList>
 * 	<Details title="How are tokens named?">{answer}</Details>
 * 	<Details title="Where do tokens live?">{answer}</Details>
 * </DetailsList>
 */
export const DetailsList = ({
	children,
}: Readonly<{ children: ReactNode }>) => (
	<div className={styles.list}>{children}</div>
);
