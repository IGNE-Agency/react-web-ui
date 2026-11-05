import styles from "./drawing-shadow.module.scss";

/**
 * An SVG filter that casts a drawing's shadow: a tight umbra and a wide, soft
 * penumbra, each offset down and to the right by its own blur.
 *
 * @example
 * <defs>
 * 	<DrawingShadow id={shadow} near={5} far={28} />
 * </defs>
 * <rect filter={`url(#${shadow})`} />
 */
export const DrawingShadow = ({
	id,
	near,
	far,
}: Readonly<{ id: string; near: number; far: number }>) => (
	<filter
		id={id}
		x="-50%"
		y="-50%"
		width="200%"
		height="250%">
		<feGaussianBlur in="SourceAlpha" stdDeviation={near} />
		<feOffset dx={near / 2} dy={near} result="umbraShape" />
		<feFlood className={styles.umbra} />
		<feComposite
			in2="umbraShape"
			operator="in"
			result="umbra"
		/>
		<feGaussianBlur in="SourceAlpha" stdDeviation={far} />
		<feOffset
			dx={far / 2}
			dy={far}
			result="penumbraShape"
		/>
		<feFlood className={styles.penumbra} />
		<feComposite
			in2="penumbraShape"
			operator="in"
			result="penumbra"
		/>
		<feMerge>
			<feMergeNode in="penumbra" />
			<feMergeNode in="umbra" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
);
