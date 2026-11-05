import styles from "./contributing-drawing.module.scss";

const TRUNK = 430;
const BRANCH = 190;
const FORK = 220;
const MERGE = 980;
const BEND = 170;
const PAGE = { width: 170, height: 210 } as const;
const PAGE_X = (FORK + MERGE) / 2 - PAGE.width / 2;
const LINES = [52, 92, 132] as const;

/**
 * The guide's Contributing opener: a change leaves the main line on its own
 * branch, carries one edited page, and joins the main line again.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ContributingDrawing />
 * </Illustration>
 */
export const ContributingDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{[BRANCH, TRUNK].map(y => (
			<line
				key={y}
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={y}
				y2={y}
			/>
		))}
		{[FORK, MERGE].map(x => (
			<line
				key={x}
				className={styles.rule}
				x1={x}
				x2={x}
				y1="0"
				y2="600"
			/>
		))}
		<line
			className={styles.track}
			x1="-40"
			x2="1240"
			y1={TRUNK}
			y2={TRUNK}
		/>
		<path
			className={styles.track}
			d={`M${FORK} ${TRUNK} C${FORK + BEND} ${TRUNK} ${FORK + BEND / 2} ${BRANCH} ${FORK + BEND} ${BRANCH} H${MERGE - BEND} C${MERGE - BEND / 2} ${BRANCH} ${MERGE - BEND} ${TRUNK} ${MERGE} ${TRUNK}`}
		/>
		{[FORK, MERGE].map(x => (
			<circle
				key={x}
				className={styles.node}
				cx={x}
				cy={TRUNK}
				r="34"
			/>
		))}
		<rect
			className={styles.node}
			x={PAGE_X}
			y={BRANCH - PAGE.height / 2}
			width={PAGE.width}
			height={PAGE.height}
			rx="24"
		/>
		{LINES.map((offset, index) => (
			<rect
				key={offset}
				className={styles.line}
				x={PAGE_X + 32}
				y={BRANCH - PAGE.height / 2 + offset}
				width={index === 1 ? 70 : PAGE.width - 64}
				height="18"
				rx="9"
			/>
		))}
	</svg>
);
