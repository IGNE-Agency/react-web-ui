import { useId } from "react";
import styles from "./token-figures.module.scss";

const SWATCH = {
	x: -40,
	y: 40,
	width: 360,
	height: 420,
} as const;
const CHECK = "M-22 2 L-6 18 L24 -14";

/**
 * One decision, many places: a paint chip in one colour, and the controls
 * that use it, a button, a focus ring, a checkbox, a toggle, a radio and a
 * slider, each wearing that same colour.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<NameDrawing />
 * </Illustration>
 */
export const NameDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.name}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		<rect
			className={styles.accent}
			x={SWATCH.x}
			y={SWATCH.y}
			width={SWATCH.width}
			height={SWATCH.height}
			rx="28"
		/>
		<circle
			className={styles.hole}
			cx={SWATCH.x + SWATCH.width - 56}
			cy={SWATCH.y + 56}
			r="18"
		/>
		<rect
			className={styles.accent}
			x="440"
			y="96"
			width="240"
			height="80"
			rx="40"
		/>
		<circle
			className={styles.quiet}
			cx="820"
			cy="136"
			r="44"
		/>
		<circle
			className={styles.ring}
			cx="820"
			cy="136"
			r="62"
		/>
		<rect
			className={styles.accent}
			x="960"
			y="96"
			width="80"
			height="80"
			rx="20"
		/>
		<path
			className={styles.mark}
			d={CHECK}
			transform="translate(1000 136) scale(1.3)"
		/>
		<rect
			className={styles.accent}
			x="440"
			y="256"
			width="200"
			height="96"
			rx="48"
		/>
		<circle
			className={styles.paper}
			cx="592"
			cy="304"
			r="36"
		/>
		<circle
			className={styles.ring}
			cx="820"
			cy="304"
			r="46"
		/>
		<circle
			className={styles.accent}
			cx="820"
			cy="304"
			r="22"
		/>
		<rect
			className={styles.quiet}
			x="940"
			y="294"
			width="300"
			height="20"
			rx="10"
		/>
		<rect
			className={styles.accent}
			x="940"
			y="294"
			width="160"
			height="20"
			rx="10"
		/>
		<circle
			className={styles.accent}
			cx="1100"
			cy="304"
			r="30"
		/>
	</svg>
);

const CAPSULE = {
	width: 108,
	height: 400,
	pitch: 138,
	top: 56,
	stagger: 40,
	mark: 30,
	count: 9,
	turn: 40,
} as const;

const toneAt = (
	lightness: number,
	chroma: number,
	turn: number,
) =>
	`oklch(from var(--drawing-neighbour-vivid) ${lightness} ${chroma} calc(h + ${turn}))`;

/**
 * Pairs that hold as the family changes: tall light capsules running off the
 * bottom edge, each with a dark mark of its own hue at the top, the hue
 * turning step by step along the row.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<RelationDrawing />
 * </Illustration>
 */
export const RelationDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.relation}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{Array.from({ length: CAPSULE.count }, (_, index) => {
			const turn = index * CAPSULE.turn;
			const x = -24 + index * CAPSULE.pitch;
			const y = CAPSULE.top + (index % 2) * CAPSULE.stagger;
			return (
				<g key={turn}>
					<rect
						x={x}
						y={y}
						width={CAPSULE.width}
						height={CAPSULE.height}
						rx={CAPSULE.width / 2}
						style={{ fill: toneAt(0.9, 0.07, turn) }}
					/>
					<circle
						cx={x + CAPSULE.width / 2}
						cy={y + CAPSULE.width / 2}
						r={CAPSULE.mark}
						style={{ fill: toneAt(0.38, 0.09, turn) }}
					/>
				</g>
			);
		})}
	</svg>
);

const SPLIT = { top: 720, bottom: 480 } as const;
const CHIP = { x: 150, y: 100, height: 200 } as const;

const ThemeChip = ({
	fill,
	ink,
}: Readonly<{
	fill: string | undefined;
	ink: string | undefined;
}>) => (
	<>
		<rect
			className={fill}
			x={CHIP.x}
			y={CHIP.y}
			width="1200"
			height={CHIP.height}
			rx={CHIP.height / 2}
		/>
		<text
			className={`${styles.chipText} ${ink}`}
			x={CHIP.x + 110}
			y="245">
			{"Approved"}
		</text>
	</>
);

/**
 * A chip that reads its roles, crossing from a light page into a dark one and
 * changing to the dark theme's colours at the line.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ThemeDrawing />
 * </Illustration>
 */
export const ThemeDrawing = () => {
	const id = useId();
	const light = `M0 0 H${SPLIT.top} L${SPLIT.bottom} 400 H0 Z`;
	const dark = `M${SPLIT.top} 0 H1200 V400 H${SPLIT.bottom} Z`;
	return (
		<svg viewBox="0 0 1200 400" className={styles.theme}>
			<defs>
				<clipPath id={`${id}light`}>
					<path d={light} />
				</clipPath>
				<clipPath id={`${id}dark`}>
					<path d={dark} />
				</clipPath>
			</defs>
			<path className={styles.lightPage} d={light} />
			<path className={styles.darkPage} d={dark} />
			<g clipPath={`url(#${id}light)`}>
				<ThemeChip
					fill={styles.lightChip}
					ink={styles.lightInk}
				/>
			</g>
			<g clipPath={`url(#${id}dark)`}>
				<ThemeChip
					fill={styles.darkChip}
					ink={styles.darkInk}
				/>
			</g>
			<line
				className={styles.rule}
				x1={SPLIT.top}
				y1="0"
				x2={SPLIT.bottom}
				y2="400"
			/>
		</svg>
	);
};
