/**
 * The display form of a title segment taken from a file path: words split on
 * hyphens, first letter capitalised.
 *
 * @example
 * labelOf("link-button"); // "Link button"
 */
export const labelOf = (segment: string) => {
	const words = segment.replaceAll("-", " ");
	return words.charAt(0).toUpperCase() + words.slice(1);
};
