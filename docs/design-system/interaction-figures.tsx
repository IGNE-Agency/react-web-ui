import styles from "./interaction-figures.module.scss";

const LETTER = 57;
const WORD_GAP = 56;
const WORDS = [3, 5, 2, 4, 3] as const;
const LEFT = 30;
const BASELINE = 230;
const LINK = 1;
const DISCLOSURE = 3;
const DOT = 8;

type Word = Readonly<{
	length: number;
	x: number;
	width: number;
}>;

const WORD_RUN = WORDS.reduce<readonly Word[]>(
	(placed, length) => {
		const last = placed.at(-1);
		const x =
			last === undefined
				? LEFT
				: last.x + last.width + WORD_GAP;
		return placed.concat({
			length,
			x,
			width: length * LETTER - 10,
		});
	},
	[],
);

/**
 * Two promises in a line of text: every letter drawn the same, two words in
 * white, one over a solid underline that goes somewhere and one over dots
 * that open something here.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<PromisesDrawing />
 * </Illustration>
 */
export const PromisesDrawing = () => {
	const link = WORD_RUN[LINK];
	const disclosure = WORD_RUN[DISCLOSURE];
	return (
		<svg viewBox="0 0 1200 400" className={styles.promises}>
			<rect
				className={styles.field}
				width="1200"
				height="400"
			/>
			{WORD_RUN.map((word, index) =>
				Array.from({ length: word.length }, (_, letter) => (
					<text
						key={`${word.x}-${letter}`}
						className={
							index === LINK || index === DISCLOSURE
								? styles.marked
								: styles.letter
						}
						x={word.x + letter * LETTER}
						y={BASELINE}>
						a
					</text>
				)),
			)}
			{link === undefined ? null : (
				<rect
					className={styles.paper}
					x={link.x}
					y={BASELINE + 32}
					width={link.width}
					height="16"
					rx="8"
				/>
			)}
			{disclosure === undefined
				? null
				: Array.from(
						{
							length:
								Math.floor(disclosure.width / (DOT * 3.4)) +
								1,
						},
						(_, index) => (
							<circle
								key={index}
								className={styles.paper}
								cx={disclosure.x + DOT + index * DOT * 3.4}
								cy={BASELINE + 40}
								r={DOT}
							/>
						),
					)}
		</svg>
	);
};
