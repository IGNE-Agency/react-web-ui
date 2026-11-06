import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn arrow that sweeps up and to the right.
 *
 * @example
 * <ArrowCurved size={80} />
 */
export const ArrowCurved = (props: DoodleProps) => (
	<Doodle
		width={80}
		height={56}
		d="M5 48C13.6 23 37 8.6 70.2 12.6M60.8 4.2Q66 8.4 70.4 12.6Q65.4 15.6 59.4 18.4"
		{...props}
	/>
);
