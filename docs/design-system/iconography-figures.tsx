import FilledMailIcon from "@material-design-icons/svg/filled/mail.svg?react";
import AddIcon from "@material-design-icons/svg/outlined/add.svg?react";
import BookmarkIcon from "@material-design-icons/svg/outlined/bookmark_border.svg?react";
import CalendarIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import DeleteIcon from "@material-design-icons/svg/outlined/delete.svg?react";
import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import DownloadIcon from "@material-design-icons/svg/outlined/download.svg?react";
import HomeIcon from "@material-design-icons/svg/outlined/home.svg?react";
import LockIcon from "@material-design-icons/svg/outlined/lock.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import MenuIcon from "@material-design-icons/svg/outlined/menu.svg?react";
import PrintIcon from "@material-design-icons/svg/outlined/print.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import SettingsIcon from "@material-design-icons/svg/outlined/settings.svg?react";
import ShareIcon from "@material-design-icons/svg/outlined/share.svg?react";
import type { SvgComponent } from "../../src/components/icon/index.ts";
import styles from "./iconography-figures.module.scss";

const LINE = {
	y: 200,
	size: 208,
	cell: 240,
	start: -110,
	bar: 56,
} as const;
const GUIDES = [96, 304] as const;
const WORD = 300;
const LINE_GLYPHS: readonly Readonly<{
	glyph: SvgComponent;
	word: boolean;
}>[] = [
	{ glyph: SearchIcon, word: false },
	{ glyph: CloseIcon, word: false },
	{ glyph: AddIcon, word: false },
	{ glyph: BookmarkIcon, word: true },
	{ glyph: SettingsIcon, word: false },
	{ glyph: HomeIcon, word: false },
];
const INSET = (LINE.cell - LINE.size) / 2;

const placed = LINE_GLYPHS.reduce<
	readonly Readonly<{
		glyph: SvgComponent;
		word: boolean;
		x: number;
	}>[]
>((line, item) => {
	const last = line.at(-1);
	const x =
		last === undefined
			? LINE.start
			: last.x + LINE.cell + (last.word ? WORD : 0);
	return line.concat({ ...item, x });
}, []);

/**
 * A line of glyphs drawn large, running past both edges: search, close and
 * add stand on their own, and the bookmark, which could mean several things,
 * is the one that carries its word.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<GuessDrawing />
 * </Illustration>
 */
export const GuessDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.guess}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{GUIDES.map(y => (
			<line
				key={y}
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={y}
				y2={y}
			/>
		))}
		{placed.map(({ glyph: Glyph, word, x }) => (
			<g key={x}>
				<Glyph
					className={word ? styles.paired : styles.glyph}
					x={x + INSET}
					y={LINE.y - LINE.size / 2}
					width={LINE.size}
					height={LINE.size}
				/>
				{word && (
					<rect
						className={styles.paired}
						x={x + LINE.cell - INSET / 2}
						y={LINE.y - LINE.bar / 2}
						width={WORD - INSET}
						height={LINE.bar}
						rx={LINE.bar / 2}
					/>
				)}
			</g>
		))}
	</svg>
);

const GRID_GLYPHS: readonly [
	SvgComponent,
	...SvgComponent[],
] = [
	SearchIcon,
	SettingsIcon,
	CalendarIcon,
	DownloadIcon,
	MailIcon,
	AddIcon,
	DescriptionIcon,
	HomeIcon,
	CloseIcon,
	PrintIcon,
	MenuIcon,
	DeleteIcon,
	LockIcon,
	ShareIcon,
];
const GRID = {
	cell: 100,
	glyph: 52,
	columns: 13,
	rows: 4,
	left: -50,
} as const;
const INTRUDER = { column: 7, row: 1 } as const;

/**
 * A field of glyphs from the one outlined set, and a single filled glyph from
 * another set among them, slightly off the grid, which is all the eye sees.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<FamilyDrawing />
 * </Illustration>
 */
export const FamilyDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.family}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{Array.from(
			{ length: GRID.columns * GRID.rows },
			(_, index) => {
				const column = index % GRID.columns;
				const row = Math.floor(index / GRID.columns);
				const x =
					GRID.left +
					column * GRID.cell +
					(GRID.cell - GRID.glyph) / 2;
				const y =
					row * GRID.cell + (GRID.cell - GRID.glyph) / 2;
				if (
					column === INTRUDER.column &&
					row === INTRUDER.row
				) {
					return (
						<FilledMailIcon
							key={index}
							className={styles.intruder}
							x={x + 6}
							y={y - 8}
							width={GRID.glyph + 14}
							height={GRID.glyph + 14}
						/>
					);
				}
				const Glyph =
					GRID_GLYPHS[
						(row * 5 + column) % GRID_GLYPHS.length
					] ?? GRID_GLYPHS[0];
				return (
					<Glyph
						key={index}
						className={styles.glyph}
						x={x}
						y={y}
						width={GRID.glyph}
						height={GRID.glyph}
					/>
				);
			},
		)}
	</svg>
);
