/** What every doodle takes. */
export type DoodleProps = Readonly<{
	/** Its width in pixels; the height follows the drawing's proportions. */
	size?: number;
	className?: string;
}>;

/**
 * One hand-drawn stroke in the current text colour, hidden from assistive
 * technology. The stroke keeps its width at any size.
 *
 * @example
 * <Doodle width={48} height={48} d="M6 40 C18 20 30 12 44 8" size={32} />
 */
export const Doodle = ({
	width,
	height,
	d,
	size = width,
	className,
}: Readonly<{
	width: number;
	height: number;
	d: string;
}> &
	DoodleProps) => (
	<svg
		viewBox={`0 0 ${width} ${height}`}
		width={size}
		height={(size * height) / width}
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={2.5}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden>
		<path d={d} vectorEffect="non-scaling-stroke" />
	</svg>
);
