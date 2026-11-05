import styles from "./changelog-drawing.module.scss";
import { roundedPolygon } from "./rounded-polygon";

const SHEET = {
	x: 330,
	y: 56,
	width: 640,
	height: 720,
} as const;
const MARKER_X = SHEET.x + 76;
const TEXT_X = SHEET.x + 116;
const LEADING = 52;
const BAR = 22;
const STROKE = 8;
const MARK = 30;
const TAG_HEIGHT = 44;

type Change = "added" | "changed" | "removed";

type Release = Readonly<{
	top: number;
	tag: Readonly<{ width: number; latest: boolean }>;
	changes: readonly Readonly<{
		kind: Change;
		width: number;
	}>[];
}>;

const RELEASES: readonly Release[] = [
	{
		top: 116,
		tag: { width: 170, latest: true },
		changes: [
			{ kind: "added", width: 380 },
			{ kind: "added", width: 300 },
			{ kind: "changed", width: 340 },
			{ kind: "removed", width: 220 },
		],
	},
	{
		top: 472,
		tag: { width: 150, latest: false },
		changes: [
			{ kind: "added", width: 340 },
			{ kind: "removed", width: 260 },
		],
	},
];

const RIBBON = roundedPolygon(
	[
		[868, SHEET.y],
		[924, SHEET.y],
		[924, 196],
		[896, 172],
		[868, 196],
	],
	6,
);

const Marker = ({
	kind,
	y,
}: Readonly<{ kind: Change; y: number }>) => {
	const bar = (vertical: boolean) => (
		<rect
			className={styles.deep}
			x={
				vertical
					? MARKER_X - STROKE / 2
					: MARKER_X - MARK / 2
			}
			y={vertical ? y - MARK / 2 : y - STROKE / 2}
			width={vertical ? STROKE : MARK}
			height={vertical ? MARK : STROKE}
			rx={STROKE / 2}
		/>
	);
	switch (kind) {
		case "added":
			return (
				<>
					{bar(false)}
					{bar(true)}
				</>
			);
		case "removed":
			return bar(false);
		case "changed":
		default:
			return (
				<circle
					className={styles.ring}
					cx={MARKER_X}
					cy={y}
					r={MARK / 2 - STROKE / 2}
				/>
			);
	}
};

/**
 * The guide's Changelog opener: one sheet of release notes, newest at the
 * top under a bookmark, each release a version tag over its added, changed
 * and removed lines, the sheet running on past the bottom of the frame.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ChangelogDrawing />
 * </Illustration>
 */
export const ChangelogDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		<line
			className={styles.rule}
			x1={MARKER_X}
			x2={MARKER_X}
			y1="0"
			y2="600"
		/>
		{RELEASES.map(({ top }) => (
			<line
				key={top}
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={top + TAG_HEIGHT / 2}
				y2={top + TAG_HEIGHT / 2}
			/>
		))}
		<rect
			className={styles.sheet}
			x={SHEET.x}
			y={SHEET.y}
			width={SHEET.width}
			height={SHEET.height}
			rx="36"
		/>
		<path className={styles.deep} d={RIBBON} />
		{RELEASES.map(({ top, tag, changes }) => (
			<g key={top}>
				<rect
					className={tag.latest ? styles.deep : styles.mid}
					x={MARKER_X - MARK / 2}
					y={top}
					width={tag.width}
					height={TAG_HEIGHT}
					rx={TAG_HEIGHT / 2}
				/>
				<rect
					className={styles.pale}
					x={MARKER_X - MARK / 2 + tag.width + 20}
					y={top}
					width="110"
					height={TAG_HEIGHT}
					rx={TAG_HEIGHT / 2}
				/>
				{changes.map(({ kind, width }, index) => {
					const y = top + TAG_HEIGHT + 46 + index * LEADING;
					return (
						<g key={y}>
							<Marker kind={kind} y={y} />
							<rect
								className={styles.pale}
								x={TEXT_X}
								y={y - BAR / 2}
								width={width}
								height={BAR}
								rx={BAR / 2}
							/>
						</g>
					);
				})}
			</g>
		))}
	</svg>
);
