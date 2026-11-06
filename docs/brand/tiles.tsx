import { useId } from "react";
import styles from "./tiles.module.scss";

const TILE = 120;
const GAP = 12;
const PITCH = TILE + GAP;

/**
 * IGNE's tile grid: faint rounded squares with small gaps, filling its nearest
 * positioned ancestor, or the drawing it sits in. Decoration only.
 *
 * @example
 * <header className={styles.hero}>
 * 	<Tiles />
 * 	<h1>Brand</h1>
 * </header>
 */
export const Tiles = ({
	className,
}: Readonly<{ className?: string }>) => {
	const pattern = useId();

	return (
		<svg
			className={`${styles.tiles} ${className ?? ""}`}
			width="100%"
			height="100%"
			aria-hidden>
			<defs>
				<pattern
					id={pattern}
					width={PITCH}
					height={PITCH}
					patternUnits="userSpaceOnUse">
					<rect
						className={styles.tile}
						x={GAP / 2}
						y={GAP / 2}
						width={TILE}
						height={TILE}
						rx="16"
					/>
				</pattern>
			</defs>
			<rect
				width="100%"
				height="100%"
				fill={`url(#${pattern})`}
			/>
		</svg>
	);
};
