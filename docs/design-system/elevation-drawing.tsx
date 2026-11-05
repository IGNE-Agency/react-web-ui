import { useId } from "react";
import styles from "./elevation-drawing.module.scss";

const TILE = {
	size: 128,
	gap: 16,
	x: -40,
	y: -36,
} as const;
const COLUMNS = 9;
const ROWS = 5;
const LIFTED = {
	column: 4,
	row: 1,
	span: 2,
	rise: 34,
} as const;
const SHADOW = { offset: 40, blur: 30 } as const;
const PITCH = TILE.size + TILE.gap;

const inSlot = (column: number, row: number) =>
	column >= LIFTED.column &&
	column < LIFTED.column + LIFTED.span &&
	row >= LIFTED.row &&
	row < LIFTED.row + LIFTED.span;

/**
 * The guide's Elevation opener: the page as a flat grid of tiles, and one
 * sheet lifted out of it, casting the only shadow and leaving its empty slot
 * behind.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ElevationDrawing />
 * </Illustration>
 */
export const ElevationDrawing = () => {
	const shadow = useId();
	const side = LIFTED.span * PITCH - TILE.gap;
	return (
		<svg viewBox="0 0 1200 600" className={styles.drawing}>
			<defs>
				<filter
					id={shadow}
					x="-60%"
					y="-60%"
					width="220%"
					height="240%">
					<feGaussianBlur
						in="SourceAlpha"
						stdDeviation={SHADOW.blur}
					/>
					<feOffset
						dx={SHADOW.offset / 3}
						dy={SHADOW.offset}
						result="shape"
					/>
					<feFlood className={styles.shade} />
					<feComposite
						in2="shape"
						operator="in"
						result="shadow"
					/>
					<feMerge>
						<feMergeNode in="shadow" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			<rect
				className={styles.field}
				width="1200"
				height="600"
			/>
			{Array.from(
				{ length: COLUMNS * ROWS },
				(_, index) => {
					const column = index % COLUMNS;
					const row = Math.floor(index / COLUMNS);
					return inSlot(column, row) ? null : (
						<rect
							key={index}
							className={styles.tile}
							x={TILE.x + column * PITCH}
							y={TILE.y + row * PITCH}
							width={TILE.size}
							height={TILE.size}
							rx="24"
						/>
					);
				},
			)}
			<rect
				className={styles.sheet}
				filter={`url(#${shadow})`}
				x={TILE.x + LIFTED.column * PITCH - LIFTED.rise}
				y={TILE.y + LIFTED.row * PITCH - LIFTED.rise}
				width={side}
				height={side}
				rx="32"
			/>
		</svg>
	);
};
