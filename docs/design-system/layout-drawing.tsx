import styles from "./layout-drawing.module.scss";

const REGIONS = [
	{
		x: -40,
		y: -40,
		width: 180,
		height: 680,
		tone: styles.deep,
	},
	{
		x: 164,
		y: -40,
		width: 1076,
		height: 150,
		tone: styles.mid,
	},
	{
		x: 164,
		y: 134,
		width: 656,
		height: 506,
		tone: styles.main,
	},
	{
		x: 844,
		y: 134,
		width: 396,
		height: 246,
		tone: styles.mid,
	},
	{
		x: 844,
		y: 404,
		width: 396,
		height: 236,
		tone: styles.deep,
	},
] as const;

/**
 * The guide's Layout opener: a screen as its regions, a rail, a header, a
 * main area and a side column, each given its own room and the main one
 * standing out.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<LayoutDrawing />
 * </Illustration>
 */
export const LayoutDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{REGIONS.map(region => (
			<rect
				key={`${region.x}-${region.y}`}
				className={region.tone}
				x={region.x}
				y={region.y}
				width={region.width}
				height={region.height}
				rx="24"
			/>
		))}
	</svg>
);
