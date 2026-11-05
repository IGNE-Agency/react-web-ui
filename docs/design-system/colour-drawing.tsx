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

/**
 * The guide's Colour opener: the green ramp as arcs rising from the bottom
 * edge, palest outside and deepest inside, with the brand step drawn widest.
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
						stroke: `var(--ref-green-${step})`,
						strokeWidth:
							step === BRAND ? ARC.brandWidth : ARC.width,
					}}
				/>
			);
		})}
	</svg>
);
