import { useSyncExternalStore } from "react";

/**
 * Whether a CSS media query matches, re-evaluated whenever its answer changes.
 * Reads outside a browser answer `false`.
 *
 * @example
 * const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 */
export const useMediaQuery = (query: string): boolean =>
	useSyncExternalStore(
		onChange => {
			const list = window.matchMedia(query);
			list.addEventListener("change", onChange);
			return () =>
				list.removeEventListener("change", onChange);
		},
		() => window.matchMedia(query).matches,
		() => false,
	);
