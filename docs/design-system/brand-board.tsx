import Logo from "./logo.svg?react";
import styles from "./brand-board.module.scss";
import { Token } from "./token";

const BRAND = "sys.color.primary";

/**
 * The brand at a glance: the mark and the product's one-line description, the
 * brand colour in both themes, the heading typeface, and the rounded shape.
 *
 * @example
 * <BrandBoard name="ZPM" description="Where care providers submit their declarations." />
 */
export const BrandBoard = ({
	name,
	description,
}: Readonly<{ name: string; description: string }>) => {
	return (
		<div className={styles.board}>
			<div className={styles.mark}>
				<Logo className={styles.logo} aria-hidden />
				<div className={styles.identity}>
					<span className={styles.name}>{name}</span>
					<span className={styles.description}>
						{description}
					</span>
					<span className={styles.values}>
						<Token id={BRAND} />
					</span>
				</div>
			</div>
			<div className={styles.type} aria-hidden>
				<span className={styles.glyphs}>Aa</span>
			</div>
			<div className={styles.shape} aria-hidden>
				<span className={styles.corner} />
			</div>
			<div className={styles.tints} aria-hidden>
				<span />
				<span />
				<span />
			</div>
		</div>
	);
};
