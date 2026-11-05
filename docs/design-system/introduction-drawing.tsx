import styles from "./introduction-drawing.module.scss";

const MARGIN = 60;
const GUTTER = 24;
const PITCH = 92;
const COLUMNS = Array.from(
	{ length: 12 },
	(_, index) => index,
);
const BASELINE = 560;
const BLOCK_BOTTOM = 260;
const TICK = 14;

const columnX = (column: number) => MARGIN + column * PITCH;
const span = (columns: number) => columns * PITCH - GUTTER;

const SQUARE = {
	x: columnX(7),
	y: BASELINE - span(2),
	size: span(2),
} as const;
const DISC = {
	r: span(3) / 2,
	cx: columnX(9) + span(3) / 2,
	cy: BASELINE - span(3) / 2,
} as const;
const LINES = [
	{ y: 110, columns: 3 },
	{ y: 150, columns: 3 },
	{ y: 190, columns: 2 },
] as const;
const DISC_TOP = DISC.cy - DISC.r;

/**
 * The guide's Introduction opener: a page composed on a twelve-column grid
 * from nothing but the basics: letters, a block of colour, a square and a
 * disc on one baseline, with the space between two of them measured.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<IntroductionDrawing />
 * </Illustration>
 */
export const IntroductionDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{COLUMNS.map(column => (
			<rect
				key={column}
				className={styles.column}
				x={columnX(column)}
				width={span(1)}
				height="600"
			/>
		))}
		<line
			className={styles.rule}
			x1="0"
			x2="1200"
			y1={BASELINE}
			y2={BASELINE}
		/>
		<text
			className={styles.letters}
			x={columnX(0) - 5}
			y={BASELINE}>
			{"Aa"}
		</text>
		<rect
			className={styles.block}
			x={columnX(7)}
			y={-40}
			width={span(5)}
			height={BLOCK_BOTTOM + 40}
			rx="28"
		/>
		{LINES.map(line => (
			<rect
				key={line.y}
				className={styles.text}
				x={columnX(8)}
				y={line.y}
				width={span(line.columns)}
				height="20"
				rx="10"
			/>
		))}
		<rect
			className={styles.square}
			x={SQUARE.x}
			y={SQUARE.y}
			width={SQUARE.size}
			height={SQUARE.size}
			rx="36"
		/>
		<circle
			className={styles.disc}
			cx={DISC.cx}
			cy={DISC.cy}
			r={DISC.r}
		/>
		<rect
			className={styles.band}
			x={columnX(9)}
			y={BLOCK_BOTTOM}
			width={span(3)}
			height={DISC_TOP - BLOCK_BOTTOM}
		/>
		<path
			className={styles.measure}
			d={`M${DISC.cx - TICK} ${BLOCK_BOTTOM} H${DISC.cx + TICK} M${DISC.cx} ${BLOCK_BOTTOM} V${DISC_TOP} M${DISC.cx - TICK} ${DISC_TOP} H${DISC.cx + TICK}`}
		/>
	</svg>
);
