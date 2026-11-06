import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn arrow that loops once on its way to the right.
 *
 * @example
 * <ArrowLoop size={96} />
 */
export const ArrowLoop = (props: DoodleProps) => (
	<Doodle
		width={96}
		height={56}
		d="M6 8C10 26 20 42 36 40C48 38 56 26 50 18C45 11 34 13 34 22C34 32 42 42 56 44C68 46 80 38 88 26M77.6 30.2Q82.8 28.4 88.2 25.6Q88.6 31.4 88.2 37.2"
		{...props}
	/>
);
