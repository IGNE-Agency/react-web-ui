import { Doodle, type DoodleProps } from "./doodle.tsx";

/**
 * A hand-drawn five-pointed star, closed with a small overlap.
 *
 * @example
 * <Star size={48} />
 */
export const Star = (props: DoodleProps) => (
	<Doodle
		width={48}
		height={48}
		d="M24 5.5Q26.4 12 29.2 18.2Q36 18.6 43 19.4Q37.6 23.4 32.4 27.6Q34 34.4 35.6 41.4Q29.6 37.4 24.2 33.6Q18.4 37.6 12.6 41Q14 34 15.8 27.4Q10.2 23.2 5 19.2Q12 18.4 18.8 18Q21.2 11.4 24.6 4.6"
		{...props}
	/>
);
