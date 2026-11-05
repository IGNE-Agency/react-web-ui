import { useEffect } from "react";

const SETTLE_MS = 10_000;

const USER_INPUT = [
	"wheel",
	"touchstart",
	"keydown",
	"pointerdown",
] as const;

const sectionOf = (href: string) => {
	const [section = ""] = new URL(href).hash
		.slice(1)
		.split("&");
	return decodeURIComponent(section);
};

/**
 * Keeps a docs page scrolled to the section the manager's URL names, from the
 * moment the section renders until the page settles or the reader scrolls.
 *
 * @example
 * useSectionScroll(window.parent.location.href);
 */
export const useSectionScroll = (href: string) => {
	useEffect(() => {
		const id = sectionOf(href);
		if (id === "") {
			return undefined;
		}

		const place = () => {
			const section = document.getElementById(id);
			if (section instanceof HTMLDetailsElement) {
				section.open = true;
			}
			section?.scrollIntoView({
				behavior: "instant",
				block: "start",
			});
		};

		const observer = new ResizeObserver(place);
		const stop = () => {
			observer.disconnect();
			clearTimeout(timeout);
			for (const type of USER_INPUT) {
				window.removeEventListener(type, stop);
			}
		};
		const timeout = setTimeout(stop, SETTLE_MS);

		observer.observe(document.body);
		for (const type of USER_INPUT) {
			window.addEventListener(type, stop, {
				passive: true,
			});
		}
		place();

		return stop;
	}, [href]);
};
