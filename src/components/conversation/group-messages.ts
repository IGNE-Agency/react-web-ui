import type { Temporal } from "temporal-polyfill";
import {
	type ConversationMoment,
	toZonedDateTime,
} from "./moment.ts";

export type ConversationDayGroup<T> = Readonly<{
	/** The calendar day, as `YYYY-MM-DD` in the time zone grouped by. */
	key: string;
	/** The first item's moment. */
	date: Temporal.Instant;
	items: readonly [T, ...T[]];
}>;

/**
 * Buckets chronologically ordered items into calendar days in `timeZone`,
 * keeping their order within and across days. Items whose date can't be parsed
 * are skipped. Pass the zone from `useTimeZone()`.
 *
 * @example
 * groupByDay(messages, message => message.sentAt, useTimeZone());
 * // [{ key: "2026-05-27", date: Temporal.Instant, items: [message, …] }, …]
 */
export const groupByDay = <T>(
	items: readonly T[],
	getDate: (
		item: T,
	) => ConversationMoment | null | undefined,
	timeZone: string,
): readonly ConversationDayGroup<T>[] => {
	const groups: {
		key: string;
		date: Temporal.Instant;
		items: [T, ...T[]];
	}[] = [];

	for (const item of items) {
		const zoned = toZonedDateTime(getDate(item), timeZone);
		if (zoned === null) {
			continue;
		}
		const key = zoned.toPlainDate().toString();
		const lastGroup = groups.at(-1);
		if (lastGroup?.key === key) {
			lastGroup.items.push(item);
			continue;
		}
		groups.push({
			key,
			date: zoned.toInstant(),
			items: [item],
		});
	}

	return groups;
};

export type ConversationBurst<T> = Readonly<{
	key: string;
	items: readonly [T, ...T[]];
}>;

/**
 * Buckets chronologically ordered items into consecutive runs ("bursts") that
 * share a key, such as messages one author sent one after another. A burst is
 * keyed by how many earlier runs shared its key, not by its position, so a new
 * message at the top does not remount every burst below it.
 *
 * @example
 * groupByBurst(messages, message => message.authorId);
 * // [{ key: "u1-0", items: [message, message] }, { key: "u2-0", items: [message] }]
 */
export const groupByBurst = <T>(
	items: readonly T[],
	getKey: (item: T) => string,
): readonly ConversationBurst<T>[] => {
	const bursts: {
		key: string;
		groupKey: string;
		items: [T, ...T[]];
	}[] = [];
	const runs = new Map<string, number>();

	for (const item of items) {
		const groupKey = getKey(item);
		const lastBurst = bursts.at(-1);
		if (lastBurst?.groupKey === groupKey) {
			lastBurst.items.push(item);
			continue;
		}
		const run = runs.get(groupKey) ?? 0;
		runs.set(groupKey, run + 1);
		bursts.push({
			key: `${groupKey}-${run}`,
			groupKey,
			items: [item],
		});
	}

	return bursts.map(({ key, items: burst }) => ({
		key,
		items: burst,
	}));
};
