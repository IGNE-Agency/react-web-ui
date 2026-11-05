import styles from "./drafts-components.module.scss";

type Point = Readonly<{ x: number; y: number }>;
type Part = Readonly<{
	grow: (margin: number) => string;
	peg: Point;
}>;

const round = (value: number) =>
	Math.round(value * 100) / 100;

const polygon = (points: readonly Point[]) =>
	`M${points.map(point => `${round(point.x)} ${round(point.y)}`).join(" L")} Z`;

const circle = (center: Point, radius: number) =>
	`M${round(center.x - radius)} ${round(center.y)} a${radius} ${radius} 0 1 0 ${radius * 2} 0 a${radius} ${radius} 0 1 0 ${-radius * 2} 0 Z`;

const rect = (
	x: number,
	y: number,
	width: number,
	height: number,
	radius = 0,
) => {
	const r = Math.min(radius, width / 2, height / 2);
	return r === 0
		? `M${x} ${y} h${width} v${height} h${-width} Z`
		: `M${x + r} ${y} h${width - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${height - 2 * r} a${r} ${r} 0 0 1 ${-r} ${r} h${-(width - 2 * r)} a${r} ${r} 0 0 1 ${-r} ${-r} v${-(height - 2 * r)} a${r} ${r} 0 0 1 ${r} ${-r} Z`;
};

const grownRect =
	(
		x: number,
		y: number,
		width: number,
		height: number,
		radius = 0,
	) =>
	(margin: number) =>
		rect(
			x - margin,
			y - margin,
			width + 2 * margin,
			height + 2 * margin,
			radius + margin,
		);

const disc = (
	x: number,
	top: number,
	size: number,
): Part => ({
	grow: margin =>
		circle({ x, y: top + size / 2 }, size / 2 + margin),
	peg: { x, y: top + size * 0.2 },
});

const square = (
	x: number,
	top: number,
	size: number,
): Part => ({
	grow: grownRect(x - size / 2, top, size, size),
	peg: { x, y: top + size * 0.2 },
});

const pill = (
	x: number,
	top: number,
	width: number,
	height: number,
): Part => ({
	grow: grownRect(
		x - width / 2,
		top,
		width,
		height,
		width / 2,
	),
	peg: { x, y: top + width / 2 },
});

const triangle = (
	x: number,
	top: number,
	size: number,
): Part => {
	const height = (size * Math.sqrt(3)) / 2;
	const center = { x, y: top + (height * 2) / 3 };
	return {
		grow: margin => {
			const reach = 2 * (height / 3 + margin);
			return polygon(
				[-90, 30, 150].map(degrees => ({
					x:
						center.x +
						reach * Math.cos((degrees * Math.PI) / 180),
					y:
						center.y +
						reach * Math.sin((degrees * Math.PI) / 180),
				})),
			);
		},
		peg: { x, y: top + height * 0.42 },
	};
};

const ell = (
	x: number,
	top: number,
	size: number,
	thick: number,
): Part => {
	const left = x - size / 2;
	const upright = grownRect(left, top, thick, size);
	const foot = grownRect(
		left,
		top + size - thick,
		size,
		thick,
	);
	return {
		grow: margin => `${upright(margin)} ${foot(margin)}`,
		peg: { x: left + thick / 2, y: top + thick / 2 },
	};
};

const plus = (
	x: number,
	top: number,
	size: number,
	thick: number,
): Part => {
	const upright = grownRect(
		x - thick / 2,
		top,
		thick,
		size,
	);
	const bar = grownRect(
		x - size / 2,
		top + size / 2 - thick / 2,
		size,
		thick,
	);
	return {
		grow: margin => `${upright(margin)} ${bar(margin)}`,
		peg: { x, y: top + thick / 2 },
	};
};

const halfDisc = (
	x: number,
	top: number,
	size: number,
): Part => {
	const radius = size / 2;
	return {
		grow: margin => {
			const r = radius + margin;
			return `M${x - r} ${top} A${r} ${r} 0 0 0 ${x + r} ${top} Z ${rect(x - r, top - margin, 2 * r, margin + 1)}`;
		},
		peg: { x, y: top + radius * 0.4 },
	};
};

const diamond = (
	x: number,
	top: number,
	size: number,
): Part => {
	const center = { x, y: top + size / 2 };
	return {
		grow: margin => {
			const reach = size / 2 + margin * Math.SQRT2;
			return polygon([
				{ x: center.x, y: center.y - reach },
				{ x: center.x + reach, y: center.y },
				{ x: center.x, y: center.y + reach },
				{ x: center.x - reach, y: center.y },
			]);
		},
		peg: { x, y: top + size * 0.28 },
	};
};

const HOLES = { pitch: 75, radius: 8 } as const;

const Board = ({
	className,
	parts,
	rim,
	empty,
	extra,
	holes = false,
}: Readonly<{
	className: string | undefined;
	parts: readonly Part[];
	rim: number;
	empty?: number;
	extra?: Part;
	holes?: boolean;
}>) => (
	<svg viewBox="0 0 1200 600" className={className}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		{holes ? (
			<path
				className={styles.hole}
				d={Array.from({ length: 16 }, (_, column) =>
					Array.from({ length: 8 }, (__, row) =>
						circle(
							{
								x: HOLES.pitch / 2 + column * HOLES.pitch,
								y: HOLES.pitch / 2 + row * HOLES.pitch,
							},
							HOLES.radius,
						),
					),
				)
					.flat()
					.join(" ")}
			/>
		) : null}
		<path
			className={styles.paint}
			d={parts.map(part => part.grow(rim)).join(" ")}
		/>
		<path
			className={styles.part}
			d={parts
				.filter((_, index) => index !== empty)
				.map(part => part.grow(0))
				.join(" ")}
		/>
		{extra === undefined ? null : (
			<path className={styles.paper} d={extra.grow(0)} />
		)}
	</svg>
);

const ROW_A: readonly Part[] = [
	disc(180, 190, 220),
	square(480, 200, 200),
	triangle(790, 185, 250),
	pill(1070, 120, 130, 360),
];

/**
 * Components opener draft A: four parts, each on a place painted in its
 * shape, and the painted place of the one that is out.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerA />
 * </Illustration>
 */
export const OpenerA = () => (
	<Board
		className={styles.openerA}
		parts={ROW_A}
		rim={30}
		empty={1}
	/>
);

const ROW_B: readonly Part[] = [
	pill(130, 120, 130, 340),
	disc(360, 150, 180),
	plus(600, 140, 200, 70),
	triangle(840, 120, 200),
	square(1070, 150, 170),
];

/**
 * Components opener draft B: a pegboard, five parts each on its own painted
 * place, and one place painted in full because its part is out.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerB />
 * </Illustration>
 */
export const OpenerB = () => (
	<Board
		className={styles.openerB}
		parts={ROW_B}
		rim={16}
		empty={2}
		holes
	/>
);

const ROW_C: readonly Part[] = [
	triangle(150, 150, 220),
	square(390, 170, 180),
	disc(630, 160, 200),
	pill(1070, 120, 130, 340),
];

/**
 * Components opener draft C: parts on their painted places, and a second
 * copy of one of them hanging beside it with no place of its own.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerC />
 * </Illustration>
 */
export const OpenerC = () => (
	<Board
		className={styles.openerC}
		parts={ROW_C}
		rim={16}
		extra={disc(850, 160, 200)}
	/>
);

const ROW_D: readonly Part[] = [
	disc(110, 80, 480),
	triangle(610, 60, 430),
	pill(1060, 110, 300, 700),
];

/**
 * Components opener draft D: three big parts on a board, cropped, and the
 * empty painted place of the middle one.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerD />
 * </Illustration>
 */
export const OpenerD = () => (
	<Board
		className={styles.openerD}
		parts={ROW_D}
		rim={24}
		empty={1}
	/>
);

const COLUMNS = [180, 440, 760, 1020] as const;
const ROW_E: readonly Part[] = [
	disc(COLUMNS[0], 60, 170),
	square(COLUMNS[1], 65, 160),
	triangle(COLUMNS[2], 45, 190),
	pill(COLUMNS[3], 45, 110, 200),
	ell(COLUMNS[0], 335, 170, 64),
	halfDisc(COLUMNS[1], 350, 200),
	plus(COLUMNS[2], 330, 180, 64),
	diamond(COLUMNS[3], 325, 190),
];

/**
 * Components opener draft E: eight different parts in two rows, each on its
 * own painted place, and one place empty.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<OpenerE />
 * </Illustration>
 */
export const OpenerE = () => (
	<Board
		className={styles.openerE}
		parts={ROW_E}
		rim={12}
		empty={5}
	/>
);
