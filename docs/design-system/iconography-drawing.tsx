import AddIcon from "@material-design-icons/svg/outlined/add.svg?react";
import ArchiveIcon from "@material-design-icons/svg/outlined/archive.svg?react";
import AttachFileIcon from "@material-design-icons/svg/outlined/attach_file.svg?react";
import CalendarTodayIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import ChecklistIcon from "@material-design-icons/svg/outlined/checklist.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import CommentIcon from "@material-design-icons/svg/outlined/comment.svg?react";
import ContentCopyIcon from "@material-design-icons/svg/outlined/content_copy.svg?react";
import DashboardIcon from "@material-design-icons/svg/outlined/dashboard.svg?react";
import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import DownloadIcon from "@material-design-icons/svg/outlined/download.svg?react";
import FilterAltIcon from "@material-design-icons/svg/outlined/filter_alt.svg?react";
import InfoIcon from "@material-design-icons/svg/outlined/info.svg?react";
import LanguageIcon from "@material-design-icons/svg/outlined/language.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import MenuIcon from "@material-design-icons/svg/outlined/menu.svg?react";
import MoreVertIcon from "@material-design-icons/svg/outlined/more_vert.svg?react";
import PersonIcon from "@material-design-icons/svg/outlined/person.svg?react";
import SaveIcon from "@material-design-icons/svg/outlined/save.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import SettingsIcon from "@material-design-icons/svg/outlined/settings.svg?react";
import UploadFileIcon from "@material-design-icons/svg/outlined/upload_file.svg?react";
import VisibilityIcon from "@material-design-icons/svg/outlined/visibility.svg?react";
import type { SvgComponent } from "../../src/components/icon/index.ts";
import styles from "./iconography-drawing.module.scss";

const CELL = 100;
const GLYPH = 44;
const COLUMNS = 12;
const ROWS = 6;
const STRIDE = 5;

const GLYPHS: readonly SvgComponent[] = [
	SearchIcon,
	SettingsIcon,
	PersonIcon,
	CalendarTodayIcon,
	DownloadIcon,
	AttachFileIcon,
	CommentIcon,
	MailIcon,
	FilterAltIcon,
	CheckIcon,
	CloseIcon,
	AddIcon,
	InfoIcon,
	MoreVertIcon,
	MenuIcon,
	ArchiveIcon,
	DashboardIcon,
	LanguageIcon,
	VisibilityIcon,
	UploadFileIcon,
	ContentCopyIcon,
	SaveIcon,
];

const FEATURES = [
	{
		column: 6,
		row: 1,
		span: 4,
		inset: 14,
		glyph: 288,
		tiled: true,
		Glyph: DescriptionIcon,
	},
	{
		column: 1,
		row: 3,
		span: 2,
		inset: 0,
		glyph: 168,
		tiled: false,
		Glyph: ChecklistIcon,
	},
] as const;

const covered = (column: number, row: number) =>
	FEATURES.some(
		feature =>
			column >= feature.column &&
			column < feature.column + feature.span &&
			row >= feature.row &&
			row < feature.row + feature.span,
	);

const CELLS = Array.from(
	{ length: COLUMNS * ROWS },
	(_, index) => ({
		column: index % COLUMNS,
		row: Math.floor(index / COLUMNS),
	}),
).filter(({ column, row }) => !covered(column, row));

/**
 * The guide's Iconography opener: a quiet grid of the outlined glyphs these
 * docs draw, with two of them enlarged to fill a block of cells.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<IconographyDrawing />
 * </Illustration>
 */
export const IconographyDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{CELLS.map(({ column, row }) => {
			const Glyph =
				GLYPHS[(row * STRIDE + column) % GLYPHS.length] ??
				SearchIcon;
			return (
				<Glyph
					key={`${column}-${row}`}
					className={styles.small}
					x={column * CELL + (CELL - GLYPH) / 2}
					y={row * CELL + (CELL - GLYPH) / 2}
					width={GLYPH}
					height={GLYPH}
				/>
			);
		})}
		{FEATURES.map(
			({
				column,
				row,
				span,
				inset,
				glyph,
				tiled,
				Glyph,
			}) => {
				const size = span * CELL;
				return (
					<g key={`${column}-${row}`}>
						{tiled && (
							<rect
								className={styles.tile}
								x={column * CELL + inset}
								y={row * CELL + inset}
								width={size - 2 * inset}
								height={size - 2 * inset}
								rx="40"
							/>
						)}
						<Glyph
							className={styles.large}
							x={column * CELL + (size - glyph) / 2}
							y={row * CELL + (size - glyph) / 2}
							width={glyph}
							height={glyph}
						/>
					</g>
				);
			},
		)}
	</svg>
);
