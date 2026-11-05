import styles from "./cursor.module.scss";

const SHAPES = {
	arrow: (
		<path d="M2 1.5v16.5l4-3.8 3 6.6 2.8-1.2-3-6.4H14z" />
	),
	pointer: (
		<path d="M6 15V3.5a1.5 1.5 0 0 1 3 0V9a1.5 1.5 0 0 1 3 0v1.5a1.5 1.5 0 0 1 3 0V12a1.5 1.5 0 0 1 3 0v5.5c0 3-2 5-5 5h-2.5c-1.7 0-2.7-.7-3.7-2L2.4 15.2a1.4 1.4 0 0 1 2.2-1.8z" />
	),
	text: (
		<path
			className={styles.stroke}
			d="M5 2h2c1 0 1.5.5 1.5 1.5C8.5 2.5 9 2 10 2h2M8.5 3.5v15M5 20h2c1 0 1.5-.5 1.5-1.5 0 1 .5 1.5 1.5 1.5h2"
		/>
	),
	"not-allowed": (
		<g className={styles.stroke}>
			<circle cx="9" cy="11" r="6.5" />
			<path d="m4.4 6.4 9.2 9.2" />
		</g>
	),
};

/**
 * A drawn mouse cursor for design-system pictures, in the page's ink with a
 * halo of the surface so it reads on any fill.
 *
 * @example
 * <Cursor shape="pointer" />
 */
export const Cursor = ({
	shape,
}: Readonly<{ shape: keyof typeof SHAPES }>) => (
	<svg
		className={styles.cursor}
		viewBox="0 0 20 24"
		aria-hidden>
		{SHAPES[shape]}
	</svg>
);
