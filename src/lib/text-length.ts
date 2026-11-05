/** How a `length / maxLength` counter reads against its maximum. */
export type LengthTone = "normal" | "warning" | "error";

const WARNING_RATIO = 0.9;

/**
 * The tone a length counter shows: `warning` from 90% of the maximum, `error`
 * past it.
 *
 * @example
 * lengthTone(1900, 2000); // "warning"
 */
export const lengthTone = (
	length: number,
	maxLength: number,
): LengthTone => {
	const ratio = length / maxLength;
	if (ratio > 1) {
		return "error";
	}
	return ratio >= WARNING_RATIO ? "warning" : "normal";
};
