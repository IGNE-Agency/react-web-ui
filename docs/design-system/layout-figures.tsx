import styles from "./layout-figures.module.scss";

type Tile = readonly [
	column: number,
	row: number,
	span: number,
];

const CELL = 80;
const START = { x: -40, y: -40 } as const;
const INSET = 8;
const TILES: readonly Tile[] = [
	[0, 0, 2],
	[2, 0, 1],
	[3, 0, 3],
	[6, 0, 1],
	[7, 0, 2],
	[9, 0, 1],
	[10, 0, 3],
	[13, 0, 2],
	[15, 0, 1],
	[2, 1, 1],
	[6, 1, 1],
	[9, 1, 1],
	[15, 1, 1],
	[0, 2, 1],
	[1, 2, 2],
	[6, 2, 3],
	[9, 2, 1],
	[13, 2, 1],
	[14, 2, 1],
	[15, 2, 1],
	[0, 3, 1],
	[3, 3, 2],
	[5, 3, 1],
	[9, 3, 2],
	[11, 3, 1],
	[12, 3, 3],
	[15, 3, 1],
	[0, 4, 1],
	[1, 4, 1],
	[2, 4, 1],
	[5, 4, 1],
	[11, 4, 1],
	[15, 4, 1],
	...Array.from({ length: 12 }, (_, column): Tile => [
		column,
		5,
		1,
	]),
	[15, 5, 1],
];
const PICKED = "3-0";

/**
 * One grid under every size: tiles one, two and three cells across, packed so
 * every edge lands on the same tracks, with one tile in white.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<GridDrawing />
 * </Illustration>
 */
export const GridDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.grid}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{TILES.map(([column, row, span]) => (
			<rect
				key={`${column}-${row}`}
				className={
					`${column}-${row}` === PICKED
						? styles.picked
						: styles.tile
				}
				x={START.x + column * CELL + INSET}
				y={START.y + row * CELL + INSET}
				width={span * CELL - 2 * INSET}
				height={span * CELL - 2 * INSET}
				rx="10"
			/>
		))}
	</svg>
);
