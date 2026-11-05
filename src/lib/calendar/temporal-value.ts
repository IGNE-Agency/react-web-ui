import {
	type CalendarDate,
	parseDate,
	parseTime,
	type Time,
} from "@internationalized/date";
import { Temporal } from "temporal-polyfill";
import { isoToZonedDateTime } from "../iso-zoned.ts";

/** A plain-date range as it crosses a control's boundary. */
export type IsoDateRange = Readonly<{
	start: string;
	end: string;
}>;

/** A plain-date range as the calendar controls hold it. */
export type DayRange = Readonly<{
	start: CalendarDate;
	end: CalendarDate;
}>;

const isoToPlainDate = (
	value: string | null | undefined,
	timeZone: string,
): Temporal.PlainDate | null =>
	value === null || value === undefined || value === ""
		? null
		: (isoToZonedDateTime(value, timeZone)?.toPlainDate() ??
			null);

/**
 * The Temporal plain date a calendar control's day denotes.
 *
 * @example
 * dayToPlainDate(new CalendarDate(2026, 7, 24)); // Temporal.PlainDate 2026-07-24
 */
export const dayToPlainDate = (
	day: CalendarDate,
): Temporal.PlainDate =>
	Temporal.PlainDate.from(day.toString());

const plainDateToDay = (
	date: Temporal.PlainDate,
): CalendarDate => parseDate(date.toString());

/**
 * Today's calendar day in `timeZone`.
 *
 * @example
 * todayIn("Pacific/Kiritimati"); // CalendarDate, a day ahead of UTC for most of it
 */
export const todayIn = (timeZone: string): CalendarDate =>
	plainDateToDay(Temporal.Now.plainDateISO(timeZone));

/**
 * The calendar day an ISO date, date-time or instant falls on in `timeZone`,
 * or `null` for missing or unparseable input.
 *
 * @example
 * isoToDay("2026-07-24T12:30:00Z", "Pacific/Kiritimati"); // CalendarDate 2026-07-25
 */
export const isoToDay = (
	value: string | null | undefined,
	timeZone: string,
): CalendarDate | null => {
	const date = isoToPlainDate(value, timeZone);
	return date === null ? null : plainDateToDay(date);
};

/**
 * ISO plain-date string for a calendar day, or `null` for no day.
 *
 * @example
 * dayToIso(new CalendarDate(2026, 7, 24)); // "2026-07-24"
 */
export const dayToIso = (
	day: CalendarDate | null,
): string | null =>
	day === null ? null : dayToPlainDate(day).toString();

/**
 * The calendar days an ISO date range falls on in `timeZone`, or `null` unless
 * both ends parse.
 *
 * @example
 * isoToDayRange({ start: "2026-07-01", end: "2026-07-31" }, "Europe/Amsterdam");
 */
export const isoToDayRange = (
	range: IsoDateRange | null | undefined,
	timeZone: string,
): DayRange | null => {
	const start = isoToDay(range?.start, timeZone);
	const end = isoToDay(range?.end, timeZone);
	return start === null || end === null
		? null
		: { start, end };
};

/**
 * ISO plain-date strings for a range of calendar days.
 *
 * @example
 * dayRangeToIso({ start: july1, end: july31 }); // { start: "2026-07-01", end: "2026-07-31" }
 */
export const dayRangeToIso = (
	range: DayRange | null,
): IsoDateRange | null =>
	range === null
		? null
		: {
				start: dayToPlainDate(range.start).toString(),
				end: dayToPlainDate(range.end).toString(),
			};

const instantToIso = (instant: Temporal.Instant): string =>
	instant.toString({ fractionalSecondDigits: 3 });

/**
 * Inclusive-start / exclusive-end ISO instants for an ISO plain-date range in
 * `timeZone`, for query parameters that filter on a moment. `null` unless both
 * ends parse.
 *
 * @example
 * isoDateRangeToInstants({ start: "2026-07-01", end: "2026-07-31" }, "Europe/Amsterdam");
 * // { rangeStartAt: "2026-06-30T22:00:00.000Z", rangeEndAt: "2026-07-31T22:00:00.000Z" }
 */
export const isoDateRangeToInstants = (
	range: IsoDateRange | null | undefined,
	timeZone: string,
): Readonly<{
	rangeStartAt: string;
	rangeEndAt: string;
}> | null => {
	const start = isoToPlainDate(range?.start, timeZone);
	const end = isoToPlainDate(range?.end, timeZone);
	return start === null || end === null
		? null
		: {
				rangeStartAt: instantToIso(
					start.toZonedDateTime(timeZone).toInstant(),
				),
				rangeEndAt: instantToIso(
					end
						.add({ days: 1 })
						.toZonedDateTime(timeZone)
						.toInstant(),
				),
			};
};

/**
 * The time of day a `"HH:mm"` string denotes, or `null` for missing or
 * unparseable input.
 *
 * @example
 * isoToTimeOfDay("09:30"); // Time 09:30
 */
export const isoToTimeOfDay = (
	value: string | null | undefined,
): Time | null => {
	if (
		value === null ||
		value === undefined ||
		value === ""
	) {
		return null;
	}
	try {
		return parseTime(value);
	} catch {
		return null;
	}
};

const twoDigits = (value: number): string =>
	String(value).padStart(2, "0");

/**
 * A `"HH:mm"` string for a time of day, or `null` for no time.
 *
 * @example
 * timeOfDayToIso(new Time(9, 30)); // "09:30"
 */
export const timeOfDayToIso = (
	time: Time | null,
): string | null =>
	time === null
		? null
		: `${twoDigits(time.hour)}:${twoDigits(time.minute)}`;
