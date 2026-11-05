/** The part of a `File` a size limit is decided on. */
export type SizedFile = Readonly<{
	name: string;
	size: number;
}>;

/**
 * Whether a file is over a size limit.
 *
 * @example
 * isOversized({ name: "scan.pdf", size: 2048 }, 1024); // true
 */
export const isOversized = (
	file: SizedFile,
	maxBytes: number,
): boolean => file.size > maxBytes;

/**
 * The files over a size limit, in the order they were given. The rest of the
 * selection is left alone, so a rejected file can be pointed at and removed
 * rather than disappearing.
 *
 * @example
 * oversizedFiles([{ name: "a", size: 1 }, { name: "b", size: 9 }], 5); // [{ name: "b", size: 9 }]
 */
export const oversizedFiles = <TFile extends SizedFile>(
	files: readonly TFile[],
	maxBytes: number,
): readonly TFile[] =>
	files.filter(file => isOversized(file, maxBytes));
