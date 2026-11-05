import styles from "./spacing-drawing.module.scss";

const CELL = 70;
const STEPS = [4, 8, 16, 24, 32, 48, 64] as const;
const GROW = 1.4;
const PICKED = 5;
const TOP = -30;
const BETWEEN = 26;

const CELLS = STEPS.flatMap((step, row) => {
	const pitch = CELL + step * GROW;
	return Array.from(
		{ length: Math.ceil(1400 / pitch) + 1 },
		(_, index) => ({
			key: `${row}-${index}`,
			row,
			x: -CELL / 3 + index * pitch,
			y: TOP + row * (CELL + BETWEEN),
		}),
	);
});

/**
 * The Spacing opener: one row of squares per step of the spacing scale, each
 * row's gaps a step wider than the row above, running off every edge, with
 * the row in white as the step in use.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<SpacingDrawing />
 * </Illustration>
 */
export const SpacingDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{CELLS.map(cell => (
			<rect
				key={cell.key}
				className={
					cell.row === PICKED
						? styles.picked
						: styles.square
				}
				x={cell.x}
				y={cell.y}
				width={CELL}
				height={CELL}
				rx={CELL * 0.22}
			/>
		))}
	</svg>
);
