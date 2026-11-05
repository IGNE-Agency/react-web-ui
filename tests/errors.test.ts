import { describe, expect, test } from "vitest";
import {
	getFieldErrors,
	normalizeFieldErrors,
} from "../src/lib/forms/errors.ts";

describe("normalizeFieldErrors", () => {
	test("keeps a lone string as one line", () => {
		expect(normalizeFieldErrors("Enter a name.")).toEqual([
			"Enter a name.",
		]);
	});

	test("keeps a list of strings in order", () => {
		expect(
			normalizeFieldErrors(["Enter a name.", "Too short."]),
		).toEqual(["Enter a name.", "Too short."]);
	});

	test("takes the message of anything that carries a string one", () => {
		expect(
			normalizeFieldErrors([
				new Error("Thrown."),
				{ message: "Plain object." },
			]),
		).toEqual(["Thrown.", "Plain object."]);
	});

	test("reads Standard Schema issues by their message", () => {
		expect(
			normalizeFieldErrors([
				{ message: "Too small.", path: ["name"] },
				{
					message: "Not an email address.",
					path: [{ key: "email" }],
				},
			]),
		).toEqual(["Too small.", "Not an email address."]);
	});

	test("flattens nested lists, as a validator without flattening returns them", () => {
		expect(
			normalizeFieldErrors([
				[{ message: "First." }, "Second."],
				["Third."],
			]),
		).toEqual(["First.", "Second.", "Third."]);
	});

	test("shows each message once", () => {
		expect(
			normalizeFieldErrors([
				"Required.",
				{ message: "Required." },
			]),
		).toEqual(["Required."]);
	});

	test("drops junk", () => {
		expect(
			normalizeFieldErrors([
				undefined,
				null,
				false,
				0,
				"",
				{},
				{ message: 42 },
				{ message: "" },
				Symbol("junk"),
			]),
		).toEqual([]);
		expect(normalizeFieldErrors(undefined)).toEqual([]);
		expect(normalizeFieldErrors({ fields: {} })).toEqual(
			[],
		);
	});
});

describe("getFieldErrors", () => {
	test("collects the named fields' errors in the order asked", () => {
		const state = {
			fieldMeta: {
				name: { errors: ["Enter a name."] },
				email: {
					errors: [{ message: "Not an email address." }],
				},
				notes: { errors: [] },
			},
		};

		expect(
			getFieldErrors(state, ["email", "name"]),
		).toEqual(["Not an email address.", "Enter a name."]);
	});

	test("skips fields that have no meta yet", () => {
		const state: Readonly<{
			fieldMeta: Readonly<
				Record<string, { errors: unknown } | undefined>
			>;
		}> = { fieldMeta: {} };

		expect(getFieldErrors(state, ["name"])).toEqual([]);
	});
});
