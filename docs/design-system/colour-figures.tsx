import { useId } from "react";
import styles from "./colour-figures.module.scss";

const TILE = {
	width: 92,
	height: 72,
	gap: 8,
	radius: 14,
} as const;
const GRID = {
	x: -40,
	y: -16,
	columns: 7,
	rows: 6,
} as const;
const PICKED = { column: 5, row: 2 } as const;
const SLIDER = {
	x: 700,
	y: 24,
	width: 72,
	height: 352,
	slices: 12,
} as const;
const PICKED_HUE = 1;
const SWATCH = { x: 860, y: 60, size: 420 } as const;

const tileAt = (column: number, row: number) => ({
	x: GRID.x + column * (TILE.width + TILE.gap),
	y: GRID.y + row * (TILE.height + TILE.gap),
});

/**
 * A colour picker drawn large: one hue's tiles laid out by chroma across and
 * lightness down, a hue slider beside them, and the picked colour as a big
 * swatch, with rings on what was picked.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<DialsDrawing />
 * </Illustration>
 */
export const DialsDrawing = () => {
	const slider = useId();
	const picked = tileAt(PICKED.column, PICKED.row);
	const sliceHeight = SLIDER.height / SLIDER.slices;
	const pickedY = picked.y + TILE.height / 2;
	return (
		<svg viewBox="0 0 1200 400" className={styles.dials}>
			<rect
				className={styles.field}
				width="1200"
				height="400"
			/>
			<line
				className={styles.rule}
				x1="0"
				x2="1200"
				y1={pickedY}
				y2={pickedY}
			/>
			{Array.from({ length: GRID.rows }, (_, row) =>
				Array.from(
					{ length: GRID.columns },
					(__, column) => {
						const { x, y } = tileAt(column, row);
						return (
							<rect
								key={`${row}-${column}`}
								className={styles[`tile${row}x${column}`]}
								x={x}
								y={y}
								width={TILE.width}
								height={TILE.height}
								rx={TILE.radius}
							/>
						);
					},
				),
			)}
			<rect
				className={styles.ring}
				x={picked.x - 8}
				y={picked.y - 8}
				width={TILE.width + 16}
				height={TILE.height + 16}
				rx={TILE.radius + 8}
			/>
			<clipPath id={slider}>
				<rect
					x={SLIDER.x}
					y={SLIDER.y}
					width={SLIDER.width}
					height={SLIDER.height}
					rx={SLIDER.width / 2}
				/>
			</clipPath>
			<g clipPath={`url(#${slider})`}>
				{Array.from(
					{ length: SLIDER.slices },
					(_, slice) => (
						<rect
							key={slice}
							className={styles[`hue${slice}`]}
							x={SLIDER.x}
							y={SLIDER.y + slice * sliceHeight}
							width={SLIDER.width}
							height={sliceHeight + 1}
						/>
					),
				)}
			</g>
			<rect
				className={styles.thumb}
				x={SLIDER.x - 10}
				y={SLIDER.y + PICKED_HUE * sliceHeight - 6}
				width={SLIDER.width + 20}
				height={sliceHeight + 12}
				rx={(sliceHeight + 12) / 2}
			/>
			<rect
				className={styles.picked}
				x={SWATCH.x}
				y={SWATCH.y}
				width={SWATCH.size}
				height={SWATCH.size}
				rx="56"
			/>
		</svg>
	);
};

const HUES = 12;
const BAND = { width: 50, cap: 56 } as const;
const hueAt = (index: number) => index * (360 / HUES) + 15;
const SPACES = [
	{
		left: 0,
		colourOf: (hue: number) => `hsl(${hue}deg 100% 50%)`,
	},
	{
		left: 600,
		colourOf: (hue: number) => `oklch(72% 0.13 ${hue}deg)`,
	},
] as const;

/**
 * Lightness with the colour squinted away: twelve hues set in HSL and twelve
 * set in OKLCH, each a thin cap of its colour over a tall band of the grey it
 * reads as. The HSL greys jump about; the OKLCH greys hold one level.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<PerceptualDrawing />
 * </Illustration>
 */
export const PerceptualDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.perceptual}>
		<rect
			className={styles.field}
			width="1200"
			height="400"
		/>
		{SPACES.flatMap(({ left, colourOf }) =>
			Array.from({ length: HUES }, (_, index) => {
				const colour = colourOf(hueAt(index));
				const x = left + index * BAND.width;
				return (
					<g key={`${left}-${index}`}>
						<rect
							x={x}
							y="0"
							width={BAND.width}
							height={BAND.cap}
							style={{ fill: colour }}
						/>
						<rect
							x={x}
							y={BAND.cap}
							width={BAND.width}
							height={400 - BAND.cap}
							style={{
								fill: `oklch(from ${colour} l 0 0)`,
							}}
						/>
					</g>
				);
			}),
		)}
		<line
			className={styles.divider}
			x1="600"
			x2="600"
			y1="0"
			y2="400"
		/>
	</svg>
);

const ACTION = { y: 148, height: 104 } as const;
const LABEL = { y: 186, height: 28 } as const;
const QUIET_LABELS = [
	{ x: -40, width: 336 },
	{ x: 360, width: 276 },
] as const;

/**
 * A row of actions in which one filled button carries the contrast and the
 * others sit beside it as quiet labels at the same height.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<ReserveDrawing />
 * </Illustration>
 */
export const ReserveDrawing = () => (
	<svg viewBox="0 0 1200 400" className={styles.reserve}>
		<rect
			className={styles.reserveField}
			width="1200"
			height="400"
		/>
		{QUIET_LABELS.map(label => (
			<rect
				key={label.x}
				className={styles.reserveQuiet}
				x={label.x}
				y={LABEL.y}
				width={label.width}
				height={LABEL.height}
				rx={LABEL.height / 2}
			/>
		))}
		<rect
			className={styles.reserveAction}
			x="700"
			y={ACTION.y}
			width="440"
			height={ACTION.height}
			rx={ACTION.height / 2}
		/>
		<rect
			className={styles.reserveField}
			x="810"
			y={LABEL.y}
			width="220"
			height={LABEL.height}
			rx={LABEL.height / 2}
		/>
	</svg>
);
