import styles from "./spacing-figures.module.scss";

const DOT = 72;
const NEAR = 14;
const FAR = 64;
const ROWS = {
	x: -40,
	y: 28,
	columns: 6,
	rows: 3,
	across: NEAR,
	down: FAR,
	picked: { row: 1 },
} as const;
const COLUMNS = {
	x: 600,
	y: -8,
	columns: 5,
	rows: 5,
	across: FAR,
	down: NEAR,
	picked: { column: 2 },
} as const;

const dotsOf = ({
	x,
	y,
	columns,
	rows,
	across,
	down,
	picked,
}: typeof ROWS | typeof COLUMNS) =>
	Array.from({ length: rows }, (_, row) =>
		Array.from({ length: columns }, (__, column) => ({
			key: `${x}-${row}-${column}`,
			cx: x + DOT / 2 + column * (DOT + across),
			cy: y + DOT / 2 + row * (DOT + down),
			picked:
				"row" in picked
					? picked.row === row
					: picked.column === column,
		})),
	).flat();

/**
 * Space alone making groups: the same dots twice, close side by side so they
 * read as rows, then close above each other so they read as columns, with one
 * row and one column picked out.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ProximityDrawing />
 * </Illustration>
 */
export const ProximityDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.proximity}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{[ROWS, COLUMNS].flatMap(dotsOf).map(dot => (
			<circle
				key={dot.key}
				className={dot.picked ? styles.picked : styles.dot}
				cx={dot.cx}
				cy={dot.cy}
				r={DOT / 2}
			/>
		))}
	</svg>
);

const STEPS = [4, 8, 12, 16, 24, 32, 48, 64] as const;
const PICKED = 16;
const BAR = {
	width: 96,
	gap: 28,
	x: 132,
	scale: 7,
} as const;
const FLOOR = 400;

/**
 * A spacing scale as a staircase: a short run of steps that grow as they go,
 * one of them picked out, and guides at the steps it sits between.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ScaleDrawing />
 * </Illustration>
 */
export const ScaleDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.scale}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{STEPS.filter(step => step === 12 || step === 24).map(
			step => (
				<line
					key={step}
					className={styles.rule}
					x1="0"
					x2="1200"
					y1={FLOOR - step * BAR.scale}
					y2={FLOOR - step * BAR.scale}
				/>
			),
		)}
		{STEPS.map((step, index) => (
			<rect
				key={step}
				className={
					step === PICKED ? styles.picked : styles.step
				}
				x={BAR.x + index * (BAR.width + BAR.gap)}
				y={FLOOR - step * BAR.scale}
				width={BAR.width}
				height={step * BAR.scale + 40}
				rx="24"
			/>
		))}
	</svg>
);
