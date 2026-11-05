import { describe, expect, test } from "vitest";
import { createErrorCascade } from "../src/components/error-text/error-cascade.ts";

const manualFrames = () => {
	const pending: (() => void)[] = [];
	return {
		schedule: (next: () => void) => {
			pending.push(next);
		},
		nextFrame: () => {
			for (const next of pending.splice(0)) {
				next();
			}
		},
	};
};

describe("createErrorCascade", () => {
	test("counts every message ahead of a block that appears in the same frame", () => {
		const frames = manualFrames();
		const cascade = createErrorCascade(frames.schedule);

		expect(cascade.claim({}, 1)).toBe(0);
		expect(cascade.claim({}, 2)).toBe(1);
		expect(cascade.claim({}, 1)).toBe(3);
	});

	test("starts a new wave at zero after a frame", () => {
		const frames = manualFrames();
		const cascade = createErrorCascade(frames.schedule);
		cascade.claim({}, 2);

		frames.nextFrame();

		expect(cascade.claim({}, 1)).toBe(0);
	});

	test("keeps the index a block was given, however often it asks", () => {
		const frames = manualFrames();
		const cascade = createErrorCascade(frames.schedule);
		const first = {};
		const second = {};
		cascade.claim(first, 1);
		cascade.claim(second, 1);

		frames.nextFrame();

		expect(cascade.claim(second, 1)).toBe(1);
		expect(cascade.claim(first, 1)).toBe(0);
		expect(cascade.claim({}, 1)).toBe(0);
	});

	test("schedules one wave end per wave", () => {
		let scheduled = 0;
		const cascade = createErrorCascade(() => {
			scheduled += 1;
		});
		cascade.claim({}, 1);
		cascade.claim({}, 1);

		expect(scheduled).toBe(1);
	});
});
