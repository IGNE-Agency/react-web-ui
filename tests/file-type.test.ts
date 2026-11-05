import { describe, expect, test } from "vitest";
import {
	isAccepted,
	wrongTypeFiles,
} from "../src/components/file-field/file-type.ts";

const PDF = {
	name: "invoice.pdf",
	type: "application/pdf",
};
const PNG = { name: "scan.PNG", type: "image/png" };
const EXE = {
	name: "setup.exe",
	type: "application/x-msdownload",
};

describe("isAccepted", () => {
	test("accepts every file when the list is empty", () => {
		expect(isAccepted(EXE, [])).toBe(true);
	});

	test("matches an exact MIME type, ignoring case", () => {
		expect(isAccepted(PDF, ["Application/PDF"])).toBe(true);
		expect(isAccepted(EXE, ["application/pdf"])).toBe(
			false,
		);
	});

	test("matches a wildcard on the type before the slash", () => {
		expect(isAccepted(PNG, ["image/*"])).toBe(true);
		expect(isAccepted(PDF, ["image/*"])).toBe(false);
	});

	test("matches an extension on the end of the name, ignoring case", () => {
		expect(isAccepted(PNG, [".png"])).toBe(true);
		expect(isAccepted(PDF, [".PDF"])).toBe(true);
		expect(isAccepted(EXE, [".pdf"])).toBe(false);
	});

	test("matches an extension when the browser reports no type", () => {
		expect(
			isAccepted({ name: "notes.md", type: "" }, [".md"]),
		).toBe(true);
	});

	test("accepts a file that matches any entry, trimming each", () => {
		expect(
			isAccepted(PNG, [" application/pdf ", " image/* "]),
		).toBe(true);
	});
});

describe("wrongTypeFiles", () => {
	test("keeps the rejected files in the order they were given", () => {
		expect(
			wrongTypeFiles([EXE, PDF, PNG], ["application/pdf"]),
		).toEqual([EXE, PNG]);
	});
});
