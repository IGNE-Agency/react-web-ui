import CheckCircleIcon from "@material-design-icons/svg/filled/check_circle.svg?react";
import ErrorIcon from "@material-design-icons/svg/filled/error.svg?react";
import CalendarIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import EuroIcon from "@material-design-icons/svg/outlined/euro.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import HomeIcon from "@material-design-icons/svg/outlined/home.svg?react";
import InboxIcon from "@material-design-icons/svg/outlined/inbox.svg?react";
import LockIcon from "@material-design-icons/svg/outlined/lock.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import PersonIcon from "@material-design-icons/svg/outlined/person.svg?react";
import ScheduleIcon from "@material-design-icons/svg/outlined/schedule.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import SettingsIcon from "@material-design-icons/svg/outlined/settings.svg?react";
import type { SvgComponent } from "../../src/components/icon/index.ts";
import styles from "./patterns-figures.module.scss";

type Box = Readonly<{
	x: number;
	y: number;
	width: number;
	height: number;
}>;

const Field = () => (
	<rect
		className={styles.field}
		width="1200"
		height="400"
	/>
);

const Shape = ({
	className,
	x,
	y,
	width,
	height,
	radius,
}: Box &
	Readonly<{
		className: string | undefined;
		radius?: number;
	}>) => (
	<rect
		className={className}
		x={x}
		y={y}
		width={width}
		height={height}
		rx={radius ?? height / 2}
	/>
);

const Glyph = ({
	Svg,
	className,
	cx,
	cy,
	size,
}: Readonly<{
	Svg: SvgComponent;
	className: string | undefined;
	cx: number;
	cy: number;
	size: number;
}>) => (
	<Svg
		className={className}
		x={cx - size / 2}
		y={cy - size / 2}
		width={size}
		height={size}
	/>
);

const TILES = [
	{ x: -40, y: 28, width: 340, height: 168 },
	{ x: 324, y: 28, width: 436, height: 168 },
	{ x: 784, y: 28, width: 456, height: 168 },
	{ x: -40, y: 220, width: 460, height: 220 },
	{ x: 444, y: 220, width: 296, height: 220 },
	{ x: 764, y: 220, width: 476, height: 220 },
] as const;
const FAILED = 1;

/**
 * A screen of regions, and one of them failed in its own place while
 * everything around it stands.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<RegionDrawing />
 * </Illustration>
 */
export const RegionDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.region}>
		<Field />
		{TILES.map((tile, index) =>
			index === FAILED ? (
				<g key={tile.x + tile.y}>
					<Shape
						className={styles.mark}
						radius={28}
						{...tile}
					/>
					<Glyph
						Svg={ErrorIcon}
						className={styles.markInk}
						cx={tile.x + tile.width / 2}
						cy={tile.y + tile.height / 2}
						size={96}
					/>
				</g>
			) : (
				<g key={tile.x + tile.y}>
					<Shape
						className={styles.quiet}
						radius={28}
						{...tile}
					/>
					<Shape
						className={styles.soft}
						x={Math.max(tile.x, 0) + 32}
						y={tile.y + 32}
						width={Math.min(tile.width - 120, 200)}
						height={22}
					/>
				</g>
			),
		)}
	</svg>
);

const ROWS = {
	centres: [70, 160, 250, 340],
	widths: [560, 420, 640, 500],
	band: 76,
	changed: 1,
	check: 72,
} as const;

/**
 * A list of rows, and the one that just changed says so at its own end.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ToldDrawing />
 * </Illustration>
 */
export const ToldDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.told}>
		<Field />
		{ROWS.centres.map((cy, index) => {
			const width = ROWS.widths[index] ?? 400;
			return (
				<g key={cy}>
					<Shape
						className={styles.quiet}
						x={40}
						y={cy - ROWS.band / 2}
						width={1120}
						height={ROWS.band}
						radius={20}
					/>
					<circle
						className={styles.soft}
						cx={92}
						cy={cy}
						r={20}
					/>
					<Shape
						className={styles.soft}
						x={136}
						y={cy - 11}
						width={width}
						height={22}
					/>
					{index === ROWS.changed && (
						<Glyph
							Svg={CheckCircleIcon}
							className={styles.mark}
							cx={136 + width + 32 + ROWS.check / 2}
							cy={cy}
							size={ROWS.check}
						/>
					)}
				</g>
			);
		})}
	</svg>
);

type Inlay = Readonly<{
	Glyph: SvgComponent;
	side: "start" | "end";
}>;

const SHELL = {
	height: 100,
	radius: 18,
	glyph: 44,
	inset: 30,
	label: 22,
} as const;

const Shell = ({
	x,
	y,
	width,
	inlay,
	marked,
}: Readonly<{
	x: number;
	y: number;
	width: number;
	inlay: Inlay | undefined;
	marked: boolean;
}>) => {
	const ink = marked ? styles.markInk : styles.soft;
	const glyphX =
		inlay?.side === "start"
			? x + SHELL.inset
			: x + width - SHELL.inset - SHELL.glyph;
	const barX =
		inlay?.side === "start"
			? x + SHELL.inset * 2 + SHELL.glyph
			: x + SHELL.inset;
	const barWidth =
		width -
		SHELL.inset * 2 -
		(inlay === undefined ? 0 : SHELL.glyph + SHELL.inset) -
		width * 0.25;
	return (
		<g>
			<rect
				className={marked ? styles.mark : styles.quiet}
				x={x}
				y={y}
				width={width}
				height={SHELL.height}
				rx={SHELL.radius}
			/>
			{inlay !== undefined && (
				<inlay.Glyph
					className={ink}
					x={glyphX}
					y={y + (SHELL.height - SHELL.glyph) / 2}
					width={SHELL.glyph}
					height={SHELL.glyph}
				/>
			)}
			<Shape
				className={ink}
				x={barX}
				y={y + (SHELL.height - SHELL.label) / 2}
				width={barWidth}
				height={SHELL.label}
			/>
		</g>
	);
};

const KINDS: readonly (Inlay | undefined)[] = [
	{ Glyph: SearchIcon, side: "start" },
	{ Glyph: ExpandMoreIcon, side: "end" },
	undefined,
	{ Glyph: ScheduleIcon, side: "end" },
	{ Glyph: EuroIcon, side: "start" },
	{ Glyph: MailIcon, side: "start" },
	{ Glyph: CalendarIcon, side: "end" },
	{ Glyph: LockIcon, side: "start" },
	undefined,
	{ Glyph: ExpandMoreIcon, side: "end" },
	{ Glyph: SearchIcon, side: "start" },
	{ Glyph: PersonIcon, side: "start" },
];
const KIND_GRID = {
	width: 320,
	pitchX: 356,
	pitchY: 140,
	left: -90,
	top: 60,
	columns: 4,
	marked: 6,
} as const;

/**
 * A grid of fields of every kind, search, select, time, amount and more, all
 * in one shell, with the date field among them.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<FieldsDrawing />
 * </Illustration>
 */
export const FieldsDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.fields}>
		<Field />
		{KINDS.map((inlay, index) => (
			<Shell
				key={`${String(index % KIND_GRID.columns)}-${String(Math.floor(index / KIND_GRID.columns))}`}
				x={
					KIND_GRID.left +
					(index % KIND_GRID.columns) * KIND_GRID.pitchX
				}
				y={
					KIND_GRID.top +
					Math.floor(index / KIND_GRID.columns) *
						KIND_GRID.pitchY
				}
				width={KIND_GRID.width}
				inlay={inlay}
				marked={index === KIND_GRID.marked}
			/>
		))}
	</svg>
);

const DESTINATIONS = [
	HomeIcon,
	SearchIcon,
	InboxIcon,
	CalendarIcon,
	PersonIcon,
	SettingsIcon,
] as const;
const RAIL = {
	centre: 150,
	top: 64,
	pitch: 108,
	glyph: 60,
	pill: { width: 168, height: 84 },
	current: 1,
} as const;

/**
 * A rail of destinations kept to the frame's edge, the current one in a pill,
 * and the rest of the frame left open.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<RailDrawing />
 * </Illustration>
 */
export const RailDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.rail}>
		<Field />
		{DESTINATIONS.map((Destination, index) => {
			const y = RAIL.top + index * RAIL.pitch;
			const current = index === RAIL.current;
			return (
				<g key={y}>
					{current && (
						<rect
							className={styles.mark}
							x={RAIL.centre - RAIL.pill.width / 2}
							y={y - RAIL.pill.height / 2}
							width={RAIL.pill.width}
							height={RAIL.pill.height}
							rx={RAIL.pill.height / 2}
						/>
					)}
					<Destination
						className={
							current ? styles.markInk : styles.soft
						}
						x={RAIL.centre - RAIL.glyph / 2}
						y={y - RAIL.glyph / 2}
						width={RAIL.glyph}
						height={RAIL.glyph}
					/>
				</g>
			);
		})}
	</svg>
);
