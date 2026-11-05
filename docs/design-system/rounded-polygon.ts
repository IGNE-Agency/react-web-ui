type Point = readonly [number, number];

const toward = (
	from: Point,
	to: Point,
	distance: number,
): Point => {
	const length = Math.hypot(
		to[0] - from[0],
		to[1] - from[1],
	);
	const share = Math.min(distance / length, 0.5);
	return [
		from[0] + (to[0] - from[0]) * share,
		from[1] + (to[1] - from[1]) * share,
	];
};

/**
 * An SVG path through a closed polygon's points with every corner rounded,
 * so a drawn shape has no sharp point.
 *
 * @example
 * roundedPolygon([[0, 0], [100, 0], [0, 100]], 8);
 */
export const roundedPolygon = (
	points: readonly [Point, Point, Point, ...Point[]],
	radius: number,
) =>
	`${points
		.map((point, index) => {
			const previous =
				points[
					(index + points.length - 1) % points.length
				] ?? point;
			const next =
				points[(index + 1) % points.length] ?? point;
			const [startX, startY] = toward(
				point,
				previous,
				radius,
			);
			const [endX, endY] = toward(point, next, radius);
			return `${index === 0 ? "M" : "L"}${startX} ${startY} Q${point[0]} ${point[1]} ${endX} ${endY}`;
		})
		.join(" ")} Z`;
