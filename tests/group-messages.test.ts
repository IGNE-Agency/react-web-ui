import { Temporal } from "temporal-polyfill";
import { describe, expect, test } from "vitest";
import {
	groupByBurst,
	groupByDay,
} from "../src/components/conversation/group-messages.ts";

type Message = Readonly<{
	id: string;
	author: string;
	sentAt: string | Temporal.Instant | null;
}>;

const AMSTERDAM = "Europe/Amsterdam";
const NEW_YORK = "America/New_York";

const message = (
	id: string,
	author: string,
	sentAt: Message["sentAt"],
): Message => ({ id, author, sentAt });

const ids = (items: readonly Message[]): string[] =>
	items.map(item => item.id);

const AROUND_AMSTERDAM_MIDNIGHT: readonly Message[] = [
	message("1", "anne", "2026-05-26T21:58:00Z"),
	message("2", "anne", "2026-05-26T21:59:00Z"),
	message("3", "anne", "2026-05-26T22:01:00Z"),
	message("4", "bram", "2026-05-26T22:05:00Z"),
];

describe("groupByDay", () => {
	test("splits at midnight in the given zone, not in UTC", () => {
		const days = groupByDay(
			AROUND_AMSTERDAM_MIDNIGHT,
			item => item.sentAt,
			AMSTERDAM,
		);

		expect(days.map(day => day.key)).toEqual([
			"2026-05-26",
			"2026-05-27",
		]);
		expect(days.map(day => ids(day.items))).toEqual([
			["1", "2"],
			["3", "4"],
		]);
	});

	test("keeps the same messages on one day in UTC", () => {
		const days = groupByDay(
			AROUND_AMSTERDAM_MIDNIGHT,
			item => item.sentAt,
			"UTC",
		);

		expect(days.map(day => day.key)).toEqual([
			"2026-05-26",
		]);
	});

	test("dates each day by its first message", () => {
		const [, second] = groupByDay(
			AROUND_AMSTERDAM_MIDNIGHT,
			item => item.sentAt,
			AMSTERDAM,
		);

		expect(second?.date.toString()).toBe(
			"2026-05-26T22:01:00Z",
		);
	});

	test("reads a zone west of UTC, from instants and ISO strings alike", () => {
		const days = groupByDay(
			[
				message("1", "anne", "2026-05-27T03:30:00Z"),
				message(
					"2",
					"anne",
					Temporal.Instant.from("2026-05-27T04:30:00Z"),
				),
			],
			item => item.sentAt,
			NEW_YORK,
		);

		expect(days.map(day => day.key)).toEqual([
			"2026-05-26",
			"2026-05-27",
		]);
	});

	test("reads a local date-time in the given zone", () => {
		const days = groupByDay(
			[
				message("1", "anne", "2026-05-26T23:59:00"),
				message("2", "anne", "2026-05-27T00:01:00"),
			],
			item => item.sentAt,
			AMSTERDAM,
		);

		expect(days.map(day => day.date.toString())).toEqual([
			"2026-05-26T21:59:00Z",
			"2026-05-26T22:01:00Z",
		]);
	});

	test("skips messages without a parseable date", () => {
		const days = groupByDay(
			[
				message("1", "anne", "2026-05-26T08:00:00Z"),
				message("2", "anne", null),
				message("3", "anne", "not a date"),
				message("4", "anne", "2026-05-26T09:00:00Z"),
			],
			item => item.sentAt,
			AMSTERDAM,
		);

		expect(days.map(day => ids(day.items))).toEqual([
			["1", "4"],
		]);
	});
});

describe("groupByBurst", () => {
	test("starts a new burst per day when a run crosses midnight", () => {
		const bursts = groupByDay(
			AROUND_AMSTERDAM_MIDNIGHT,
			item => item.sentAt,
			AMSTERDAM,
		).map(day =>
			groupByBurst(day.items, item => item.author).map(
				burst => ({
					key: burst.key,
					ids: ids(burst.items),
				}),
			),
		);

		expect(bursts).toEqual([
			[{ key: "anne-0", ids: ["1", "2"] }],
			[
				{ key: "anne-0", ids: ["3"] },
				{ key: "bram-0", ids: ["4"] },
			],
		]);
	});

	test("keys a returning author by their run count", () => {
		const bursts = groupByBurst(
			[
				message("1", "anne", null),
				message("2", "bram", null),
				message("3", "anne", null),
				message("4", "anne", null),
			],
			item => item.author,
		);

		expect(
			bursts.map(burst => [burst.key, ids(burst.items)]),
		).toEqual([
			["anne-0", ["1"]],
			["bram-0", ["2"]],
			["anne-1", ["3", "4"]],
		]);
	});

	test("keeps earlier bursts' keys when a message is added before them", () => {
		const later = [
			message("2", "bram", null),
			message("3", "anne", null),
		];
		const before = groupByBurst(later, item => item.author);
		const after = groupByBurst(
			[message("1", "chris", null), ...later],
			item => item.author,
		);

		expect(after.slice(1).map(burst => burst.key)).toEqual(
			before.map(burst => burst.key),
		);
	});
});
