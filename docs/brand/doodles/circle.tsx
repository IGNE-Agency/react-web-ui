import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn ring, the kind drawn around a word, whose end runs past its
 * start.
 *
 * @example
 * <Circle size={64} />
 */
export const Circle = (props: DoodleProps) => (
	<Doodle
		width={64}
		height={40}
		d="M44 6.5C34 3.2 14 4.6 6.4 13.8C0.8 21 6.6 32.6 22 35.4C36 37.8 56.4 34.4 59.4 23.2C62 13.6 50.2 6.4 36.8 5.8C30 5.6 24.6 6.8 20.8 8.4"
		{...props}
	/>
);
