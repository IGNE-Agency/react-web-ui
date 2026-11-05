import styles from "./token-architecture-drawing.module.scss";

type Point = Readonly<{ x: number; y: number }>;

const ROOT = Math.SQRT2;
const RAMP = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const ROLES = [1, 4, 7] as const;
const STACK = {
	x: 720,
	y: 560,
	base: 1500,
	layer: 760,
	layerDepth: 110,
	cubeDepth: 210,
} as const;
const STRIP = STACK.layer / ROLES.length;
const SWATCH = STACK.base / RAMP.length;

const project = (x: number, y: number) =>
	`translate(${x} ${y}) scale(1 0.5) rotate(-45)`;

const at = (
	x: number,
	y: number,
	u: number,
	v: number,
): Point => ({
	x: x + (u + v) / ROOT,
	y: y + (v - u) / (2 * ROOT),
});

const pointsOf = (points: readonly Point[]) =>
	points.map(point => `${point.x},${point.y}`).join(" ");

const Block = ({
	y,
	v,
	long,
	short,
	depth,
	tone,
}: Readonly<{
	y: number;
	v: number;
	long: number;
	short: number;
	depth: number;
	tone: string | undefined;
}>) => {
	const a = at(STACK.x, y, -long / 2, v - short / 2);
	const b = at(STACK.x, y, long / 2, v - short / 2);
	const c = at(STACK.x, y, long / 2, v + short / 2);
	const d = at(STACK.x, y, -long / 2, v + short / 2);
	const down = (point: Point) => ({
		x: point.x,
		y: point.y + depth,
	});
	return (
		<>
			<polygon
				className={styles.left}
				points={pointsOf([a, d, down(d), down(a)])}
			/>
			<polygon
				className={styles.right}
				points={pointsOf([d, c, down(c), down(d)])}
			/>
			<polygon
				className={tone}
				points={pointsOf([a, b, c, d])}
			/>
		</>
	);
};

/**
 * The guide's Token architecture opener: three layers stacked, each resting
 * only on the one below. A floor striped with the whole ramp, a layer of three
 * roles cut from it, and one white component whose edges land on the roles'
 * seams.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<TokenArchitectureDrawing />
 * </Illustration>
 */
export const TokenArchitectureDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		<g transform={project(STACK.x, STACK.y)}>
			{RAMP.map(step => (
				<rect
					key={step}
					className={styles[`ramp${step}`]}
					x={-STACK.base / 2 + step * SWATCH}
					y={-STACK.base / 2}
					width={SWATCH + 0.5}
					height={STACK.base}
				/>
			))}
		</g>
		{ROLES.map((step, index) => (
			<Block
				key={step}
				y={STACK.y - STACK.layerDepth}
				v={(index - 1) * STRIP}
				long={STACK.layer}
				short={STRIP}
				depth={STACK.layerDepth}
				tone={styles[`ramp${step}`]}
			/>
		))}
		<Block
			y={STACK.y - STACK.layerDepth - STACK.cubeDepth}
			v={STRIP / 2}
			long={STRIP}
			short={2 * STRIP}
			depth={STACK.cubeDepth}
			tone={styles.paper}
		/>
	</svg>
);
