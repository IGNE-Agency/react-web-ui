import AccessibilityIcon from "@material-design-icons/svg/outlined/accessibility_new.svg?react";
import CaptionIcon from "@material-design-icons/svg/outlined/closed_caption.svg?react";
import KeyboardIcon from "@material-design-icons/svg/outlined/keyboard.svg?react";
import MicIcon from "@material-design-icons/svg/outlined/mic.svg?react";
import PointerIcon from "@material-design-icons/svg/outlined/near_me.svg?react";
import SwitchIcon from "@material-design-icons/svg/outlined/toggle_on.svg?react";
import TouchIcon from "@material-design-icons/svg/outlined/touch_app.svg?react";
import VolumeIcon from "@material-design-icons/svg/outlined/volume_up.svg?react";
import ZoomIcon from "@material-design-icons/svg/outlined/zoom_in.svg?react";
import type { SvgComponent } from "../../src/components/icon/index.ts";
import styles from "./accessibility-drawing.module.scss";

const CELL = 200;
const LEFT = -100;
const ROWS = 3;
const COLUMNS = 7;
const METHOD_SIZE = 124;
const FIGURE_SIZE = 380;
const FIGURE_CELLS = {
	rows: [0, 1],
	columns: [3, 4],
} as const;
const METHODS: readonly [SvgComponent, ...SvgComponent[]] =
	[
		KeyboardIcon,
		VolumeIcon,
		TouchIcon,
		ZoomIcon,
		PointerIcon,
		CaptionIcon,
		MicIcon,
		SwitchIcon,
	];

const isFigureCell = (row: number, column: number) =>
	FIGURE_CELLS.rows.some(index => index === row) &&
	FIGURE_CELLS.columns.some(index => index === column);

const methodAt = (row: number, column: number) =>
	METHODS[(row * 3 + column * 5) % METHODS.length] ??
	METHODS[0];

/**
 * The guide's Accessibility opener: a field of the ways people reach a
 * product, a different method in every cell, with the accessibility figure in
 * white taking the space of four of them.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<AccessibilityDrawing />
 * </Illustration>
 */
export const AccessibilityDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{Array.from({ length: ROWS }, (_, row) =>
			Array.from({ length: COLUMNS }, (__, column) => {
				if (isFigureCell(row, column)) {
					return null;
				}
				const Method = methodAt(row, column);
				return (
					<Method
						key={`${row}-${column}`}
						className={styles.method}
						x={
							LEFT +
							column * CELL +
							CELL / 2 -
							METHOD_SIZE / 2
						}
						y={row * CELL + CELL / 2 - METHOD_SIZE / 2}
						width={METHOD_SIZE}
						height={METHOD_SIZE}
					/>
				);
			}),
		)}
		<AccessibilityIcon
			className={styles.figure}
			x={LEFT + 4 * CELL - FIGURE_SIZE / 2}
			y={CELL - FIGURE_SIZE / 2}
			width={FIGURE_SIZE}
			height={FIGURE_SIZE}
		/>
	</svg>
);
