import { Logo } from "../brand/logo.tsx";
import { Tiles } from "../brand/tiles.tsx";
import styles from "./brand-drawing.module.scss";

const PITCH = 132;
const INSET = 6;
const TILE = 120;

const at = (cell: number) => INSET + cell * PITCH;

/**
 * The Brand opener: IGNE's logo set into the tile grid, three tiles wide, with
 * a blue and a green tile further out.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<BrandDrawing />
 * </Illustration>
 */
export const BrandDrawing = () => (
	<svg viewBox="0 0 1200 600">
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		<Tiles />
		<rect
			className={styles.blue}
			x={at(1)}
			y={at(3)}
			width={TILE}
			height={TILE}
			rx="16"
		/>
		<rect
			className={styles.green}
			x={at(7)}
			y={at(1)}
			width={TILE}
			height={TILE}
			rx="16"
		/>
		<Logo
			variant="yellow"
			label="IGNE"
			x={at(3)}
			y={at(1)}
			width={3 * PITCH - (PITCH - TILE)}
			height={3 * PITCH - (PITCH - TILE)}
		/>
	</svg>
);
