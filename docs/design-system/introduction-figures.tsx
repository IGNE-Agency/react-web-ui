import styles from "./introduction-figures.module.scss";

const CELL = 150;
const ORIGIN = { x: -45, y: -55 } as const;
const COLUMNS = 9;
const ROWS = 4;
const SLOT = { column: 5, row: 1 } as const;
const LIFT = { x: 70, y: -60, turn: -7 } as const;

type Point = Readonly<{ x: number; y: number }>;

const parity = (value: number) =>
	((value % 2) + 2) % 2 === 0 ? 1 : -1;

const across = (row: number, column: number) =>
	parity(row + column);

const down = (row: number, column: number) =>
	parity(row + column + 1);

const edge = (from: Point, to: Point, bulge: number) => {
	const length = Math.hypot(to.x - from.x, to.y - from.y);
	const along = {
		x: (to.x - from.x) / length,
		y: (to.y - from.y) / length,
	};
	const normal =
		from.x === to.x ? { x: 1, y: 0 } : { x: 0, y: 1 };
	const lerp = (t: number) => ({
		x: from.x + (to.x - from.x) * t,
		y: from.y + (to.y - from.y) * t,
	});
	const a = lerp(0.37);
	const b = lerp(0.63);
	const height = bulge * CELL * 0.34;
	const width = CELL * 0.17;
	const c1 = {
		x: a.x + normal.x * height - along.x * width,
		y: a.y + normal.y * height - along.y * width,
	};
	const c2 = {
		x: b.x + normal.x * height + along.x * width,
		y: b.y + normal.y * height + along.y * width,
	};
	return `L${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y} L${to.x} ${to.y}`;
};

const piecePath = (column: number, row: number) => {
	const left = ORIGIN.x + column * CELL;
	const top = ORIGIN.y + row * CELL;
	const topLeft = { x: left, y: top };
	const topRight = { x: left + CELL, y: top };
	const bottomRight = { x: left + CELL, y: top + CELL };
	const bottomLeft = { x: left, y: top + CELL };
	return [
		`M${left} ${top}`,
		edge(topLeft, topRight, across(row - 1, column)),
		edge(topRight, bottomRight, down(row, column)),
		edge(bottomRight, bottomLeft, across(row, column)),
		edge(bottomLeft, topLeft, down(row, column - 1)),
		"Z",
	].join(" ");
};

const TONES = [
	styles.toneOne,
	styles.toneTwo,
	styles.toneThree,
] as const;

/**
 * Why a design system: a jigsaw already cut to fit, each tab meeting the
 * blank of its neighbour, with one white piece lifting out of its slot.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ScreensDrawing />
 * </Illustration>
 */
export const ScreensDrawing = () => {
	const slotX = ORIGIN.x + SLOT.column * CELL + CELL / 2;
	const slotY = ORIGIN.y + SLOT.row * CELL + CELL / 2;
	return (
		<svg viewBox="0 0 1200 400" className={styles.puzzle}>
			<rect
				className={styles.field}
				width="1200"
				height="400"
			/>
			{Array.from({ length: ROWS }, (_, row) =>
				Array.from({ length: COLUMNS }, (__, column) =>
					column === SLOT.column &&
					row === SLOT.row ? null : (
						<path
							key={`${row}-${column}`}
							className={`${TONES[(column + row * 2) % TONES.length]} ${styles.piece}`}
							d={piecePath(column, row)}
						/>
					),
				),
			)}
			<path
				className={`${styles.paper} ${styles.piece}`}
				d={piecePath(SLOT.column, SLOT.row)}
				transform={`translate(${LIFT.x} ${LIFT.y}) rotate(${LIFT.turn} ${slotX} ${slotY})`}
			/>
		</svg>
	);
};

const NIB =
	"M0 -110 L54 -10 L30 110 L-30 110 L-54 -10 Z M0 -20 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0";
const SPARKLE =
	"M0 -90 C10 -20 20 -10 90 0 C20 10 10 20 0 90 C-10 20 -20 10 -90 0 C-20 -10 -10 -20 0 -90 Z";
const RULE = { x: 1080, y: 200, r: 300 } as const;
const MARKS = [
	{ x: 120, turn: 90, scale: 0.7 },
	{ x: 330, turn: 0, scale: 0.66 },
	{ x: 540, turn: 0, scale: 0.86 },
] as const;
const MARK_Y = 200;

const placed = ({
	x,
	turn,
	scale,
}: Readonly<{ x: number; turn: number; scale: number }>) =>
	`translate(${x} ${MARK_Y}) rotate(${turn}) scale(${scale})`;

/**
 * Three readers, one rule: a designer's pen nib, an engineer's text caret and
 * an agent's sparkle in a row, each with a sightline converging on the same
 * huge white rule.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ReadersDrawing />
 * </Illustration>
 */
export const ReadersDrawing = () => {
	const [nib, caret, sparkle] = MARKS;
	return (
		<svg viewBox="0 0 1200 400" className={styles.readers}>
			<rect
				className={styles.field}
				width="1200"
				height="400"
			/>
			{MARKS.map(mark => (
				<line
					key={mark.x}
					className={styles.sightline}
					x1={mark.x}
					y1={MARK_Y}
					x2={RULE.x}
					y2={RULE.y}
				/>
			))}
			<circle
				className={styles.paper}
				cx={RULE.x}
				cy={RULE.y}
				r={RULE.r}
			/>
			<path
				className={styles.mark}
				fillRule="evenodd"
				d={NIB}
				transform={placed(nib)}
			/>
			<g className={styles.mark} transform={placed(caret)}>
				<rect
					x="-12"
					y="-110"
					width="24"
					height="220"
					rx="6"
				/>
				<rect
					x="-56"
					y="-120"
					width="112"
					height="24"
					rx="12"
				/>
				<rect
					x="-56"
					y="96"
					width="112"
					height="24"
					rx="12"
				/>
			</g>
			<path
				className={styles.mark}
				d={SPARKLE}
				transform={placed(sparkle)}
			/>
		</svg>
	);
};
