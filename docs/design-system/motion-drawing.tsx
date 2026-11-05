import styles from "./motion-drawing.module.scss";

const CURVE = { floor: 600, top: 150, steps: 64 } as const;
const BEATS = 9;
const BALL = { at: 0.9, r: 60 } as const;

const easeOut = (time: number) => 1 - (1 - time) ** 3;

const curveY = (time: number) =>
	CURVE.floor - (CURVE.floor - CURVE.top) * easeOut(time);

/**
 * The guide's Motion opener: an easing curve drawn as a landscape, a hill
 * that climbs steeply and levels out, cut by equal beats of time, with a ball
 * come to rest on the plateau.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<MotionDrawing />
 * </Illustration>
 */
export const MotionDrawing = () => {
	const points = Array.from(
		{ length: CURVE.steps + 1 },
		(_, index) => {
			const time = index / CURVE.steps;
			return `${time * 1200},${curveY(time)}`;
		},
	);
	return (
		<svg viewBox="0 0 1200 600" className={styles.drawing}>
			<rect
				className={styles.field}
				width="1200"
				height="600"
			/>
			<polygon
				className={styles.hill}
				points={`0,${CURVE.floor} ${points.join(" ")} 1200,${CURVE.floor}`}
			/>
			{Array.from({ length: BEATS - 1 }, (_, index) => {
				const x = ((index + 1) / BEATS) * 1200;
				return (
					<line
						key={x}
						className={styles.beat}
						x1={x}
						x2={x}
						y1={CURVE.floor}
						y2={curveY(x / 1200)}
					/>
				);
			})}
			<circle
				className={styles.ball}
				cx={BALL.at * 1200}
				cy={curveY(BALL.at) - BALL.r}
				r={BALL.r}
			/>
		</svg>
	);
};
