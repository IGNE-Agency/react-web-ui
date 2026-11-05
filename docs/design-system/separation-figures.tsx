import CalendarIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import PersonIcon from "@material-design-icons/svg/outlined/person.svg?react";
import SettingsIcon from "@material-design-icons/svg/outlined/settings.svg?react";
import styles from "./separation-figures.module.scss";

const STROKE = 8;
const TABS = [
	DescriptionIcon,
	CalendarIcon,
	PersonIcon,
	SettingsIcon,
] as const;
const TAB = {
	x: 740,
	y: 40,
	size: 88,
	pitch: 140,
	selected: 1,
} as const;
const BOXES = [64, 168, 272] as const;

/**
 * Where the line is the thing itself: a text field's outline and caret,
 * unchecked boxes, the selected tab's underline and an outlined button, each
 * drawn large in the field's own tones with only its line in white.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<LinesDrawing />
 * </Illustration>
 */
export const LinesDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.lines}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		<rect
			className={styles.outline}
			x="-40"
			y="96"
			width="540"
			height="208"
			rx="40"
		/>
		<rect
			className={styles.line}
			x="96"
			y="152"
			width={STROKE}
			height="96"
			rx={STROKE / 2}
		/>
		{BOXES.map(y => (
			<rect
				key={y}
				className={styles.outline}
				x="580"
				y={y}
				width="72"
				height="72"
				rx="14"
			/>
		))}
		{TABS.map((Glyph, index) => {
			const x = TAB.x + index * TAB.pitch;
			return (
				<Glyph
					key={x}
					className={styles.glyph}
					x={x}
					y={TAB.y}
					width={TAB.size}
					height={TAB.size}
				/>
			);
		})}
		<rect
			className={styles.line}
			x={TAB.x + TAB.selected * TAB.pitch - TAB.size * 0.15}
			y={TAB.y + TAB.size * 1.2}
			width={TAB.size * 1.3}
			height={STROKE}
			rx={STROKE / 2}
		/>
		<rect
			className={styles.outline}
			x="740"
			y="260"
			width="520"
			height="96"
			rx="48"
		/>
	</svg>
);
