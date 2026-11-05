import type { ReactNode } from "react";

const CHECK_PATH =
	"M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z";

const DASH_PATH =
	"M12 11L20 11L20 13L12 13L4 13L4 11L12 11Z";

/**
 * The tick a checkbox draws, as one path so it can morph. The indeterminate bar
 * traces the same six points with the bend flattened out.
 *
 * @example
 * <CheckboxGlyph indeterminate={isMixed} className={style.glyph} />
 */
export const CheckboxGlyph = ({
	indeterminate,
	className,
}: Readonly<{
	indeterminate?: boolean;
	className?: string;
}>): ReactNode => (
	<svg
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden="true"
		className={className}>
		<path
			d={indeterminate === true ? DASH_PATH : CHECK_PATH}
		/>
	</svg>
);
