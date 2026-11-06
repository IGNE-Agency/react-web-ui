import styles from "./components-drawing.module.scss";

type Point = Readonly<{ x: number; y: number }>;
type Part = Readonly<{
	grow: (margin: number) => string;
}>;

const round = (value: number) =>
	Math.round(value * 100) / 100;

const polygon = (points: readonly Point[]) =>
	`M${points.map(point => `${round(point.x)} ${round(point.y)}`).join(" L")} Z`;

const circle = (center: Point, radius: number) =>
	`M${round(center.x - radius)} ${round(center.y)} a${radius} ${radius} 0 1 0 ${radius * 2} 0 a${radius} ${radius} 0 1 0 ${-radius * 2} 0 Z`;

const rect = (
	x: number,
	y: number,
	width: number,
	height: number,
	radius = 0,
) => {
	const r = Math.min(radius, width / 2, height / 2);
	return r === 0
		? `M${x} ${y} h${width} v${height} h${-width} Z`
		: `M${x + r} ${y} h${width - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${height - 2 * r} a${r} ${r} 0 0 1 ${-r} ${r} h${-(width - 2 * r)} a${r} ${r} 0 0 1 ${-r} ${-r} v${-(height - 2 * r)} a${r} ${r} 0 0 1 ${r} ${-r} Z`;
};

const grownRect =
	(
		x: number,
		y: number,
		width: number,
		height: number,
		radius = 0,
	) =>
	(margin: number) =>
		rect(
			x - margin,
			y - margin,
			width + 2 * margin,
			height + 2 * margin,
			radius + margin,
		);

const disc = (
	x: number,
	top: number,
	size: number,
): Part => ({
	grow: margin =>
		circle({ x, y: top + size / 2 }, size / 2 + margin),
});

const square = (
	x: number,
	top: number,
	size: number,
): Part => ({
	grow: grownRect(x - size / 2, top, size, size),
});

const pill = (
	x: number,
	top: number,
	width: number,
	height: number,
): Part => ({
	grow: grownRect(
		x - width / 2,
		top,
		width,
		height,
		width / 2,
	),
});

const triangle = (
	x: number,
	top: number,
	size: number,
): Part => {
	const height = (size * Math.sqrt(3)) / 2;
	const center = { x, y: top + (height * 2) / 3 };
	return {
		grow: margin => {
			const reach = 2 * (height / 3 + margin);
			return polygon(
				[-90, 30, 150].map(degrees => ({
					x:
						center.x +
						reach * Math.cos((degrees * Math.PI) / 180),
					y:
						center.y +
						reach * Math.sin((degrees * Math.PI) / 180),
				})),
			);
		},
	};
};

const PARTS: readonly Part[] = [
	disc(180, 190, 220),
	square(480, 200, 200),
	triangle(790, 185, 250),
	pill(1070, 120, 130, 360),
];
const RIM = 30;
const OUT = 1;

/**
 * The guide's Components opener: four parts, each on a place painted in its
 * shape, and the painted place of the one that is out.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ComponentsDrawing />
 * </Illustration>
 */
export const ComponentsDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		<path
			className={styles.paint}
			d={PARTS.map(part => part.grow(RIM)).join(" ")}
		/>
		<path
			className={styles.part}
			d={PARTS.filter((_, index) => index !== OUT)
				.map(part => part.grow(0))
				.join(" ")}
		/>
	</svg>
);
