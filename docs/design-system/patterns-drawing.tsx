import styles from "./patterns-drawing.module.scss";

type Card = Readonly<{
	x: number;
	y: number;
	width: number;
	height: number;
}>;

const LOADING: Card = {
	x: 60,
	y: 150,
	width: 200,
	height: 220,
};
const EMPTY: Card = {
	x: 530,
	y: 40,
	width: 180,
	height: 160,
};
const FAILED: Card = {
	x: 530,
	y: 330,
	width: 180,
	height: 160,
};
const READY: Card = {
	x: 800,
	y: 60,
	width: 340,
	height: 400,
};
const RADIUS = 28;
const INSET = 32;
const MAIN = LOADING.y + LOADING.height / 2;
const FORK = 340;
const BEND = 150;
const TURN = 50;
const RETRY = 550;
const OVERLAP = 20;
const SKELETON = [40, 80, 120, 160] as const;
const ROWS = [70, 135, 200, 265, 330] as const;
const SELECTED_ROW = 1;

const middle = (card: Card) => ({
	x: card.x + card.width / 2,
	y: card.y + card.height / 2,
});

const branch = (card: Card) =>
	`M${FORK} ${MAIN} C${FORK + BEND} ${MAIN} ${FORK + BEND / 2} ${middle(card).y} ${FORK + BEND} ${middle(card).y} H${card.x + OVERLAP}`;

const retry = `M${middle(FAILED).x} ${FAILED.y + FAILED.height - OVERLAP} V${RETRY - TURN} A${TURN} ${TURN} 0 0 1 ${middle(FAILED).x - TURN} ${RETRY} H${middle(LOADING).x + TURN} A${TURN} ${TURN} 0 0 1 ${middle(LOADING).x} ${RETRY - TURN} V${LOADING.y + LOADING.height - OVERLAP}`;

const Frame = ({ x, y, width, height }: Card) => (
	<rect
		className={styles.card}
		x={x}
		y={y}
		width={width}
		height={height}
		rx={RADIUS}
	/>
);

/**
 * The guide's Patterns opener: a region of data starts loading and ends ready,
 * empty or failed, and a failure loops back to load again.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<PatternsDrawing />
 * </Illustration>
 */
export const PatternsDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{[middle(EMPTY).y, middle(FAILED).y].map(y => (
			<line
				key={y}
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={y}
				y2={y}
			/>
		))}
		<line
			className={styles.rule}
			x1={FORK}
			x2={FORK}
			y1="0"
			y2="600"
		/>
		<line
			className={styles.track}
			x1={LOADING.x + LOADING.width - OVERLAP}
			x2={READY.x + OVERLAP}
			y1={MAIN}
			y2={MAIN}
		/>
		<path className={styles.track} d={branch(EMPTY)} />
		<path className={styles.track} d={branch(FAILED)} />
		<path className={styles.track} d={retry} />
		<circle
			className={styles.card}
			cx={FORK}
			cy={MAIN}
			r="26"
		/>
		<Frame {...LOADING} />
		{SKELETON.map((offset, index) => (
			<rect
				key={offset}
				className={styles.pale}
				x={LOADING.x + INSET}
				y={LOADING.y + offset}
				width={LOADING.width - 2 * INSET - (index % 2) * 48}
				height="20"
				rx="10"
			/>
		))}
		<Frame {...EMPTY} />
		<rect
			className={styles.rule}
			x={EMPTY.x + INSET}
			y={EMPTY.y + INSET}
			width={EMPTY.width - 2 * INSET}
			height={EMPTY.height - 2 * INSET}
			rx="16"
		/>
		<Frame {...FAILED} />
		<g
			transform={`translate(${middle(FAILED).x} ${middle(FAILED).y})`}>
			<circle className={styles.mark} r="44" />
			<rect
				className={styles.paper}
				x="-6"
				y="-26"
				width="12"
				height="32"
				rx="6"
			/>
			<circle className={styles.paper} cy="20" r="7" />
		</g>
		<Frame {...READY} />
		{ROWS.map((offset, index) => (
			<g key={offset}>
				<circle
					className={
						index === SELECTED_ROW
							? styles.mark
							: styles.pale
					}
					cx={READY.x + 56}
					cy={READY.y + offset}
					r="18"
				/>
				<rect
					className={
						index === SELECTED_ROW
							? styles.mark
							: styles.pale
					}
					x={READY.x + 92}
					y={READY.y + offset - 12}
					width={READY.width - 92 - 40 - (index % 2) * 56}
					height="24"
					rx="12"
				/>
			</g>
		))}
	</svg>
);
