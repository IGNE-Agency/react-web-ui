const CENT_DIGITS = 2;

/**
 * Number format for a money amount, symbol included, in euro unless told
 * otherwise.
 *
 * @example
 * <NumberField format={currencyFormat("USD")} … />
 */
export const currencyFormat = (
	currency: string = "EUR",
): Intl.NumberFormatOptions => ({
	style: "currency",
	currency,
	currencyDisplay: "symbol",
	minimumFractionDigits: CENT_DIGITS,
	maximumFractionDigits: CENT_DIGITS,
});

/**
 * Number format for a percentage, where the value is the percentage itself
 * rather than a fraction: `25` renders as `25%`.
 *
 * @example
 * <NumberField format={percentFormat()} … />
 */
export const percentFormat = (
	maximumFractionDigits: number = CENT_DIGITS,
): Intl.NumberFormatOptions => ({
	style: "unit",
	unit: "percent",
	unitDisplay: "narrow",
	maximumFractionDigits,
});

/**
 * Number format for a measured quantity, using a CLDR unit identifier such as
 * `hour`, `minute` or `kilometer`.
 *
 * @example
 * <NumberField format={unitFormat("hour")} … />
 */
export const unitFormat = (
	unit: string,
	maximumFractionDigits: number = CENT_DIGITS,
): Intl.NumberFormatOptions => ({
	style: "unit",
	unit,
	unitDisplay: "short",
	maximumFractionDigits,
});
