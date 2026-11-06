import {
	UnderlineStraight,
	UnderlineWave,
} from "../../docs/brand/doodles/index.ts";

const UNDERLINES = {
	wave: UnderlineWave,
	straight: UnderlineStraight,
};

/**
 * The hand-drawn underline under a hero page's title. `rehypeGuide` places it.
 *
 * @example
 * const preview = { parameters: { docs: { components: { GuideUnderline } } } };
 */
export const GuideUnderline = ({
	shape,
}: Readonly<{
	/** Which underline to draw. */
	shape: keyof typeof UNDERLINES;
}>) => {
	const Underline = UNDERLINES[shape];
	return <Underline />;
};
