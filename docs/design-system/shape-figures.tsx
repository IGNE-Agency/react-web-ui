import styles from "./shape-figures.module.scss";

const SHAPE = {
	width: 200,
	height: 300,
	gap: 20,
	top: 50,
} as const;
const RADII = [0, 16, 44, 80, 100, 150] as const;
const FIRST = -80;

/**
 * From precise to soft: one shape repeated across the frame, its corners
 * rounding a little more each time, until it is a pill and then a circle.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<SoftnessDrawing />
 * </Illustration>
 */
export const SoftnessDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.softness}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{[SHAPE.top, SHAPE.top + SHAPE.height].map(y => (
			<line
				key={y}
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={y}
				y2={y}
			/>
		))}
		{RADII.map((radius, index) => {
			const x = FIRST + index * (SHAPE.width + SHAPE.gap);
			const circle = index === RADII.length - 1;
			return circle ? (
				<circle
					key={x}
					className={styles[`tone${index}`]}
					cx={x + radius}
					cy={SHAPE.top + SHAPE.height / 2}
					r={radius}
				/>
			) : (
				<rect
					key={x}
					className={styles[`tone${index}`]}
					x={x}
					y={SHAPE.top}
					width={SHAPE.width}
					height={SHAPE.height}
					rx={radius}
				/>
			);
		})}
	</svg>
);

const OUTER = { x: 120, y: 60, radius: 220 } as const;
const GAP = 70;
const CENTRE = {
	x: OUTER.x + OUTER.radius,
	y: OUTER.y + OUTER.radius,
} as const;

/**
 * One corner of a card holding another, drawn huge: both curves are drawn
 * around one shared centre, so the gap between them stays even round the bend.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ConcentricDrawing />
 * </Illustration>
 */
export const ConcentricDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.concentric}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		<rect
			className={styles.outer}
			x={OUTER.x}
			y={OUTER.y}
			width="1400"
			height="700"
			rx={OUTER.radius}
		/>
		<rect
			className={styles.inner}
			x={OUTER.x + GAP}
			y={OUTER.y + GAP}
			width="1400"
			height="700"
			rx={OUTER.radius - GAP}
		/>
		<line
			className={styles.rule}
			x1={CENTRE.x}
			x2="1200"
			y1={CENTRE.y}
			y2={CENTRE.y}
		/>
		<line
			className={styles.rule}
			x1={CENTRE.x}
			x2={CENTRE.x}
			y1={CENTRE.y}
			y2="400"
		/>
		{[OUTER.radius, OUTER.radius - GAP].map(radius => (
			<circle
				key={radius}
				className={styles.rule}
				cx={CENTRE.x}
				cy={CENTRE.y}
				r={radius}
			/>
		))}
		<line
			className={styles.measure}
			x1={CENTRE.x - (OUTER.radius - GAP) / Math.SQRT2}
			y1={CENTRE.y - (OUTER.radius - GAP) / Math.SQRT2}
			x2={CENTRE.x - OUTER.radius / Math.SQRT2}
			y2={CENTRE.y - OUTER.radius / Math.SQRT2}
		/>
		<circle
			className={styles.centre}
			cx={CENTRE.x}
			cy={CENTRE.y}
			r="12"
		/>
	</svg>
);
