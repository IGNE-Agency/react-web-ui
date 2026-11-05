import styles from "./shape-drawing.module.scss";

const CELL = 150;
const CELL_GAP = 14;
const CELL_RADIUS = 96;
const ROWS = 4;
const COLUMNS = 8;
const PICKED = { row: 1, column: 4 } as const;

const oneCorner = (
	x: number,
	y: number,
	corner: number,
) => {
	const r = CELL_RADIUS;
	const right = x + CELL;
	const bottom = y + CELL;
	switch (corner % 4) {
		case 0:
			return `M${x} ${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} H${right} V${bottom} H${x} Z`;
		case 1:
			return `M${x} ${y} H${right - r} A${r} ${r} 0 0 1 ${right} ${y + r} V${bottom} H${x} Z`;
		case 2:
			return `M${x} ${y} H${right} V${bottom - r} A${r} ${r} 0 0 1 ${right - r} ${bottom} H${x} Z`;
		default:
			return `M${x} ${y} H${right} V${bottom} H${x + r} A${r} ${r} 0 0 1 ${x} ${bottom - r} Z`;
	}
};

/**
 * The guide's Shape opener: a tiled floor of squares, each rounded at one
 * corner, the corner turning from tile to tile, with one tile in white.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ShapeDrawing />
 * </Illustration>
 */
export const ShapeDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{Array.from({ length: ROWS }, (_, row) =>
			Array.from({ length: COLUMNS }, (__, column) => (
				<path
					key={`${row}-${column}`}
					className={
						row === PICKED.row && column === PICKED.column
							? styles.picked
							: styles.tile
					}
					d={oneCorner(
						-40 + column * (CELL + CELL_GAP),
						-24 + row * (CELL + CELL_GAP),
						row + column * 3,
					)}
				/>
			)),
		)}
	</svg>
);
