import styles from "./interaction-drawing.module.scss";

type Input =
	| "arrow"
	| "hand"
	| "pen"
	| "mic"
	| "switch"
	| "key";

const ARROW = "M2 1.5v16.5l4-3.8 3 6.6 2.8-1.2-3-6.4H14z";
const HAND =
	"M6 15V3.5a1.5 1.5 0 0 1 3 0V9a1.5 1.5 0 0 1 3 0v1.5a1.5 1.5 0 0 1 3 0V12a1.5 1.5 0 0 1 3 0v5.5c0 3-2 5-5 5h-2.5c-1.7 0-2.7-.7-3.7-2L2.4 15.2a1.4 1.4 0 0 1 2.2-1.8z";
const PEN = "M10 1 L17.5 12 L13.5 21 H6.5 L2.5 12 Z";
const MIC_STAND =
	"M3.5 10.5a6.5 6.5 0 0 0 13 0M10 17v4M6 21h8";
const TAB = "M5 11h9M11 7.5l3.5 3.5-3.5 3.5M17 6.5v9";

const PANEL = { width: 400, height: 300 } as const;
const GLYPH_SCALE = 9;
const CONTROL = {
	x: 140,
	y: 256,
	width: 920,
	height: 88,
} as const;

const TILES: readonly Readonly<{
	input: Input;
	column: number;
	row: number;
}>[] = [
	{ input: "arrow", column: 0, row: 0 },
	{ input: "key", column: 1, row: 0 },
	{ input: "mic", column: 2, row: 0 },
	{ input: "hand", column: 0, row: 1 },
	{ input: "pen", column: 1, row: 1 },
	{ input: "switch", column: 2, row: 1 },
];

const Glyph = ({
	input,
	x,
	y,
}: Readonly<{ input: Input; x: number; y: number }>) => (
	<g
		transform={`translate(${x} ${y}) scale(${GLYPH_SCALE}) translate(-11 -11)`}>
		{input === "arrow" ? (
			<path className={styles.glyph} d={ARROW} />
		) : input === "hand" ? (
			<path className={styles.glyph} d={HAND} />
		) : input === "pen" ? (
			<>
				<path className={styles.glyph} d={PEN} />
				<path className={styles.cut} d="M10 12V21" />
				<circle
					className={styles.hole}
					cx="10"
					cy="11"
					r="1.6"
				/>
			</>
		) : input === "mic" ? (
			<>
				<rect
					className={styles.glyph}
					x="6.5"
					y="1"
					width="7"
					height="12.5"
					rx="3.5"
				/>
				<path
					className={`${styles.glyph} ${styles.stroke}`}
					d={MIC_STAND}
				/>
			</>
		) : input === "switch" ? (
			<>
				<circle
					className={styles.glyph}
					cx="10"
					cy="11"
					r="9.5"
				/>
				<circle
					className={styles.hole}
					cx="10"
					cy="11"
					r="5"
				/>
			</>
		) : (
			<>
				<rect
					className={styles.glyph}
					x="0"
					y="2"
					width="22"
					height="18"
					rx="3.5"
				/>
				<path className={styles.cutKey} d={TAB} />
			</>
		)}
	</g>
);

/**
 * The guide's Interaction opener: the frame cut into six panels, one way in
 * per panel, and one white control laid across all of them.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<InteractionDrawing />
 * </Illustration>
 */
export const InteractionDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{TILES.map(({ input, column, row }) => {
			const middle = column === 1;
			return (
				<g key={input}>
					<rect
						className={
							(column + row) % 2 === 0
								? styles.near
								: styles.far
						}
						x={column * PANEL.width}
						y={row * PANEL.height}
						width={PANEL.width}
						height={PANEL.height}
					/>
					<Glyph
						input={input}
						x={column * PANEL.width + PANEL.width / 2}
						y={
							row * PANEL.height +
							(middle ? (row === 0 ? 125 : 175) : 150)
						}
					/>
				</g>
			);
		})}
		<rect
			className={styles.control}
			x={CONTROL.x}
			y={CONTROL.y}
			width={CONTROL.width}
			height={CONTROL.height}
			rx={CONTROL.height / 2}
		/>
	</svg>
);
