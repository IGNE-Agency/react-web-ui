import styles from "./states-drawing.module.scss";

type Kind =
	| "button"
	| "toggle"
	| "checkbox"
	| "radio"
	| "icon";

type Control = Readonly<{
	id: string;
	kind: Kind;
	x: number;
	y: number;
	width: number;
	height: number;
}>;

type Row = Readonly<{
	y: number;
	height: number;
	start: number;
	kinds: readonly Kind[];
}>;

const STRETCHES = [2.2, 1.7, 2.6, 1.9] as const;
const FOCUS_TARGET = { x: 600, y: 300 } as const;

const widthOf = (
	kind: Kind,
	height: number,
	stretch: number,
) =>
	kind === "button"
		? height * stretch
		: kind === "toggle"
			? height * 1.8
			: height;

const radiusOf = (kind: Kind, height: number) =>
	kind === "checkbox" ? height * 0.24 : height / 2;

const controlsOf = (rows: readonly Row[]): Control[] =>
	rows.flatMap((row, rowIndex) =>
		row.kinds
			.reduce<Control[]>((placed, kind, index) => {
				const last = placed.at(-1);
				const width = widthOf(
					kind,
					row.height,
					STRETCHES[
						(index + rowIndex) % STRETCHES.length
					] ?? 2,
				);
				return [
					...placed,
					{
						id: `${rowIndex}-${index}`,
						kind,
						x:
							last === undefined
								? row.start
								: last.x + last.width + row.height * GAP,
						y: row.y,
						width,
						height: row.height,
					},
				];
			}, [])
			.filter(control => control.x < 1200),
	);

const distanceToTarget = (control: Control) =>
	Math.hypot(
		control.x + control.width / 2 - FOCUS_TARGET.x,
		control.y + control.height / 2 - FOCUS_TARGET.y,
	);

const focusedOf = (controls: readonly Control[]) =>
	controls
		.filter(
			control =>
				control.kind === "button" &&
				control.x > 40 &&
				control.x + control.width < 1160 &&
				control.y > 40 &&
				control.y + control.height < 560,
		)
		.reduce<Control | undefined>(
			(nearest, control) =>
				nearest === undefined ||
				distanceToTarget(control) <
					distanceToTarget(nearest)
					? control
					: nearest,
			undefined,
		);

const Mark = ({
	control,
}: Readonly<{ control: Control }>) => {
	const { kind, x, y, width, height } = control;
	const middle = y + height / 2;
	switch (kind) {
		case "toggle":
			return (
				<circle
					className={styles.mark}
					cx={x + width - height / 2}
					cy={middle}
					r={height * 0.36}
				/>
			);
		case "checkbox":
			return (
				<path
					className={styles.markStroke}
					style={{ strokeWidth: height * 0.13 }}
					d={`M${x + height * 0.25} ${middle} L${x + height * 0.43} ${middle + height * 0.18} L${x + height * 0.76} ${middle - height * 0.19}`}
				/>
			);
		case "radio":
			return (
				<circle
					className={styles.mark}
					cx={x + height / 2}
					cy={middle}
					r={height * 0.24}
				/>
			);
		case "icon":
			return (
				<path
					className={styles.markStroke}
					style={{ strokeWidth: height * 0.11 }}
					d={`M${x + height / 2} ${middle - height * 0.22} V${middle + height * 0.22} M${x + height * 0.28} ${middle} H${x + height * 0.72}`}
				/>
			);
		case "button":
		default:
			return (
				<path
					className={styles.markStroke}
					style={{ strokeWidth: height * 0.11 }}
					d={`M${x + width / 2 - height * 0.2} ${middle} H${x + width / 2 + height * 0.2} M${x + width / 2 + height * 0.04} ${middle - height * 0.16} L${x + width / 2 + height * 0.2} ${middle} L${x + width / 2 + height * 0.04} ${middle + height * 0.16}`}
				/>
			);
	}
};

const GAP = 0.36;
const RING_GAP = 22;
const RING_WIDTH = 22;

const MIXED: readonly (readonly Kind[])[] = [
	[
		"checkbox",
		"button",
		"toggle",
		"radio",
		"button",
		"icon",
		"checkbox",
		"button",
	],
	[
		"toggle",
		"icon",
		"button",
		"checkbox",
		"radio",
		"button",
		"toggle",
	],
	[
		"button",
		"radio",
		"checkbox",
		"toggle",
		"button",
		"icon",
		"radio",
	],
];

const ROWS: readonly Row[] = MIXED.map((kinds, index) => ({
	y: -70 + index * 225,
	height: 170,
	start: [-210, -90, -300][index] ?? 0,
	kinds,
}));

/**
 * The States opener: a few real controls seen up close and cropped by the
 * frame, and the one the keyboard is on, white, in the focus ring a clear gap
 * outside its edge.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<StatesDrawing />
 * </Illustration>
 */
export const StatesDrawing = () => {
	const controls = controlsOf(ROWS);
	const focused = focusedOf(controls);
	return (
		<svg viewBox="0 0 1200 600" className={styles.drawing}>
			<rect
				className={styles.field}
				width="1200"
				height="600"
			/>
			{controls.map(control => {
				const isFocused = control.id === focused?.id;
				const radius = radiusOf(
					control.kind,
					control.height,
				);
				const out = RING_GAP + RING_WIDTH / 2;
				return (
					<g key={control.id}>
						{isFocused ? (
							<rect
								className={styles.ring}
								style={{ strokeWidth: RING_WIDTH }}
								x={control.x - out}
								y={control.y - out}
								width={control.width + 2 * out}
								height={control.height + 2 * out}
								rx={radius + out}
							/>
						) : null}
						<rect
							className={
								isFocused ? styles.focused : styles.control
							}
							x={control.x}
							y={control.y}
							width={control.width}
							height={control.height}
							rx={radius}
						/>
						<Mark control={control} />
					</g>
				);
			})}
		</svg>
	);
};
