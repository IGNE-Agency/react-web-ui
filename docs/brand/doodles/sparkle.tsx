import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn four-pointed sparkle.
 *
 * @example
 * <Sparkle size={48} />
 */
export const Sparkle = (props: DoodleProps) => (
	<Doodle
		width={48}
		height={48}
		d="M24 4C25.5 15 28 21.5 43.5 23.4C29 26 25.8 30 24.6 44C22.6 31 19.5 26.8 4.5 24.6C18.8 21.6 22.2 16.5 24.4 3.2"
		{...props}
	/>
);
