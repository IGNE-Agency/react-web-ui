import styles from "./language-figures.module.scss";

const NAMES = [
	[
		"zorgvrager",
		"patiënt",
		"klant",
		"verzekerde",
		"deelnemer",
	],
	["aanvrager", "patiënt", "klant", "cliënt", "zorgvrager"],
	[
		"deelnemer",
		"verzekerde",
		"zorgvrager",
		"patiënt",
		"klant",
	],
] as const;

const CHOSEN = "cliënt";

/**
 * Rows of the words that could name the person in care, and among them the
 * one the product uses.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<NameDrawing />
 * </Illustration>
 */
export const NameDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.figure}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{NAMES.map((row, index) => (
			<text
				key={row.join(" ")}
				className={styles.names}
				x={index === 1 ? -40 : -140}
				y={110 + index * 110}>
				{row.map((word, position) => (
					<tspan
						key={`${word}${String(position)}`}
						className={
							word === CHOSEN ? styles.chosen : styles.other
						}>
						{`${word} `}
					</tspan>
				))}
			</text>
		))}
	</svg>
);

const CHIP = {
	height: 72,
	gap: 24,
	pad: 32,
	bar: 24,
	left: 72,
	right: 1128,
	pitch: 104,
	top: 52,
} as const;
const CHIPS = [
	200, 260, 170, 320, 300, 240, 190, 280, 210, 330,
] as const;
const WRAPPED = 300;

type Placed = Readonly<{
	width: number;
	x: number;
	row: number;
}>;

const flow = (widths: readonly number[]) =>
	widths.reduce<readonly Placed[]>((placed, width) => {
		const last = placed.at(-1);
		const next =
			last === undefined
				? CHIP.left
				: last.x + last.width + CHIP.gap;
		const row = last?.row ?? 0;
		return next + width > CHIP.right
			? placed.concat({ width, x: CHIP.left, row: row + 1 })
			: placed.concat({ width, x: next, row });
	}, []);

/**
 * Chips flowing along rows of one height, and the one that no longer fits on
 * the first row starting the second.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<WrapDrawing />
 * </Illustration>
 */
export const WrapDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.wrap}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{flow(CHIPS).map(({ width, x, row }) => {
			const wrapped = width === WRAPPED;
			const y = CHIP.top + row * CHIP.pitch;
			return (
				<g key={`${String(x)}-${String(row)}`}>
					<rect
						className={
							wrapped ? styles.chosen : styles.chip
						}
						x={x}
						y={y}
						width={width}
						height={CHIP.height}
						rx={CHIP.height / 2}
					/>
					<rect
						className={wrapped ? styles.chip : styles.label}
						x={x + CHIP.pad}
						y={y + (CHIP.height - CHIP.bar) / 2}
						width={width - 2 * CHIP.pad}
						height={CHIP.bar}
						rx={CHIP.bar / 2}
					/>
				</g>
			);
		})}
	</svg>
);

const SCRIPTS = [
	"ñ",
	"й",
	"ب",
	"ά",
	"कि",
	"ç",
	"한",
	"ø",
	"שָׁ",
	"ก่",
	"å",
	"ё",
	"あ",
	"ß",
	"ሀ",
	"ł",
	"Ա",
	"ő",
	"ა",
	"ž",
	"ع",
	"ş",
	"が",
	"ą",
	"ψ",
	"ğ",
	"ж",
	"ǖ",
	"ጀ",
	"ê",
	"ღ",
	"ü",
	"ף",
	"æ",
	"ป้",
	"ð",
	"글",
	"þ",
	"ժ",
	"ῷ",
	"मैं",
] as const;

const GRID = {
	cell: 100,
	glyph: 46,
	columns: 13,
	rows: 4,
	left: -20,
	top: 0,
} as const;
const PICKED = {
	column: 7,
	row: 1,
	span: 2,
	glyph: "Ể",
} as const;
const TILE_INSET = GRID.cell * 0.06;

const glyphAt = (column: number, row: number) =>
	SCRIPTS[(row * 7 + column * 3) % SCRIPTS.length] ?? "ñ";

const inTile = (column: number, row: number) =>
	column >= PICKED.column &&
	column < PICKED.column + PICKED.span &&
	row >= PICKED.row &&
	row < PICKED.row + PICKED.span;

const CELLS = Array.from(
	{ length: GRID.columns * GRID.rows },
	(_, index) => ({
		column: index % GRID.columns,
		row: Math.floor(index / GRID.columns),
	}),
).filter(({ column, row }) => !inTile(column, row));

const centre = (index: number, origin: number) =>
	origin + index * GRID.cell + GRID.cell / 2;

/**
 * A strict grid of letters and signs from many scripts, and one Vietnamese
 * capital on a tile of its own, with room for its stacked accents.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ScriptsDrawing />
 * </Illustration>
 */
export const ScriptsDrawing = () => {
	const block = PICKED.span * GRID.cell;
	const tileX = GRID.left + PICKED.column * GRID.cell;
	const tileY = GRID.top + PICKED.row * GRID.cell;
	return (
		<svg viewBox="0 0 1200 400" className={styles.scripts}>
			<rect
				className={styles.field}
				width="1200"
				height="400"
			/>
			{CELLS.map(({ column, row }) => (
				<text
					key={`${String(column)}-${String(row)}`}
					className={styles.script}
					x={centre(column, GRID.left)}
					y={centre(row, GRID.top)}
					textAnchor="middle"
					dominantBaseline="central">
					{glyphAt(column, row)}
				</text>
			))}
			<rect
				className={styles.tile}
				x={tileX + TILE_INSET}
				y={tileY + TILE_INSET}
				width={block - 2 * TILE_INSET}
				height={block - 2 * TILE_INSET}
				rx={GRID.cell * 0.18}
			/>
			<text
				className={styles.pickedScript}
				x={tileX + block / 2}
				y={tileY + block / 2}
				textAnchor="middle"
				dominantBaseline="central">
				{PICKED.glyph}
			</text>
		</svg>
	);
};
