import styles from "./getting-started-drawing.module.scss";

const FLOOR = 510;
const EDGE = 600;
const GAP = 70;

/**
 * The Getting started opener: a huge door left ajar, a blade of light at its
 * edge and a long wedge of that light thrown across the floor.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<GettingStartedDrawing />
 * </Illustration>
 */
export const GettingStartedDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		<rect
			className={styles.floor}
			y={FLOOR}
			width="1200"
			height={600 - FLOOR}
		/>
		<path
			className={styles.spill}
			d={`M${EDGE} ${FLOOR} L${EDGE + GAP} ${FLOOR} L460 600 L-40 600 Z`}
		/>
		<rect
			className={styles.light}
			x={EDGE}
			y="-10"
			width={GAP}
			height={FLOOR + 10}
		/>
		<path
			className={styles.leaf}
			d={`M${EDGE + GAP} -10 L1220 -60 L1220 640 L${EDGE + GAP} ${FLOOR} Z`}
		/>
		<rect
			className={styles.knob}
			x={EDGE + GAP + 40}
			y="245"
			width="26"
			height="90"
			rx="13"
		/>
	</svg>
);
