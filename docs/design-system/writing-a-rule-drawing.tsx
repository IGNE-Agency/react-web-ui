import styles from "./writing-a-rule-drawing.module.scss";

const CARD = {
	x: 330,
	y: 64,
	width: 700,
	radius: 32,
} as const;
const LEFT = CARD.x + 56;
const RIGHT = CARD.x + CARD.width - 56;
const WIDTH = RIGHT - LEFT;
const HEADING_Y = 112;
const VISUAL = { y: 258, height: 168, gap: 24 } as const;
const TILE_WIDTH = (WIDTH - VISUAL.gap) / 2;
const NOTE = { y: 458, height: 96 } as const;
const PILL = { width: 150, height: 44 } as const;
const CALLOUT_X = 230;
const CALLOUT_RADIUS = 34;
const CALLOUTS = [
	{ label: "1", y: 167 },
	{ label: "2", y: VISUAL.y + VISUAL.height / 2 },
	{ label: "3", y: NOTE.y + NOTE.height / 2 },
] as const;

/**
 * The guide's Writing a rule opener: a rule drawn as an anatomy, its heading
 * over three numbered parts, the decision, the visual and the dashed, optional
 * code note.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<WritingARuleDrawing />
 * </Illustration>
 */
export const WritingARuleDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{[HEADING_Y, VISUAL.y, NOTE.y].map(y => (
			<line
				key={y}
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={y}
				y2={y}
			/>
		))}
		{[LEFT, RIGHT].map(x => (
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
			className={styles.card}
			x={CARD.x}
			y={CARD.y}
			width={CARD.width}
			height="620"
			rx={CARD.radius}
		/>
		<rect
			className={styles.heading}
			x={LEFT}
			y={HEADING_Y}
			width="420"
			height="36"
			rx="18"
		/>
		{[
			{ y: 172, width: WIDTH },
			{ y: 204, width: 360 },
		].map(line => (
			<rect
				key={line.y}
				className={styles.line}
				x={LEFT}
				y={line.y}
				width={line.width}
				height="18"
				rx="9"
			/>
		))}
		{[0, 1].map(index => {
			const x = LEFT + index * (TILE_WIDTH + VISUAL.gap);
			return (
				<g key={index}>
					<rect
						className={styles.tile}
						x={x}
						y={VISUAL.y}
						width={TILE_WIDTH}
						height={VISUAL.height}
						rx="20"
					/>
					<rect
						className={
							index === 0 ? styles.pill : styles.pillOutline
						}
						x={x + (TILE_WIDTH - PILL.width) / 2}
						y={VISUAL.y + (VISUAL.height - PILL.height) / 2}
						width={PILL.width}
						height={PILL.height}
						rx={PILL.height / 2}
					/>
				</g>
			);
		})}
		<rect
			className={styles.note}
			x={LEFT}
			y={NOTE.y}
			width={WIDTH}
			height={NOTE.height}
			rx="20"
		/>
		{[
			{ x: LEFT + 32, y: NOTE.y + 26, width: 140 },
			{ x: LEFT + 72, y: NOTE.y + 54, width: 280 },
		].map(line => (
			<rect
				key={line.y}
				className={styles.code}
				x={line.x}
				y={line.y}
				width={line.width}
				height="16"
				rx="8"
			/>
		))}
		{CALLOUTS.map(callout => (
			<g key={callout.label}>
				<line
					className={styles.leader}
					x1={CALLOUT_X + CALLOUT_RADIUS}
					x2={LEFT - 14}
					y1={callout.y}
					y2={callout.y}
				/>
				<circle
					className={styles.callout}
					cx={CALLOUT_X}
					cy={callout.y}
					r={CALLOUT_RADIUS}
				/>
				<text
					className={styles.numeral}
					x={CALLOUT_X}
					y={callout.y}
					textAnchor="middle"
					dominantBaseline="central">
					{callout.label}
				</text>
			</g>
		))}
	</svg>
);
