import styles from "./responsiveness-drawing.module.scss";

type Cell = readonly [number, number];
type Piece = Readonly<{
	column: readonly Cell[];
	cluster: readonly Cell[];
}>;
type Point = Readonly<{ x: number; y: number }>;

const PITCH = 70;
const RADIUS = PITCH * 0.45;
const ARC = PITCH - RADIUS;
const CLUSTER = { x: 40, y: 55 } as const;
const COLUMN = { x: 860, y: -120 } as const;
const TONES = [
	styles.toneA,
	styles.toneB,
	styles.toneC,
	styles.toneD,
] as const;

const linkPath = (from: Point, to: Point) => {
	const [left, right] =
		from.x < to.x ? [from, to] : [to, from];
	const { x, y } = left;
	return right.y < left.y
		? `M${x + RADIUS} ${y} A${ARC} ${ARC} 0 0 1 ${x + PITCH} ${y - PITCH + RADIUS} L${x + PITCH - RADIUS} ${y - PITCH} A${ARC} ${ARC} 0 0 1 ${x} ${y - RADIUS} Z`
		: `M${x + RADIUS} ${y} A${ARC} ${ARC} 0 0 0 ${x + PITCH} ${y + PITCH - RADIUS} L${x + PITCH - RADIUS} ${y + PITCH} A${ARC} ${ARC} 0 0 0 ${x} ${y + RADIUS} Z`;
};

const Shape = ({
	cells,
	origin,
	className,
}: Readonly<{
	cells: readonly Cell[];
	origin: Point;
	className: string | undefined;
}>) => {
	const points = cells.map(([column, row]) => ({
		x: origin.x + column * PITCH + PITCH / 2,
		y: origin.y + row * PITCH + PITCH / 2,
	}));
	return (
		<g className={className}>
			{points.map(point => (
				<circle
					key={`${point.x},${point.y}`}
					cx={point.x}
					cy={point.y}
					r={RADIUS}
				/>
			))}
			{points.slice(1).map((point, step) => (
				<path
					key={`${point.x},${point.y}`}
					d={linkPath(points[step] ?? point, point)}
				/>
			))}
		</g>
	);
};

const PIECES: readonly Piece[] = [
	{
		column: [
			[0, 0],
			[1, 1],
		],
		cluster: [
			[4, 2],
			[5, 3],
		],
	},
	{ column: [[2, 2]], cluster: [[6, 4]] },
	{ column: [[1, 0]], cluster: [[6, 0]] },
	{
		column: [
			[2, 1],
			[3, 2],
		],
		cluster: [
			[7, 1],
			[8, 2],
		],
	},
	{
		column: [
			[2, 0],
			[3, 1],
		],
		cluster: [
			[6, 5],
			[7, 6],
		],
	},
	{ column: [[3, 0]], cluster: [[4, 6]] },
	{ column: [[0, 1]], cluster: [[9, 3]] },
	{
		column: [
			[0, 2],
			[1, 3],
		],
		cluster: [
			[5, 2],
			[6, 3],
		],
	},
	{ column: [[2, 4]], cluster: [[7, 4]] },
	{
		column: [
			[1, 2],
			[2, 3],
			[3, 4],
		],
		cluster: [
			[2, 3],
			[3, 4],
			[4, 5],
		],
	},
	{ column: [[0, 3]], cluster: [[8, 1]] },
	{ column: [[3, 3]], cluster: [[2, 2]] },
	{
		column: [
			[0, 4],
			[1, 5],
		],
		cluster: [
			[4, 0],
			[5, 1],
		],
	},
	{
		column: [
			[1, 4],
			[2, 5],
			[3, 6],
		],
		cluster: [
			[3, 3],
			[4, 4],
			[5, 5],
		],
	},
	{
		column: [
			[0, 5],
			[1, 6],
		],
		cluster: [
			[2, 4],
			[3, 5],
		],
	},
	{ column: [[3, 5]], cluster: [[5, 6]] },
	{
		column: [
			[0, 6],
			[1, 7],
		],
		cluster: [
			[6, 2],
			[7, 3],
		],
	},
	{ column: [[2, 8]], cluster: [[8, 4]] },
	{
		column: [
			[2, 6],
			[3, 7],
		],
		cluster: [
			[2, 0],
			[3, 1],
		],
	},
	{ column: [[0, 7]], cluster: [[5, 0]] },
	{
		column: [
			[1, 8],
			[2, 9],
		],
		cluster: [
			[6, 1],
			[7, 2],
		],
	},
	{
		column: [
			[2, 7],
			[3, 8],
		],
		cluster: [
			[2, 5],
			[3, 6],
		],
	},
	{
		column: [
			[0, 8],
			[1, 9],
		],
		cluster: [
			[0, 2],
			[1, 3],
		],
	},
	{
		column: [
			[0, 9],
			[1, 10],
		],
		cluster: [
			[3, 2],
			[4, 3],
		],
	},
	{ column: [[2, 11]], cluster: [[5, 4]] },
	{ column: [[3, 9]], cluster: [[1, 4]] },
	{
		column: [
			[0, 10],
			[1, 11],
		],
		cluster: [
			[8, 3],
			[9, 4],
		],
	},
	{
		column: [
			[2, 10],
			[3, 11],
		],
		cluster: [
			[3, 0],
			[4, 1],
		],
	},
	{ column: [[3, 10]], cluster: [[7, 5]] },
	{ column: [[0, 11]], cluster: [[9, 2]] },
];

/**
 * The guide's Responsiveness opener: strands of fused dots, running both ways,
 * gathered into a ragged, organic cluster, and the same strands collapsed into
 * one neat column, with one strand in white to follow between them.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ResponsivenessDrawing />
 * </Illustration>
 */
export const ResponsivenessDrawing = () => {
	const picked = PIECES.findIndex(
		piece =>
			piece.column.length === 3 &&
			piece.column.every(([, row]) => row >= 4 && row <= 7),
	);
	return (
		<svg viewBox="0 0 1200 600" className={styles.figure}>
			<rect
				className={styles.field}
				width="1200"
				height="600"
			/>
			{PIECES.map((piece, index) => {
				const className =
					index === picked
						? styles.picked
						: TONES[(index * 7) % TONES.length];
				return (
					<g
						key={piece.column
							.map(cell => cell.join(","))
							.join(" ")}>
						<Shape
							cells={piece.cluster}
							origin={CLUSTER}
							className={className}
						/>
						<Shape
							cells={piece.column}
							origin={COLUMN}
							className={className}
						/>
					</g>
				);
			})}
		</svg>
	);
};
