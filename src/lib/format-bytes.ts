const BYTE_SYMBOLS = ["B", "kB", "MB", "GB", "TB"] as const;

/**
 * Formats a byte count into a short, human-readable size, scaled to the
 * largest fitting unit (base 1024, as used for file sizes). The number is
 * formatted in `locale`; the symbols are the locale-invariant SI ones.
 *
 * @example
 * formatBytes(1536, "nl-NL"); // "1,5 kB"
 * formatBytes(10, "en-US"); // "10 B"
 */
export const formatBytes = (
	bytes: number,
	locale: string,
): string => {
	const exponent = Math.min(
		bytes <= 0 ? 0 : Math.floor(Math.log2(bytes) / 10),
		BYTE_SYMBOLS.length - 1,
	);
	const value = new Intl.NumberFormat(locale, {
		maximumFractionDigits: exponent === 0 ? 0 : 1,
	}).format(bytes / 1024 ** exponent);
	return `${value} ${BYTE_SYMBOLS[exponent] ?? "B"}`;
};
