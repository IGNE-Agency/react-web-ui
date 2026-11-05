import styles from "./elevation-figures.module.scss";

const BALL = { cx: 600, cy: 40, r: 200 } as const;
const FLOOR = 290;
const SHADOW_Y = 338;
const FLATTEN = 0.16;
const LIFT = (FLOOR - (BALL.cy + BALL.r)) / BALL.r;
const UMBRA = BALL.r * Math.max(0.35, 0.85 - LIFT * 0.5);
const PENUMBRA = BALL.r * (1.05 + LIFT * 0.45);

/**
 * A shadow's two parts under one ball lifted above a floor: a tight, dark
 * umbra right beneath it and a wider, paler penumbra around that.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ShadowPartsDrawing />
 * </Illustration>
 */
export const ShadowPartsDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.parts}>
		<rect
			className={styles.wall}
			width="1200"
			height="400"
		/>
		<rect
			className={styles.floor}
			y={FLOOR}
			width="1200"
			height={400 - FLOOR}
		/>
		<ellipse
			className={styles.penumbra}
			cx={BALL.cx}
			cy={SHADOW_Y}
			rx={PENUMBRA}
			ry={PENUMBRA * FLATTEN}
		/>
		<ellipse
			className={styles.umbra}
			cx={BALL.cx}
			cy={SHADOW_Y}
			rx={UMBRA}
			ry={UMBRA * FLATTEN}
		/>
		<circle
			className={styles.paper}
			cx={BALL.cx}
			cy={BALL.cy}
			r={BALL.r}
		/>
	</svg>
);

const TERRACES = [0, 1, 2, 3] as const;

/**
 * Height on a dark page: surfaces nested like terraces seen from above, each
 * one a level higher and a step lighter, up to the highest, which is almost
 * white.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<DarkHeightDrawing />
 * </Illustration>
 */
export const DarkHeightDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.height}>
		<rect
			className={styles.night}
			width="1200"
			height="400"
		/>
		{TERRACES.map(level => (
			<rect
				key={level}
				className={styles[`terrace${level}`]}
				x={300 + level * 110}
				y={50 + level * 60}
				width="1100"
				height="600"
				rx={64 - level * 8}
			/>
		))}
		<rect
			className={styles.paper}
			x="740"
			y="290"
			width="800"
			height="400"
			rx="32"
		/>
	</svg>
);
