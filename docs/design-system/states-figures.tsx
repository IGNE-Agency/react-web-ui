import { useId } from "react";
import styles from "./states-figures.module.scss";

const CONTROL = {
	x: -120,
	y: 50,
	width: 1440,
	height: 300,
} as const;
const PRESS = { x: 700, y: 236 } as const;
const STEPS = [560, 400, 270, 160] as const;
const FINGER = { width: 170, lift: 40 } as const;

const pill = () => {
	const { x, y, width, height } = CONTROL;
	const radius = height / 2;
	return `M${x + radius} ${y} H${x + width - radius} A${radius} ${radius} 0 0 1 ${x + width - radius} ${y + height} H${x + radius} A${radius} ${radius} 0 0 1 ${x + radius} ${y} Z`;
};

/**
 * A fingertip pressing a control seen up close, the press drawn as flat
 * steps of the control's own ink, deepest where the finger lands.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<AnswersDrawing />
 * </Illustration>
 */
export const AnswersDrawing = () => {
	const clip = useId();
	const top = PRESS.y - FINGER.lift;
	return (
		<svg viewBox="0 0 1200 400" className={styles.answers}>
			<rect
				className={styles.field}
				width="1200"
				height="400"
			/>
			<clipPath id={clip}>
				<path d={pill()} />
			</clipPath>
			<path className={styles.control} d={pill()} />
			<g clipPath={`url(#${clip})`}>
				{STEPS.map(radius => (
					<circle
						key={radius}
						className={styles.step}
						cx={PRESS.x}
						cy={PRESS.y}
						r={radius}
					/>
				))}
			</g>
			<rect
				className={styles.finger}
				x={PRESS.x - FINGER.width / 2}
				y={top}
				width={FINGER.width}
				height="600"
				rx={FINGER.width / 2}
			/>
			<rect
				className={styles.nail}
				x={PRESS.x - FINGER.width * 0.27}
				y={top + FINGER.width * 0.16}
				width={FINGER.width * 0.54}
				height={FINGER.width * 0.6}
				rx={FINGER.width * 0.22}
			/>
		</svg>
	);
};
