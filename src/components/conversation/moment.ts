import type { Temporal } from "temporal-polyfill";
import { isoToZonedDateTime } from "../../lib/iso-zoned.ts";

/** A moment in a conversation: an instant, or an ISO-8601 string for one. */
export type ConversationMoment = string | Temporal.Instant;

/**
 * The moment an instant or ISO-8601 string denotes in `timeZone`, or `null` for
 * missing or unparseable input.
 *
 * @example
 * toZonedDateTime("2026-05-26T22:30:00Z", "Europe/Amsterdam"); // 2026-05-27T00:30+02:00
 */
export const toZonedDateTime = (
	value: ConversationMoment | null | undefined,
	timeZone: string,
): Temporal.ZonedDateTime | null => {
	if (value === null || value === undefined) {
		return null;
	}
	if (typeof value === "string") {
		return isoToZonedDateTime(value, timeZone);
	}
	return value.toZonedDateTimeISO(timeZone);
};
