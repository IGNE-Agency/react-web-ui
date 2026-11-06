import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn asterisk of three crossing strokes.
 *
 * @example
 * <Asterisk size={48} />
 */
export const Asterisk = (props: DoodleProps) => (
	<Doodle
		width={48}
		height={48}
		d="M24.6 6Q23.4 24 23.8 42.5M8.4 14.6Q24 23 39.6 33.2M39 13.8Q24.6 24.6 8.8 34.4"
		{...props}
	/>
);
