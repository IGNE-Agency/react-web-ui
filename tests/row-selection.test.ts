import { expect, test } from "vitest";
import {
	selectionCount,
	selectionRequest,
	selectionReducer,
	type SelectionState,
} from "../src/lib/hooks/use-row-selection.ts";

test("selecting all turns later unchecked rows into exclusions", () => {
	const initial: SelectionState = {
		allMatching: false,
		rowSelection: { a: true },
	};
	const all = selectionReducer(initial, {
		type: "allMatching",
	});
	const exceptA = selectionReducer(all, {
		type: "toggleRow",
		rowId: "a",
		selected: false,
		totalRows: 20,
	});

	expect(selectionRequest(exceptA)).toEqual({
		mode: "allMatching",
		excludedIds: ["a"],
	});
	expect(selectionCount(exceptA, 20)).toBe(19);
	expect(
		selectionReducer(exceptA, {
			type: "toggleRow",
			rowId: "a",
			selected: true,
			totalRows: 20,
		}).rowSelection,
	).toEqual({});
});

test("explicit selection remains an id list and clear resets the mode", () => {
	const initial = { allMatching: false, rowSelection: {} };
	const selected = selectionReducer(initial, {
		type: "toggleRow",
		rowId: "a",
		selected: true,
		totalRows: 20,
	});
	expect(selectionRequest(selected)).toEqual({
		mode: "ids",
		ids: ["a"],
	});
	expect(selectionCount(selected, 20)).toBe(1);
	expect(
		selectionRequest(
			selectionReducer(selected, { type: "clear" }),
		),
	).toBeNull();
});

test("excluding every matching row clears all-matching mode", () => {
	const all = selectionReducer(
		{ allMatching: false, rowSelection: {} },
		{ type: "allMatching" },
	);
	const none = selectionReducer(all, {
		type: "toggleRow",
		rowId: "only-row",
		selected: false,
		totalRows: 1,
	});

	expect(none.allMatching).toBe(false);
	expect(selectionRequest(none)).toBeNull();
});
