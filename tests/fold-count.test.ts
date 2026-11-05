import { describe, expect, test } from "vitest";
import { foldCount } from "../src/components/breadcrumbs/use-fold.ts";

const GAUGE = {
	crumbs: [50, 120, 80, 140],
	separator: 32,
	overflow: 40,
};

describe("foldCount", () => {
	test("folds nothing when the whole trail fits", () => {
		expect(foldCount({ ...GAUGE, room: 486 })).toBe(0);
	});

	test("folds the crumb after the first, trading it for the overflow button", () => {
		expect(foldCount({ ...GAUGE, room: 410 })).toBe(1);
	});

	test("never folds the first or the last crumb", () => {
		expect(foldCount({ ...GAUGE, room: 0 })).toBe(2);
	});

	test("has nothing to fold in a trail of two", () => {
		expect(
			foldCount({
				crumbs: [50, 140],
				separator: 32,
				overflow: 40,
				room: 0,
			}),
		).toBe(0);
	});
});
