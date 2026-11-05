import { describe, expect, test } from "vitest";
import {
	isoDateRangeToInstants,
	isoToDay,
	isoToDayRange,
	isoToTimeOfDay,
	timeOfDayToIso,
} from "../src/lib/calendar/temporal-value.ts";

const AMSTERDAM = "Europe/Amsterdam";
const KIRITIMATI = "Pacific/Kiritimati";
const NOON_UTC = "2026-07-24T12:30:00Z";

describe("isoToDay", () => {
	test("reads a plain date as itself in any zone", () => {
		expect(
			isoToDay("2026-07-24", KIRITIMATI)?.toString(),
		).toBe("2026-07-24");
	});

	test("reads an instant as the day it falls on in the zone", () => {
		expect(isoToDay(NOON_UTC, AMSTERDAM)?.toString()).toBe(
			"2026-07-24",
		);
		expect(isoToDay(NOON_UTC, KIRITIMATI)?.toString()).toBe(
			"2026-07-25",
		);
	});

	test("gives null for nothing or nonsense", () => {
		expect(isoToDay(null, AMSTERDAM)).toBeNull();
		expect(isoToDay("", AMSTERDAM)).toBeNull();
		expect(isoToDay("tomorrow", AMSTERDAM)).toBeNull();
	});
});

describe("isoToDayRange", () => {
	test("needs both ends", () => {
		expect(
			isoToDayRange(
				{ start: "2026-07-01", end: "" },
				AMSTERDAM,
			),
		).toBeNull();
	});
});

describe("isoDateRangeToInstants", () => {
	const JULY = { start: "2026-07-01", end: "2026-07-31" };

	test("bounds the days in the zone, end exclusive", () => {
		expect(isoDateRangeToInstants(JULY, AMSTERDAM)).toEqual(
			{
				rangeStartAt: "2026-06-30T22:00:00.000Z",
				rangeEndAt: "2026-07-31T22:00:00.000Z",
			},
		);
		expect(
			isoDateRangeToInstants(JULY, KIRITIMATI),
		).toEqual({
			rangeStartAt: "2026-06-30T10:00:00.000Z",
			rangeEndAt: "2026-07-31T10:00:00.000Z",
		});
	});
});

describe("time of day", () => {
	test("round-trips HH:mm", () => {
		expect(timeOfDayToIso(isoToTimeOfDay("09:30"))).toBe(
			"09:30",
		);
		expect(isoToTimeOfDay("half past nine")).toBeNull();
	});
});
