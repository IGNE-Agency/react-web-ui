import styles from "./patterns-drawing.module.scss";

type Point = Readonly<{ x: number; y: number }>;
type Shape = (center: Point) => string;

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

const CELL = 172;
const PART = 150;
const CLUSTERS = [205, 600, 995] as const;
const ROWS = [214, 386] as const;

const ANGULAR: readonly Shape[] = [
	center =>
		regular({ x: center.x, y: center.y + 18 }, 82, 3),
	center => regular(center, PART / 2, 4),
	center =>
		regular({ x: center.x, y: center.y - 18 }, 82, 3, 90),
	center => regular(center, PART / 2, 6, 0),
];
const ROUND: readonly Shape[] = [
	center => circle(center, PART / 2),
	center => box(center, 92, PART, 46),
	center => arch(center, PART, PART),
	center =>
		halfDisc({ x: center.x, y: center.y + 18 }, PART / 2),
];
const SQUARE: readonly Shape[] = [
	center => box(center, PART, PART),
	center => ell(center, PART, 52),
	center => plus(center, PART, 52),
	center => box(center, 92, PART),
];

const cluster = (shapes: readonly Shape[], x: number) =>
	shapes
		.map((shape, index) =>
			shape({
				x: x + (index % 2 === 0 ? -CELL / 2 : CELL / 2),
				y: ROWS[index < 2 ? 0 : 1],
			}),
		)
		.join(" ");

/**
 * The guide's Patterns opener: mixed shapes sorted into families by what they
 * share, the round-ended family in white.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<PatternsDrawing />
 * </Illustration>
 */
export const PatternsDrawing = () => {
	const [left, middle, right] = CLUSTERS;
	return (
		<svg viewBox="0 0 1200 600" className={styles.drawing}>
			<rect
				className={styles.field}
				width="1200"
				height="600"
			/>
			<path
				className={styles.angular}
				d={cluster(ANGULAR, left)}
			/>
			<path
				className={styles.paper}
				d={cluster(ROUND, middle)}
			/>
			<path
				className={styles.square}
				d={cluster(SQUARE, right)}
			/>
		</svg>
	);
};
