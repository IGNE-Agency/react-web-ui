import { useId } from "react";
import styles from "./drafts-patterns.module.scss";

type Point = Readonly<{ x: number; y: number }>;

const round = (value: number) =>
	Math.round(value * 100) / 100;

const polar = (
	center: Point,
	radius: number,
	degrees: number,
): Point => {
	const radians = (degrees * Math.PI) / 180;
	return {
		x: round(center.x + radius * Math.cos(radians)),
		y: round(center.y + radius * Math.sin(radians)),
	};
};

const polygon = (points: readonly Point[]) =>
	`M${points.map(point => `${point.x} ${point.y}`).join(" L")} Z`;

const regular = (
	center: Point,
	radius: number,
	sides: number,
	turn = -90,
) =>
	polygon(
		Array.from({ length: sides }, (_, side) =>
			polar(center, radius, turn + (360 / sides) * side),
		),
	);

const circle = (center: Point, radius: number) =>
	`M${round(center.x - radius)} ${center.y} a${radius} ${radius} 0 1 0 ${radius * 2} 0 a${radius} ${radius} 0 1 0 ${-radius * 2} 0 Z`;

const box = (
	center: Point,
	width: number,
	height: number,
	radius = 0,
) => {
	const x = center.x - width / 2;
	const y = center.y - height / 2;
	const r = Math.min(radius, width / 2, height / 2);
	return r === 0
		? `M${x} ${y} h${width} v${height} h${-width} Z`
		: `M${x + r} ${y} h${width - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${height - 2 * r} a${r} ${r} 0 0 1 ${-r} ${r} h${-(width - 2 * r)} a${r} ${r} 0 0 1 ${-r} ${-r} v${-(height - 2 * r)} a${r} ${r} 0 0 1 ${r} ${-r} Z`;
};

const arch = (
	center: Point,
	width: number,
	height: number,
) => {
	const r = width / 2;
	const left = center.x - r;
	const bottom = center.y + height / 2;
	return `M${left} ${bottom} V${bottom - height + r} A${r} ${r} 0 0 1 ${left + width} ${bottom - height + r} V${bottom} Z`;
};

const halfDisc = (center: Point, radius: number) =>
	`M${center.x - radius} ${center.y - radius / 2} h${radius * 2} A${radius} ${radius} 0 0 1 ${center.x - radius} ${center.y - radius / 2} Z`;

const ell = (
	center: Point,
	size: number,
	thick: number,
) => {
	const x = center.x - size / 2;
	const y = center.y - size / 2;
	return `M${x} ${y} h${thick} v${size - thick} h${size - thick} v${thick} h${-size} Z`;
};

const plus = (center: Point, size: number, thick: number) =>
	`${box(center, thick, size)} ${box(center, size, thick)}`;

const Field = () => (
	<rect
		className={styles.field}
		width="1200"
		height="600"
	/>
);

const TONES = [
	styles.toneA,
	styles.toneB,
	styles.toneC,
] as const;

const tone = (index: number) => TONES[index % TONES.length];

const DOT = 30;
const MARKED: readonly Readonly<{
	center: Point;
	path: (center: Point) => string;
}>[] = [
	{
		center: { x: 150, y: 420 },
		path: center => circle(center, 210),
	},
	{
		center: { x: 470, y: 190 },
		path: center => box(center, 230, 230),
	},
	{
		center: { x: 700, y: 430 },
		path: center => regular(center, 170, 3),
	},
	{
		center: { x: 900, y: 210 },
		path: center => box(center, 140, 300, 70),
	},
	{
		center: { x: 1110, y: 450 },
		path: center => regular(center, 190, 6, 0),
	},
];

/**
 * Patterns opener draft A: different shapes at different sizes, each
 * carrying the same white dot at its heart.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerA />
 * </Illustration>
 */
export const OpenerA = () => (
	<svg viewBox="0 0 1200 600" className={styles.openerA}>
		<Field />
		{MARKED.map((shape, index) => (
			<path
				key={shape.center.x}
				className={tone(index)}
				d={shape.path(shape.center)}
			/>
		))}
		<path
			className={styles.paper}
			d={MARKED.map(shape =>
				circle(shape.center, DOT),
			).join(" ")}
		/>
	</svg>
);

const CELL = 172;
const PART = 150;
const CLUSTERS = [205, 600, 995] as const;
const ROWS = [214, 386] as const;

const ANGULAR: readonly ((center: Point) => string)[] = [
	center =>
		regular({ x: center.x, y: center.y + 18 }, 82, 3),
	center => regular(center, PART / 2, 4),
	center =>
		regular({ x: center.x, y: center.y - 18 }, 82, 3, 90),
	center => regular(center, PART / 2, 6, 0),
];
const ROUND: readonly ((center: Point) => string)[] = [
	center => circle(center, PART / 2),
	center => box(center, 92, PART, 46),
	center => arch(center, PART, PART),
	center =>
		halfDisc({ x: center.x, y: center.y + 18 }, PART / 2),
];
const SQUARE: readonly ((center: Point) => string)[] = [
	center => box(center, PART, PART),
	center => ell(center, PART, 52),
	center => plus(center, PART, 52),
	center => box(center, 92, PART),
];

const cluster = (
	shapes: readonly ((center: Point) => string)[],
	x: number,
) =>
	shapes
		.map((shape, index) =>
			shape({
				x: x + (index % 2 === 0 ? -CELL / 2 : CELL / 2),
				y: ROWS[index < 2 ? 0 : 1],
			}),
		)
		.join(" ");

/**
 * Patterns opener draft B: mixed shapes sorted into families by what they
 * share, the round-ended family in white.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerB />
 * </Illustration>
 */
export const OpenerB = () => {
	const [left, middle, right] = CLUSTERS;
	return (
		<svg viewBox="0 0 1200 600" className={styles.openerB}>
			<Field />
			<path
				className={styles.toneA}
				d={cluster(ANGULAR, left)}
			/>
			<path
				className={styles.paper}
				d={cluster(ROUND, middle)}
			/>
			<path
				className={styles.toneB}
				d={cluster(SQUARE, right)}
			/>
		</svg>
	);
};

const GROUND = { x: 600, y: 556, radius: 360 } as const;
const SINK = 20;
const STANDING: readonly Readonly<{
	turn: number;
	shape: string;
}>[] = [
	{ turn: -62, shape: circle({ x: 0, y: -80 + SINK }, 80) },
	{
		turn: -37,
		shape: box({ x: 0, y: -75 + SINK }, 130, 150),
	},
	{
		turn: -12,
		shape: polygon([
			{ x: 0, y: -190 },
			{ x: 80, y: SINK },
			{ x: -80, y: SINK },
		]),
	},
	{
		turn: 12,
		shape: box({ x: 0, y: -100 + SINK }, 84, 200, 42),
	},
	{
		turn: 37,
		shape: arch({ x: 0, y: -80 + SINK }, 130, 160),
	},
	{
		turn: 62,
		shape: regular({ x: 0, y: -76 + SINK }, 88, 6, 0),
	},
];

/**
 * Patterns opener draft C: different shapes standing on one white ground,
 * every one of them meeting it the same way.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerC />
 * </Illustration>
 */
export const OpenerC = () => (
	<svg viewBox="0 0 1200 600" className={styles.openerC}>
		<Field />
		{STANDING.map((part, index) => {
			const foot = polar(
				GROUND,
				GROUND.radius,
				-90 + part.turn,
			);
			return (
				<path
					key={part.turn}
					className={tone(index)}
					d={part.shape}
					transform={`translate(${foot.x} ${foot.y}) rotate(${part.turn})`}
				/>
			);
		})}
		<path
			className={styles.paper}
			d={`M${GROUND.x - GROUND.radius} ${GROUND.y} A${GROUND.radius} ${GROUND.radius} 0 0 1 ${GROUND.x + GROUND.radius} ${GROUND.y} Z`}
		/>
	</svg>
);

const SLICE = {
	x: 600,
	y: 330,
	turn: -12,
	width: 76,
} as const;
const SLOPE = Math.tan((SLICE.turn * Math.PI) / 180);
const onSlice = (x: number, offset: number): Point => ({
	x,
	y: round(SLICE.y + SLOPE * (x - SLICE.x) + offset),
});

const CROSSED: readonly ((x: number) => string)[] = [
	x => circle(onSlice(x, 40), 170),
	x => box(onSlice(x, -50), 210, 260),
	x => regular(onSlice(x, 30), 160, 3),
	x => box(onSlice(x, -20), 150, 340, 75),
	x => regular(onSlice(x, 30), 170, 6, 0),
];
const CROSSED_X = [140, 400, 640, 860, 1090] as const;

/**
 * Patterns opener draft D: different shapes cut by one white slice, at the
 * same angle and the same width in every one.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerD />
 * </Illustration>
 */
export const OpenerD = () => {
	const clip = useId();
	const shapes = CROSSED.map((path, index) =>
		path(CROSSED_X[index] ?? 0),
	);
	return (
		<svg viewBox="0 0 1200 600" className={styles.openerD}>
			<defs>
				<clipPath id={clip}>
					<path d={shapes.join(" ")} />
				</clipPath>
			</defs>
			<Field />
			{shapes.map((d, index) => (
				<path key={d} className={tone(index)} d={d} />
			))}
			<rect
				className={styles.paper}
				clipPath={`url(#${clip})`}
				x={-200}
				y={SLICE.y - SLICE.width / 2}
				width={1600}
				height={SLICE.width}
				transform={`rotate(${SLICE.turn} ${SLICE.x} ${SLICE.y})`}
			/>
		</svg>
	);
};

const PIECE = 120;
const piece = (center: Point) => {
	const x = center.x - PIECE / 2;
	const y = center.y + PIECE / 2;
	return `M${x} ${y} V${y - PIECE} A${PIECE} ${PIECE} 0 0 1 ${x + PIECE} ${y} Z`;
};
const LOOSE = { x: 600, y: 180 } as const;
const CUT: readonly Readonly<{
	hole: Point;
	shape: string;
}>[] = [
	{
		hole: { x: 200, y: 290 },
		shape: circle({ x: 170, y: 310 }, 260),
	},
	{
		hole: { x: 600, y: 530 },
		shape: polygon([
			{ x: 600, y: 360 },
			{ x: 780, y: 690 },
			{ x: 420, y: 690 },
		]),
	},
	{
		hole: { x: 1010, y: 230 },
		shape: box({ x: 1010, y: 230 }, 360, 380, 40),
	},
];

/**
 * Patterns opener draft E: one white piece, and the same piece cut out of
 * every shape around it.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerE />
 * </Illustration>
 */
export const OpenerE = () => (
	<svg viewBox="0 0 1200 600" className={styles.openerE}>
		<Field />
		{CUT.map((part, index) => (
			<path
				key={part.hole.x}
				className={tone(index)}
				fillRule="evenodd"
				d={`${part.shape} ${piece(part.hole)}`}
			/>
		))}
		<path className={styles.paper} d={piece(LOOSE)} />
	</svg>
);
