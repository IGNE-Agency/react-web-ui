import styles from "./colour-drawing.module.scss";

const RAMP = [
	50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600,
] as const;
const BRAND = 500;
const ARC = {
	cx: 600,
	cy: 640,
	outer: 600,
	pitch: 46,
	width: 47,
	brandWidth: 77,
} as const;
const BRAND_INDEX = RAMP.indexOf(BRAND);

const share = (part: number, whole: number) =>
	`${Math.round((part / whole) * 100)}%`;

const strokeAt = (index: number) =>
	index <= BRAND_INDEX
		? `color-mix(in oklab, var(--drawing-cool-vivid) ${share(index + 1, BRAND_INDEX + 1)}, var(--drawing-paper))`
		: `color-mix(in oklab, var(--drawing-cool-muted) ${share(index - BRAND_INDEX, RAMP.length - BRAND_INDEX)}, var(--drawing-cool-vivid))`;

/**
 * The guide's Colour opener: a blue ramp as arcs rising from the bottom edge,
 * palest outside and deepest inside, with the brand step drawn widest.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ColourDrawing />
 * </Illustration>
 */
export const ColourDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{RAMP.map((step, index) => {
			const r = ARC.outer - index * ARC.pitch;
			return (
				<path
					key={step}
					className={styles.arc}
					d={`M${ARC.cx - r} ${ARC.cy} A${r} ${r} 0 0 1 ${ARC.cx + r} ${ARC.cy}`}
					style={{
						stroke: strokeAt(index),
						strokeWidth:
							step === BRAND ? ARC.brandWidth : ARC.width,
					}}
				/>
			);
		})}
	</svg>
);
