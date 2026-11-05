import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import VolumeIcon from "@material-design-icons/svg/outlined/volume_up.svg?react";
import styles from "./accessibility-figures.module.scss";

type Box = Readonly<{
	x: number;
	y: number;
	width: number;
	height: number;
}>;

const RING_GAP = 14;
const CHIP = { y: 150, width: 210, height: 96 } as const;
const CHIPS = [-70, 170] as const;
const REMOVED = 410;
const INPUT: Box = {
	x: 690,
	y: CHIP.y,
	width: 620,
	height: CHIP.height,
};

const Pill = ({
	box,
	className,
}: Readonly<{
	box: Box;
	className: string | undefined;
}>) => (
	<rect
		className={className}
		x={box.x}
		y={box.y}
		width={box.width}
		height={box.height}
		rx={box.height / 2}
	/>
);

const chipAt = (x: number): Box => ({
	x,
	y: CHIP.y,
	width: CHIP.width,
	height: CHIP.height,
});

/**
 * Keeping your place: a row of chips with one just removed, its slot left
 * dashed, and focus caught by the field beside it rather than lost.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<KeepPlaceDrawing />
 * </Illustration>
 */
export const KeepPlaceDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.keep}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{CHIPS.map(x => (
			<g key={x}>
				<Pill box={chipAt(x)} className={styles.control} />
				<CloseIcon
					className={styles.onControl}
					x={x + CHIP.width - 76}
					y={CHIP.y + 24}
					width="48"
					height="48"
				/>
			</g>
		))}
		<Pill box={chipAt(REMOVED)} className={styles.slot} />
		<Pill box={INPUT} className={styles.control} />
		<rect
			className={styles.ring}
			x={INPUT.x - RING_GAP}
			y={INPUT.y - RING_GAP}
			width={INPUT.width + 2 * RING_GAP}
			height={INPUT.height + 2 * RING_GAP}
			rx={INPUT.height / 2 + RING_GAP}
		/>
	</svg>
);

const KEY = {
	x: -40,
	y: 262,
	size: 92,
	gap: 18,
	count: 8,
} as const;
const BUBBLE = {
	x: 846,
	y: 56,
	width: 290,
	height: 170,
	radius: 40,
	tail: 46,
} as const;
const SPEAKER =
	Math.min(BUBBLE.width, BUBBLE.height) * 0.72;

const BUBBLE_PATH = [
	`M${BUBBLE.x + BUBBLE.radius} ${BUBBLE.y}`,
	`H${BUBBLE.x + BUBBLE.width - BUBBLE.radius}`,
	`A${BUBBLE.radius} ${BUBBLE.radius} 0 0 1 ${BUBBLE.x + BUBBLE.width} ${BUBBLE.y + BUBBLE.radius}`,
	`V${BUBBLE.y + BUBBLE.height - BUBBLE.radius}`,
	`A${BUBBLE.radius} ${BUBBLE.radius} 0 0 1 ${BUBBLE.x + BUBBLE.width - BUBBLE.radius} ${BUBBLE.y + BUBBLE.height}`,
	`H${BUBBLE.x + BUBBLE.radius + BUBBLE.tail}`,
	`L${BUBBLE.x + BUBBLE.radius} ${BUBBLE.y + BUBBLE.height + BUBBLE.tail}`,
	`V${BUBBLE.y + BUBBLE.height}`,
	`A${BUBBLE.radius} ${BUBBLE.radius} 0 0 1 ${BUBBLE.x} ${BUBBLE.y + BUBBLE.height - BUBBLE.radius}`,
	`V${BUBBLE.y + BUBBLE.radius}`,
	`A${BUBBLE.radius} ${BUBBLE.radius} 0 0 1 ${BUBBLE.x + BUBBLE.radius} ${BUBBLE.y}`,
	"Z",
].join(" ");

/**
 * Speaking at the right moment: a row of flat keys typed in silence, and one
 * speech bubble, its speaker inside, rising from just after the last of them.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<SpeakDrawing />
 * </Illustration>
 */
export const SpeakDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.speak}>
		<rect
			className={styles.speakField}
			width="1200"
			height="400"
		/>
		{Array.from({ length: KEY.count }, (_, index) => (
			<rect
				key={index}
				className={styles.key}
				x={KEY.x + index * (KEY.size + KEY.gap)}
				y={KEY.y}
				width={KEY.size}
				height={KEY.size}
				rx={KEY.size * 0.2}
			/>
		))}
		<path className={styles.bubble} d={BUBBLE_PATH} />
		<VolumeIcon
			className={styles.speaker}
			x={BUBBLE.x + BUBBLE.width / 2 - SPEAKER / 2}
			y={BUBBLE.y + BUBBLE.height / 2 - SPEAKER / 2}
			width={SPEAKER}
			height={SPEAKER}
		/>
	</svg>
);
