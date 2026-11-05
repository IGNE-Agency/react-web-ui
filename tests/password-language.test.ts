import { describe, expect, test } from "vitest";
import {
	resolvePasswordLanguage,
	type ZxcvbnLanguages,
} from "../src/lib/password-strength/password-strength.ts";

const never = () =>
	Promise.reject(new Error("Not loaded in a unit test."));

const LANGUAGES: ZxcvbnLanguages = {
	en: never,
	"nl-be": never,
	"pt-br": never,
	pt: never,
};

const tagFor = (locale: string) =>
	resolvePasswordLanguage(locale, LANGUAGES)[0];

describe("resolvePasswordLanguage", () => {
	test("takes the pack for the locale itself, whatever its case", () => {
		expect(tagFor("nl-BE")).toBe("nl-be");
		expect(tagFor("pt-BR")).toBe("pt-br");
	});

	test("falls back to the pack for the locale's language", () => {
		expect(tagFor("en-US")).toBe("en");
		expect(tagFor("pt-PT")).toBe("pt");
	});

	test("falls back to a regional pack of the language", () => {
		expect(tagFor("nl-NL")).toBe("nl-be");
		expect(tagFor("nl")).toBe("nl-be");
	});

	test("hands back the loader it chose", () => {
		const loadGerman = () =>
			Promise.reject(new Error("Not loaded."));
		expect(
			resolvePasswordLanguage("de-DE", { de: loadGerman }),
		).toEqual(["de", loadGerman]);
	});

	test("throws for a language no pack serves", () => {
		expect(() => tagFor("fr-FR")).toThrow("fr-FR");
	});
});
