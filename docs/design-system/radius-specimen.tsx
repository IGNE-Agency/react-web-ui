import styles from "./radius-specimen.module.scss";
import { Token } from "./token";
import {
	descriptionOf,
	dimensionOf,
	groupOf,
	pixelsOf,
	type TokenId,
	tokenOf,
} from "./tokens";

const SCALE = 3;
const CORNER = { x: 36, y: 28 } as const;
const DOT = 3.5;

const GROUP = "sys.radius";

const Corner = ({
	pixels,
}: Readonly<{ pixels: number }>) => {
	const radius = pixels * SCALE;
	const centre = {
		x: CORNER.x + radius,
		y: CORNER.y + radius,
	};
	const reach = radius / Math.SQRT2;
	return (
		<>
			<line
				className={styles.rule}
				x1="0"
				x2="160"
				y1={CORNER.y}
				y2={CORNER.y}
			/>
			<line
				className={styles.rule}
				x1={CORNER.x}
				x2={CORNER.x}
				y1="0"
				y2="120"
			/>
			<rect
				className={styles.surface}
				x={CORNER.x}
				y={CORNER.y}
				width="240"
				height="240"
				rx={radius}
			/>
			{radius === 0 ? null : (
				<>
					<circle
						className={styles.rule}
						cx={centre.x}
						cy={centre.y}
						r={radius}
					/>
					<line
						className={styles.rule}
						x1={centre.x}
						y1={centre.y}
						x2={centre.x - reach}
						y2={centre.y - reach}
					/>
					<circle
						className={styles.dot}
						cx={centre.x}
						cy={centre.y}
						r={DOT}
					/>
				</>
			)}
			<circle
				className={styles.dot}
				cx={CORNER.x}
				cy={CORNER.y}
				r={DOT}
			/>
		</>
	);
};

const Pill = () => (
	<>
		<line
			className={styles.rule}
			x1="0"
			x2="160"
			y1="36"
			y2="36"
		/>
		<line
			className={styles.rule}
			x1="0"
			x2="160"
			y1="84"
			y2="84"
		/>
		<rect
			className={styles.surface}
			x="24"
			y="36"
			width="112"
			height="48"
			rx="24"
		/>
		{[48, 112].map(x => (
			<g key={x}>
				<circle
					className={styles.rule}
					cx={x}
					cy="60"
					r="24"
				/>
				<circle
					className={styles.dot}
					cx={x}
					cy="60"
					r={DOT}
				/>
			</g>
		))}
	</>
);

const Circle = () => (
	<>
		<rect
			className={styles.rule}
			x="40"
			y="20"
			width="80"
			height="80"
		/>
		<line
			className={styles.rule}
			x1="40"
			x2="120"
			y1="60"
			y2="60"
		/>
		<circle
			className={styles.surface}
			cx="80"
			cy="60"
			r="40"
		/>
		<circle
			className={styles.dot}
			cx="80"
			cy="60"
			r={DOT}
		/>
	</>
);

const Shape = ({
	pixels,
	square,
}: Readonly<{ pixels: number; square: boolean }>) => {
	if (square) {
		return <Circle />;
	}
	return pixels * SCALE > 120 ? (
		<Pill />
	) : (
		<Corner pixels={pixels} />
	);
};

const isNamedRadius = (id: TokenId) => {
	const target = tokenOf(id, "light").aliasOf;
	return (
		target !== undefined &&
		groupOf(GROUP).tokens.some(radius => radius === target)
	);
};

/**
 * Every radius, each drawn as the corner it rounds at three times its true
 * size, over the square corner it replaces and the circle that rounds it, with
 * its true value and what takes it. A radius that points at another is drawn on
 * a square element.
 *
 * @example
 * <RadiusSpecimen />
 */
export const RadiusSpecimen = () => (
	<div className={styles.radii}>
		{groupOf(GROUP).tokens.map(id => {
			const dimension = dimensionOf(id);
			const pixels =
				dimension === undefined ? 0 : pixelsOf(dimension);
			return (
				<div key={id} className={styles.radius}>
					<svg
						viewBox="0 0 160 120"
						className={styles.drawing}
						aria-hidden>
						<rect
							className={styles.field}
							width="160"
							height="120"
						/>
						<Shape
							pixels={pixels}
							square={isNamedRadius(id)}
						/>
					</svg>
					<Token id={id} />
					<span className={styles.value}>
						{`${pixels} px`}
					</span>
					<span className={styles.value}>
						{descriptionOf(id)}
					</span>
				</div>
			);
		})}
	</div>
);
