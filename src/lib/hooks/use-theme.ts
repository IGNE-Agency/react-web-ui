import { useEffect, useSyncExternalStore } from "react";
import type { StorageAdapter } from "../storage.ts";
import { useMediaQuery } from "./use-media-query.ts";

/** The user's choice. `auto` follows the operating system, live. */
export type ThemePreference = "auto" | "light" | "dark";

/** The theme actually applied to the document. */
export type Theme = "light" | "dark";

export type UseThemeOptions = Readonly<{
	/** Where the preference persists. */
	storage: StorageAdapter;
	/** The key the preference is stored under. */
	key: string;
}>;

export type ThemeControls = Readonly<{
	theme: Theme;
	preference: ThemePreference;
	setPreference: (next: ThemePreference) => void;
	toggle: () => void;
}>;

const preferenceOf = (stored: unknown): ThemePreference =>
	stored === "light" || stored === "dark" ? stored : "auto";

/**
 * Owns the document's colour theme. The stored preference is `auto` unless set,
 * following the operating system, while `light` and `dark` pin it on `<html>`
 * as `data-theme`. Under `auto` the attribute is absent and the stylesheet's
 * `prefers-color-scheme` queries resolve the theme.
 *
 * @example
 * const { theme, setPreference } = useTheme({ storage, key: "theme" });
 * setPreference("auto");
 */
export const useTheme = ({
	storage,
	key,
}: UseThemeOptions): ThemeControls => {
	const preference = useSyncExternalStore(
		onChange => storage.subscribe(key, onChange),
		() => preferenceOf(storage.read(key)),
		(): ThemePreference => "auto",
	);
	const prefersDark = useMediaQuery(
		"(prefers-color-scheme: dark)",
	);

	const theme: Theme =
		preference === "auto"
			? prefersDark
				? "dark"
				: "light"
			: preference;

	useEffect(() => {
		const root = document.documentElement;
		if (preference === "auto") {
			root.removeAttribute("data-theme");
		} else {
			root.setAttribute("data-theme", preference);
		}
	}, [preference]);

	const setPreference = (next: ThemePreference) => {
		storage.write(key, next);
	};

	return {
		theme,
		preference,
		setPreference,
		toggle: () =>
			setPreference(theme === "dark" ? "light" : "dark"),
	};
};
