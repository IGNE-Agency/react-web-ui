import styles from "./token.module.scss";
import {
	colourIn,
	documentTheme,
	type Theme,
	tokenOf,
	type TokenId,
} from "./tokens";

/**
 * A design token named the way the docs always name one: its path in code
 * type on a pill, led by a dot of its colour when it is a colour.
 *
 * @example
 * <Token id="sys.color.primary" />
 */
export const Token = ({
	id,
	theme = documentTheme(),
}: Readonly<{ id: TokenId; theme?: Theme }>) => (
	<span className={styles.token}>
		{tokenOf(id, theme).$type === "color" ? (
			<span
				className={styles.dot}
				style={{ "--dot": colourIn(id, theme) }}
				aria-hidden
			/>
		) : null}
		<span className={styles.path}>{id}</span>
	</span>
);
