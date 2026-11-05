import { DocsContainer } from "@storybook/addon-docs/blocks";
import {
	type ComponentProps,
	useSyncExternalStore,
} from "react";
import { themes } from "storybook/theming";
import { DocsFooter } from "./docs-links/docs-footer.tsx";
import { useSectionScroll } from "./section-scroll.ts";

const subscribe = (onChange: () => void) => {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});
	return () => observer.disconnect();
};

const currentTheme = () =>
	document.documentElement.dataset["theme"] === "dark"
		? "dark"
		: "light";

/**
 * Storybook's docs container in the theme the toolbar has set on the document,
 * scrolled to the section a link named, with the page's links and neighbours
 * at its end.
 *
 * @example
 * const preview = { parameters: { docs: { container: ThemedDocsContainer } } };
 */
export const ThemedDocsContainer = (
	props: ComponentProps<typeof DocsContainer>,
) => {
	const theme = useSyncExternalStore(
		subscribe,
		currentTheme,
	);
	useSectionScroll(window.parent.location.href);
	return (
		<DocsContainer {...props} theme={themes[theme]}>
			{props.children}
			<DocsFooter />
		</DocsContainer>
	);
};
