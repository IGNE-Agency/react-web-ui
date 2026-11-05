import styles from "./separation-drawing.module.scss";

const CELL = 92;
const PITCH = 112;
const GRID = {
	columns: 11,
	rows: 6,
	left: -20,
	top: -30,
} as const;
const FREE = { column: 6, row: 2 } as const;

const cells = Array.from(
	{ length: GRID.columns * GRID.rows },
	(_, index) => {
		const column = index % GRID.columns;
		const row = Math.floor(index / GRID.columns);
		return {
			key: index,
			x: GRID.left + column * PITCH,
			y: GRID.top + row * PITCH,
			free: column === FREE.column && row === FREE.row,
			cleared:
				Math.abs(column - FREE.column) <= 1 &&
				Math.abs(row - FREE.row) <= 1,
		};
	},
);

/**
 * The guide's Separation opener: a page boxed in by hairlines, tile by tile,
 * with one tile set apart by nothing but the empty space around it.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<SeparationDrawing />
 * </Illustration>
 */
export const SeparationDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{cells.map(cell =>
			cell.free || !cell.cleared ? (
				<rect
					key={cell.key}
					className={cell.free ? styles.free : styles.boxed}
					x={cell.x}
					y={cell.y}
					width={CELL}
					height={CELL}
					rx="16"
				/>
			) : null,
		)}
	</svg>
);
