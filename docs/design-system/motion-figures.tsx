import { useId } from "react";
import styles from "./motion-figures.module.scss";

const RINGS_Y = 200;
const BIG = { cx: 880, r: 250 } as const;

/**
 * An indicator that grows with the wait: an instant wait is a dot, a short
 * one only the dashed ghost of a spinner, and a long one a spinner too big to
 * miss.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<WaitingDrawing />
 * </Illustration>
 */
export const WaitingDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.waiting}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		<line
			className={styles.rule}
			x1="0"
			x2="1200"
			y1={RINGS_Y}
			y2={RINGS_Y}
		/>
		<circle
			className={styles.dot}
			cx="120"
			cy={RINGS_Y}
			r="22"
		/>
		<circle
			className={styles.ghost}
			cx="360"
			cy={RINGS_Y}
			r="72"
		/>
		<circle
			className={styles.track}
			cx={BIG.cx}
			cy={RINGS_Y}
			r={BIG.r}
		/>
		<path
			className={styles.arc}
			d={`M${BIG.cx} ${RINGS_Y - BIG.r} A${BIG.r} ${BIG.r} 0 0 1 ${BIG.cx + BIG.r} ${RINGS_Y}`}
		/>
	</svg>
);

type Bone = Readonly<
	| { kind: "disc"; cx: number; cy: number; r: number }
	| {
			kind: "block";
			x: number;
			y: number;
			width: number;
			height: number;
			radius: number;
	  }
>;

const disc = (cx: number, cy: number, r: number): Bone => ({
	kind: "disc",
	cx,
	cy,
	r,
});

const block = (
	x: number,
	y: number,
	width: number,
	height: number,
	radius = height / 2,
): Bone => ({ kind: "block", x, y, width, height, radius });

const ARTICLE: readonly Bone[] = [
	block(60, 48, 500, 304, 36),
	block(660, 56, 480, 56),
	block(660, 132, 320, 56),
	disc(694, 248, 34),
	block(748, 232, 200, 30),
	block(660, 312, 600, 22),
	block(660, 350, 560, 22),
	block(660, 388, 600, 22),
];
const SWEEP = 820;

const Bones = () => (
	<>
		{ARTICLE.map(bone =>
			bone.kind === "disc" ? (
				<circle
					key={`${bone.cx}-${bone.cy}`}
					cx={bone.cx}
					cy={bone.cy}
					r={bone.r}
				/>
			) : (
				<rect
					key={`${bone.x}-${bone.y}`}
					x={bone.x}
					y={bone.y}
					width={bone.width}
					height={bone.height}
					rx={bone.radius}
				/>
			),
		)}
	</>
);

/**
 * An article before it arrives, as its loading skeleton: a cropped image
 * block, a heavy heading, the author and the first lines, with the shimmer
 * passing over them.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<PlaceholderDrawing />
 * </Illustration>
 */
export const PlaceholderDrawing = () => {
	const clip = useId();
	return (
		<svg
			viewBox="0 0 1200 400"
			className={styles.placeholderFigure}>
			<rect
				className={styles.field}
				width="1200"
				height="400"
			/>
			<g className={styles.bone}>
				<Bones />
			</g>
			<clipPath id={clip}>
				<Bones />
			</clipPath>
			<g clipPath={`url(#${clip})`}>
				<polygon
					className={styles.shimmer}
					points={`${SWEEP} 0 ${SWEEP + 150} 0 ${SWEEP - 50} 400 ${SWEEP - 200} 400`}
				/>
			</g>
		</svg>
	);
};
