import { Temporal } from "temporal-polyfill";

type IsoParser = (
	iso: string,
	timeZone: string,
) => Temporal.ZonedDateTime;

const ISO_PARSERS: readonly IsoParser[] = [
	(iso, timeZone) =>
		Temporal.Instant.from(iso).toZonedDateTimeISO(timeZone),
	(iso, timeZone) =>
		Temporal.PlainDateTime.from(iso).toZonedDateTime(
			timeZone,
		),
];

/**
 * The moment an ISO-8601 instant or plain date-time denotes in `timeZone`, or
 * `null` when it parses as neither.
 *
 * @example
 * isoToZonedDateTime("2026-05-26T22:30:00Z", "Europe/Amsterdam"); // 2026-05-27T00:30+02:00
 */
export const isoToZonedDateTime = (
	iso: string,
	timeZone: string,
): Temporal.ZonedDateTime | null => {
	for (const parse of ISO_PARSERS) {
		try {
			return parse(iso, timeZone);
		} catch {
			continue;
		}
	}
	return null;
};
