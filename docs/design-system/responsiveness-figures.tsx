import styles from "./responsiveness-figures.module.scss";

const ITEMS = 6;
const PICKED = 4;
const SQUARE = 96;
const GAP = 24;
const SPLIT = 790;
const WIDE = { x: 40, y: 152, columns: ITEMS } as const;
const NARROW = { x: 880, y: 32, columns: 2 } as const;

const placed = ({
	x,
	y,
	columns,
}: Readonly<{ x: number; y: number; columns: number }>) =>
	Array.from({ length: ITEMS }, (_, index) => ({
		index,
		x: x + (index % columns) * (SQUARE + GAP),
		y: y + Math.floor(index / columns) * (SQUARE + GAP),
	}));

/**
 * Everything, at every width: six items in one wide row, and the same six
 * wrapped into pairs in a narrow column, with the same one picked out in
 * both so it can be followed across.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<WrappedDrawing />
 * </Illustration>
 */
export const WrappedDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.wrapped}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		<line
			className={styles.rule}
			x1={SPLIT}
			x2={SPLIT}
			y1="0"
			y2="400"
		/>
		{[...placed(WIDE), ...placed(NARROW)].map(item => (
			<rect
				key={`${item.x}-${item.y}`}
				className={
					item.index === PICKED
						? styles.picked
						: styles.item
				}
				x={item.x}
				y={item.y}
				width={SQUARE}
				height={SQUARE}
				rx="24"
			/>
		))}
	</svg>
);

const Ears = ({
	x,
	y,
	r,
}: Readonly<{ x: number; y: number; r: number }>) => (
	<>
		<polygon
			className={styles.cat}
			points={`${x - r * 0.9},${y - r * 0.3} ${x - r * 0.75},${y - r * 1.35} ${x - r * 0.2},${y - r * 0.85}`}
		/>
		<polygon
			className={styles.cat}
			points={`${x + r * 0.9},${y - r * 0.3} ${x + r * 0.75},${y - r * 1.35} ${x + r * 0.2},${y - r * 0.85}`}
		/>
	</>
);

/**
 * Room, not screens: one cat, stretched out in a long low box and sitting up
 * in a small tall one, taking the shape of the box it's in.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<RoomDrawing />
 * </Illustration>
 */
export const RoomDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.room}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		<line
			className={styles.floor}
			x1="0"
			x2="1200"
			y1="360"
			y2="360"
		/>
		<rect
			className={styles.cat}
			x="150"
			y="196"
			width="380"
			height="90"
			rx="45"
		/>
		<circle
			className={styles.cat}
			cx="560"
			cy="214"
			r="46"
		/>
		<Ears x={560} y={214} r={46} />
		<path
			className={styles.tail}
			d="M160 240 C 100 236, 70 270, 74 330"
		/>
		<rect
			className={styles.box}
			x="90"
			y="250"
			width="540"
			height="110"
		/>
		<polygon
			className={styles.flap}
			points="90,250 60,226 120,226 150,250"
		/>
		<polygon
			className={styles.flap}
			points="630,250 660,226 600,226 570,250"
		/>
		<circle
			className={styles.cat}
			cx="870"
			cy="126"
			r="52"
		/>
		<Ears x={870} y={126} r={52} />
		<ellipse
			className={styles.cat}
			cx="842"
			cy="152"
			rx="20"
			ry="12"
		/>
		<ellipse
			className={styles.cat}
			cx="898"
			cy="152"
			rx="20"
			ry="12"
		/>
		<rect
			className={styles.box}
			x="770"
			y="150"
			width="200"
			height="210"
		/>
		<polygon
			className={styles.flap}
			points="770,150 740,122 800,122 830,150"
		/>
		<polygon
			className={styles.flap}
			points="970,150 1000,122 940,122 910,150"
		/>
	</svg>
);
