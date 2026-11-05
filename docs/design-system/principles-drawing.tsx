import { type ReactNode, useId } from "react";
import styles from "./principles-drawing.module.scss";

const RADIUS = 28;
const TYPE = {
	x: 40,
	y: 40,
	width: 360,
	height: 520,
} as const;
const COLOUR = {
	x: 424,
	y: 40,
	width: 736,
	height: 248,
} as const;
const LINES = {
	x: 424,
	y: 312,
	width: 736,
	height: 248,
} as const;
const BASELINE = 410;
const SPLIT = 864;
const STEPS = [4, 8, 12, 16, 24, 32, 48, 64, 96] as const;
const SWATCHES = [
	{ cx: 740, tone: styles.warm },
	{ cx: 915, tone: styles.paper },
	{ cx: 1090, tone: styles.oppositeMuted },
] as const;
const RULES = STEPS.flatMap(step => [step, step]).reduce<
	readonly number[]
>(
	(xs, step) =>
		xs.concat((xs.at(-1) ?? LINES.x) + step + 4),
	[],
);

type Rect = Readonly<{
	x: number;
	y: number;
	width: number;
	height: number;
}>;

const Box = ({
	rect,
	className,
	children,
}: Readonly<{
	rect: Rect;
	className: string | undefined;
	children: ReactNode;
}>) => {
	const clip = useId();
	return (
		<>
			<clipPath id={clip}>
				<rect {...rect} rx={RADIUS} />
			</clipPath>
			<g clipPath={`url(#${clip})`}>
				<rect className={className} {...rect} />
				{children}
			</g>
		</>
	);
};

/**
 * The guide's Principles opener: the foundation's values packed into boxes,
 * type in one, colour in another, and in the last a texture of lines spaced
 * by the spacing scale, running on across two halves.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<PrinciplesDrawing />
 * </Illustration>
 */
export const PrinciplesDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		<Box rect={TYPE} className={styles.neighbour}>
			<line
				className={styles.baseline}
				x1={TYPE.x}
				x2={TYPE.x + TYPE.width}
				y1={BASELINE}
				y2={BASELINE}
			/>
			<text
				className={styles.letters}
				x={TYPE.x + 28}
				y={BASELINE}>
				{"Ag"}
			</text>
		</Box>
		<Box rect={COLOUR} className={styles.opposite}>
			{SWATCHES.map(swatch => (
				<circle
					key={swatch.cx}
					className={swatch.tone}
					cx={swatch.cx}
					cy={COLOUR.y + COLOUR.height / 2}
					r="100"
				/>
			))}
		</Box>
		<Box rect={LINES} className={styles.hot}>
			<rect
				className={styles.cool}
				x={SPLIT}
				y={LINES.y}
				width={LINES.x + LINES.width - SPLIT}
				height={LINES.height}
			/>
			{RULES.map(x => (
				<line
					key={x}
					className={
						x < SPLIT ? styles.hotLine : styles.coolLine
					}
					x1={x}
					x2={x}
					y1={LINES.y}
					y2={LINES.y + LINES.height}
				/>
			))}
		</Box>
	</svg>
);
