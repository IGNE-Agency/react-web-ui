import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn underline, nearly straight, rising a little at its end.
 *
 * @example
 * <UnderlineStraight size={120} />
 */
export const UnderlineStraight = (props: DoodleProps) => (
	<Doodle
		width={120}
		height={16}
		d="M3 10.5C30 9.2 62 8.4 88 8.6C100 8.7 110 7.6 117 6.2"
		{...props}
	/>
);
