import type {
	OptionsDictionary,
	Score,
	TranslationKeys,
} from "@zxcvbn-ts/core";
import { use } from "react";

/** A zxcvbn language pack: its dictionaries, and its feedback in that language. */
export type ZxcvbnLanguagePack = Readonly<{
	dictionary: OptionsDictionary;
	translations: TranslationKeys;
}>;

/** Loads a zxcvbn language pack, such as `() => import("@zxcvbn-ts/language-de")`. */
export type ZxcvbnLanguageLoader =
	() => Promise<ZxcvbnLanguagePack>;

/** zxcvbn language pack loaders by lowercase language tag, such as `de` or `nl-be`. */
export type ZxcvbnLanguages = Readonly<
	Record<string, ZxcvbnLanguageLoader>
>;

/** How strong a password is, as zxcvbn judged it. */
export type PasswordStrengthResult = Readonly<{
	/** zxcvbn's 0–4 band. */
	score: Score;
	/** zxcvbn's own warning, in the language pack's language. */
	warning: string;
	/** zxcvbn's own suggestions, in the language pack's language. */
	suggestions: readonly string[];
}>;

type Check = (password: string) => PasswordStrengthResult;

const BUILT_IN_LANGUAGES: ZxcvbnLanguages = {
	en: () => import("@zxcvbn-ts/language-en"),
	"nl-be": () => import("@zxcvbn-ts/language-nl-be"),
};

const checks = new Map<string, Promise<Check>>();

const createCheck = async (
	load: ZxcvbnLanguageLoader,
): Promise<Check> => {
	const [{ ZxcvbnFactory }, common, pack] =
		await Promise.all([
			import("@zxcvbn-ts/core"),
			import("@zxcvbn-ts/language-common"),
			load(),
		]);
	const zxcvbn = new ZxcvbnFactory({
		dictionary: {
			...common.dictionary,
			...pack.dictionary,
		},
		graphs: common.adjacencyGraphs,
		translations: pack.translations,
		useLevenshteinDistance: true,
	});
	return password => {
		const { score, feedback } = zxcvbn.check(password);
		return {
			score,
			warning: feedback.warning ?? "",
			suggestions: feedback.suggestions,
		};
	};
};

const checkFor = (
	tag: string,
	load: ZxcvbnLanguageLoader,
): Promise<Check> => {
	const existing = checks.get(tag);
	if (existing !== undefined) {
		return existing;
	}
	const loading = createCheck(load);
	checks.set(tag, loading);
	return loading;
};

/**
 * The language pack that serves a locale, with its tag: the locale itself,
 * then its language, then any regional pack of that language. It throws when
 * none does.
 *
 * @example
 * const [tag, load] = resolvePasswordLanguage("nl-NL", { en: loadEn, "nl-be": loadNlBe }); // tag "nl-be"
 */
export const resolvePasswordLanguage = (
	locale: string,
	languages: ZxcvbnLanguages,
): readonly [string, ZxcvbnLanguageLoader] => {
	const exact = locale.toLowerCase();
	const [language = exact] = exact.split("-");
	const packs = Object.entries(languages);
	const match =
		packs.find(([tag]) => tag === exact) ??
		packs.find(([tag]) => tag === language) ??
		packs.find(([tag]) => tag.startsWith(`${language}-`));
	if (match === undefined) {
		throw new Error(
			`There is no zxcvbn language pack for "${locale}". Pass one to PasswordStrength's \`languages\`.`,
		);
	}
	return match;
};

/**
 * The strength of a password in a locale, or `null` while it is empty. It
 * suspends while the locale's dictionaries load, each language in a chunk of
 * its own; `languages` adds packs to the kit's English and Dutch ones. The
 * first loader a language tag is checked with is the one kept.
 *
 * @example
 * const strength = usePasswordStrength(password, useLocale(), { de: () => import("@zxcvbn-ts/language-de") });
 */
export const usePasswordStrength = (
	password: string,
	locale: string,
	languages: ZxcvbnLanguages = {},
): PasswordStrengthResult | null => {
	const [tag, load] = resolvePasswordLanguage(locale, {
		...BUILT_IN_LANGUAGES,
		...languages,
	});
	const check = use(checkFor(tag, load));
	return password === "" ? null : check(password);
};
