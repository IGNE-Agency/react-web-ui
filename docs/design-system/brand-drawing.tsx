import styles from "./brand-drawing.module.scss";

const MARK =
	"M20 40C31.0458 40 40 31.0457 40 20C40 8.95431 31.0458 0 20 0C8.9543 0 0 8.95431 0 20C0 31.0457 8.9543 40 20 40ZM23.087 15.4526C24.7918 13.7477 24.7918 10.9836 23.087 9.27867C21.3821 7.57379 18.618 7.57379 16.9131 9.27867C15.2083 10.9836 15.2083 13.7477 16.9131 15.4526L20 18.5395L23.087 15.4526ZM24.5475 23.087C26.2524 24.7919 29.0165 24.7919 30.7214 23.087C32.4262 21.3821 32.4262 18.618 30.7214 16.9131C29.0165 15.2083 26.2524 15.2083 24.5475 16.9131L21.4606 20.0001L24.5475 23.087ZM23.087 30.7214C24.7918 29.0165 24.7918 26.2524 23.087 24.5475L20 21.4606L16.9131 24.5475C15.2083 26.2524 15.2083 29.0165 16.9131 30.7214C18.618 32.4263 21.3821 32.4263 23.087 30.7214ZM9.27864 23.087C7.5738 21.3821 7.5738 18.618 9.27864 16.9131C10.9836 15.2083 13.7477 15.2083 15.4526 16.9131L18.5395 20.0001L15.4526 23.087C13.7477 24.7919 10.9836 24.7919 9.27864 23.087Z";
const UNITS = 40;
const RAMP = { width: 336, height: 100 } as const;
const STEPS = [
	styles.step100,
	styles.step250,
	styles.step400,
	styles.brand,
	styles.step700,
	styles.step850,
] as const;
const BRAND_STEP = STEPS.indexOf(styles.brand);
const LARGE = { x: 860, y: 320, size: 620 } as const;
const SMALL = {
	x: RAMP.width / 2,
	y: BRAND_STEP * RAMP.height + RAMP.height / 2,
	size: 40,
} as const;
const REACH = LARGE.size / 2 + 40;

const Mark = ({
	x,
	y,
	size,
	className,
}: Readonly<{
	x: number;
	y: number;
	size: number;
	className: string | undefined;
}>) => (
	<path
		className={className}
		fillRule="evenodd"
		d={MARK}
		transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / UNITS})`}
	/>
);

/**
 * The guide's Brand opener: the brand green's ramp as a column of bands, the
 * mark at sidebar size in the ink of its brand band, and beside it the mark
 * at a scale no screen uses, in the brand role and measured by its axes of
 * symmetry.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<BrandDrawing />
 * </Illustration>
 */
export const BrandDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{STEPS.map((step, index) => (
			<rect
				key={step}
				className={step}
				y={index * RAMP.height}
				width={RAMP.width}
				height={RAMP.height}
			/>
		))}
		<line
			className={styles.rule}
			x1={RAMP.width}
			x2="1200"
			y1={LARGE.y}
			y2={LARGE.y}
		/>
		<line
			className={styles.rule}
			x1={LARGE.x}
			x2={LARGE.x}
			y1="0"
			y2="600"
		/>
		{[1, -1].map(direction => (
			<line
				key={direction}
				className={styles.rule}
				x1={LARGE.x - REACH}
				x2={LARGE.x + REACH}
				y1={LARGE.y - direction * REACH}
				y2={LARGE.y + direction * REACH}
			/>
		))}
		<circle
			className={styles.rule}
			cx={LARGE.x}
			cy={LARGE.y}
			r={REACH}
		/>
		<Mark {...LARGE} className={styles.brandMark} />
		<Mark {...SMALL} className={styles.onBrand} />
	</svg>
);
