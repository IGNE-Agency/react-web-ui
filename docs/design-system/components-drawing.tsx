import styles from "./components-drawing.module.scss";

const TRAY = {
	x: 70,
	y: 60,
	width: 1060,
	height: 480,
} as const;
const SLOTS = [
	{ x: 110, y: 100, width: 410, height: 200 },
	{ x: 560, y: 100, width: 530, height: 200 },
	{ x: 110, y: 340, width: 180, height: 160 },
	{ x: 330, y: 340, width: 320, height: 160 },
	{ x: 690, y: 340, width: 400, height: 160 },
] as const;

/**
 * The guide's Components opener: a tray with one fitted slot per part, each
 * holding the only button, field, checkbox, switch and chip there is.
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
		{[TRAY.y, TRAY.y + TRAY.height].map(y => (
			<line
				key={y}
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={y}
				y2={y}
			/>
		))}
		{[TRAY.x, TRAY.x + TRAY.width].map(x => (
			<line
				key={x}
				className={styles.rule}
				x1={x}
				x2={x}
				y1="0"
				y2="600"
			/>
		))}
		<rect
			className={styles.tray}
			x={TRAY.x}
			y={TRAY.y}
			width={TRAY.width}
			height={TRAY.height}
			rx="48"
		/>
		{SLOTS.map(slot => (
			<rect
				key={`${slot.x}-${slot.y}`}
				className={styles.slot}
				x={slot.x}
				y={slot.y}
				width={slot.width}
				height={slot.height}
				rx="28"
			/>
		))}
		<rect
			className={styles.deep}
			x="160"
			y="160"
			width="310"
			height="80"
			rx="40"
		/>
		<rect
			className={styles.paper}
			x="240"
			y="190"
			width="150"
			height="20"
			rx="10"
		/>
		<rect
			className={styles.input}
			x="610"
			y="150"
			width="430"
			height="100"
			rx="20"
		/>
		<rect
			className={styles.deep}
			x="646"
			y="176"
			width="8"
			height="48"
			rx="4"
		/>
		<rect
			className={styles.tint}
			x="672"
			y="190"
			width="200"
			height="20"
			rx="10"
		/>
		<rect
			className={styles.deep}
			x="150"
			y="370"
			width="100"
			height="100"
			rx="24"
		/>
		<path
			className={styles.check}
			d="M174 422 L192 440 L226 400"
		/>
		<rect
			className={styles.deep}
			x="390"
			y="380"
			width="200"
			height="80"
			rx="40"
		/>
		<circle
			className={styles.paper}
			cx="550"
			cy="420"
			r="28"
		/>
		<rect
			className={styles.tint}
			x="740"
			y="390"
			width="300"
			height="60"
			rx="30"
		/>
		<circle
			className={styles.deep}
			cx="776"
			cy="420"
			r="12"
		/>
		<rect
			className={styles.deep}
			x="806"
			y="410"
			width="190"
			height="20"
			rx="10"
		/>
	</svg>
);
