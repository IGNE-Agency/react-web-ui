import styles from "./type-figures.module.scss";

const PITCH = { x: 70, y: 84 } as const;
const OFFSET = { x: 10, y: 74 } as const;
const ROWS = Math.ceil(460 / PITCH.y);
const COLUMNS = Math.ceil(1240 / PITCH.x);
const PICKED = { row: 2, column: 10 } as const;

const CELLS = Array.from({ length: ROWS }, (_, row) =>
	Array.from({ length: COLUMNS }, (__, column) => ({
		key: `${row}-${column}`,
		x:
			OFFSET.x +
			column * PITCH.x +
			(row % 2) * (PITCH.x / 2),
		y: OFFSET.y + row * PITCH.y,
		picked: row === PICKED.row && column === PICKED.column,
	})),
).flat();

/**
 * Hierarchy from type alone: one letter repeated at one size, and a single
 * one set in the heading family's bold, which leads even with size held
 * still.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<HierarchyDrawing />
 * </Illustration>
 */
export const HierarchyDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.hierarchy}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{CELLS.map(cell => (
			<text
				key={cell.key}
				className={
					cell.picked ? styles.strong : styles.regular
				}
				x={cell.x}
				y={cell.y}>
				a
			</text>
		))}
	</svg>
);

const RATIO = 1.25;
const STEPS = 13;
const FIRST = 22;
const BASELINE = 330;
const ROLES = [2, 5, 10] as const;

const STEPS_PLACED = Array.from(
	{ length: STEPS },
	(_, step) => FIRST * RATIO ** step,
).reduce<
	readonly Readonly<{
		step: number;
		size: number;
		x: number;
	}>[]
>((placed, size, step) => {
	const last = placed.at(-1);
	const x =
		last === undefined
			? 40
			: last.x + last.size * 0.62 + 22;
	return [...placed, { step, size, x }];
}, []);

const toneOf = (step: number) => {
	const role = ROLES.findIndex(picked => picked === step);
	return role === ROLES.length - 1
		? styles.heading
		: role >= 0
			? styles.role
			: styles.letter;
};

/**
 * A type scale as one letter set at every step of a scale that grows by one
 * ratio, with the three steps roles use picked out in white and the largest
 * of them set in the heading family.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<LadderDrawing />
 * </Illustration>
 */
export const LadderDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.ladder}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		<line
			className={styles.rule}
			x1="0"
			x2="1200"
			y1={BASELINE}
			y2={BASELINE}
		/>
		{STEPS_PLACED.map(({ step, size, x }) => (
			<text
				key={step}
				className={toneOf(step)}
				x={x}
				y={BASELINE}
				style={{ fontSize: `${size}px` }}>
				a
			</text>
		))}
	</svg>
);
