import { expect, test } from "vitest";
import { z } from "zod";
import { memoryStorage } from "../src/lib/storybook/memory-storage.ts";
import {
	storedPageSize,
	type StoredValueShape,
	tableStoredValue,
} from "../src/lib/table-storage.ts";

const OPTIONS = [10, 25, 50, 100];
const DEFAULT_SIZE = 10;

type YearFilters = Readonly<{ year: string }>;

const YEAR_FILTERS: StoredValueShape<YearFilters> = {
	schema: z.object({ year: z.string() }),
	fallback: { year: "" },
};

test("a table opens at the page size last picked on it", () => {
	const storage = memoryStorage();

	storedPageSize(
		"nza-rates",
		OPTIONS,
		DEFAULT_SIZE,
		storage,
	).write(50);

	expect(
		storedPageSize(
			"nza-rates",
			OPTIONS,
			DEFAULT_SIZE,
			storage,
		).read(),
	).toBe(50);
});

test("a table nobody picked a size on opens at its default size", () => {
	expect(
		storedPageSize(
			"nza-rates",
			OPTIONS,
			DEFAULT_SIZE,
			memoryStorage(),
		).read(),
	).toBe(DEFAULT_SIZE);
});

test("each table remembers its own page size", () => {
	const storage = memoryStorage();
	const pageSize = (tableId: string) =>
		storedPageSize(tableId, OPTIONS, DEFAULT_SIZE, storage);

	pageSize("declarations-Incomplete").write(100);
	pageSize("declarations-Processed").write(25);

	expect(pageSize("declarations-Incomplete").read()).toBe(
		100,
	);
	expect(pageSize("declarations-Processed").read()).toBe(
		25,
	);
	expect(pageSize("nza-rates").read()).toBe(DEFAULT_SIZE);
});

test("a remembered size the table no longer offers opens at the default", () => {
	const storage = memoryStorage();
	storedPageSize(
		"nza-rates",
		OPTIONS,
		DEFAULT_SIZE,
		storage,
	).write(100);

	expect(
		storedPageSize(
			"nza-rates",
			[10, 25, 50],
			DEFAULT_SIZE,
			storage,
		).read(),
	).toBe(DEFAULT_SIZE);
});

test("a size the table does not offer is never stored", () => {
	const storage = memoryStorage();
	const pageSize = storedPageSize(
		"nza-rates",
		OPTIONS,
		DEFAULT_SIZE,
		storage,
	);
	pageSize.write(50);

	expect(() => {
		pageSize.write(33);
	}).toThrow();
	expect(pageSize.read()).toBe(50);
});

test("each table remembers its own filters", () => {
	const storage = memoryStorage();
	const filters = (tableId: string) =>
		tableStoredValue(
			tableId,
			"filters",
			YEAR_FILTERS,
			storage,
		);

	filters("nza-rates").write({ year: "2026" });

	expect(filters("nza-rates").read()).toEqual({
		year: "2026",
	});
	expect(filters("declarations-Incomplete").read()).toEqual(
		{ year: "" },
	);
});

test("page size and other table state do not overwrite each other", () => {
	const storage = memoryStorage();
	const filters = tableStoredValue(
		"nza-rates",
		"filters",
		YEAR_FILTERS,
		storage,
	);
	const pageSize = storedPageSize(
		"nza-rates",
		OPTIONS,
		DEFAULT_SIZE,
		storage,
	);

	filters.write({ year: "2026" });
	pageSize.write(50);

	expect(filters.read()).toEqual({ year: "2026" });
	expect(pageSize.read()).toBe(50);
});

test("stored junk the validator rejects reads as the fallback", () => {
	const storage = memoryStorage();
	const filters = tableStoredValue(
		"nza-rates",
		"filters",
		YEAR_FILTERS,
		storage,
	);

	for (const junk of [
		{ year: 2026 },
		"2026",
		null,
		[{ year: "2026" }],
		{},
	]) {
		storage.write("table:nza-rates:filters", junk);

		expect(filters.read()).toEqual({ year: "" });
	}
});

test("stored junk the page-size validator rejects reads as the default", () => {
	const storage = memoryStorage();
	const pageSize = storedPageSize(
		"nza-rates",
		OPTIONS,
		DEFAULT_SIZE,
		storage,
	);

	for (const junk of ["50", 33, null, { size: 50 }]) {
		storage.write("table:nza-rates:page-size", junk);

		expect(pageSize.read()).toBe(DEFAULT_SIZE);
	}
});

test("a value is stored as the validator outputs it", () => {
	const storage = memoryStorage();
	const filters = tableStoredValue(
		"nza-rates",
		"filters",
		{
			schema: z.object({ year: z.string().trim() }),
			fallback: { year: "" },
		},
		storage,
	);

	filters.write({ year: " 2026 " });

	expect(storage.read("table:nza-rates:filters")).toEqual({
		year: "2026",
	});
});

test("an asynchronous validator never lets a stored value through", () => {
	const storage = memoryStorage();
	storage.write("table:nza-rates:filters", {
		year: "2026",
	});
	const filters = tableStoredValue(
		"nza-rates",
		"filters",
		{
			schema: z.object({
				year: z.string().refine(async () => true),
			}),
			fallback: { year: "" },
		},
		storage,
	);

	expect(filters.read()).toEqual({ year: "" });
	expect(() => {
		filters.write({ year: "2027" });
	}).toThrow();
});
