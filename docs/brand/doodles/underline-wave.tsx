import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn wavy underline.
 *
 * @example
 * <UnderlineWave size={120} />
 */
export const UnderlineWave = (props: DoodleProps) => (
	<Doodle
		width={120}
		height={20}
		d="M3 12C9 4 15 4 20 11C25 18 31 18 36 10.5C41 3.5 47 4 52 11C57 17.8 63 17 68 10C73 3.6 79 4.4 84 11.2C89 17.6 95 16.6 100 9.8C104.5 4.2 110 4.8 117 10.6"
		{...props}
	/>
);
