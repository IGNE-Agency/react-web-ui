import { slug } from "github-slugger";
import { sanitize } from "storybook/internal/csf";
import { z } from "zod";

/**
 * A stories meta's `parameters.designSystem`: the design-system sections and
 * component pages the component follows.
 *
 * @example
 * designSystemLinks.parse([{ page: "Components", section: "Form fields" }]);
 */
export const designSystemLinks = z.array(
	z.union([
		z.object({
			page: z.string(),
			section: z.string().optional(),
		}),
		z.object({
			component: z.string(),
			section: z.string().optional(),
		}),
	]),
);

/** One entry of {@link designSystemLinks}. @example const link: DesignSystemLink = { component: "components/button" }; */
export type DesignSystemLink = z.infer<
	typeof designSystemLinks
>[number];

const BASE = "http://storybook.invalid/";

/**
 * The docs page id and section anchor an MDX link's `href` points at, when it
 * points at a docs page.
 *
 * @example
 * docsTargetOf("?path=/docs/design-system-foundation-motion--docs#levels");
 * // { to: "design-system-foundation-motion--docs", anchor: "levels" }
 */
export const docsTargetOf = (href: string) => {
	const url = new URL(href, BASE);
	const path = url.searchParams.get("path");
	return path?.startsWith("/docs/")
		? {
				to: path.slice("/docs/".length),
				anchor:
					url.hash === ""
						? undefined
						: decodeURIComponent(url.hash.slice(1)),
			}
		: undefined;
};

/**
 * Whether a click on a link is a plain left click, which the docs handle by
 * navigating Storybook itself, rather than one that opens a new tab or window.
 *
 * @example
 * if (isPlainClick(event)) { event.preventDefault(); channel.emit(NAVIGATE_URL, href); }
 */
export const isPlainClick = (
	event: Readonly<{
		button: number;
		altKey: boolean;
		ctrlKey: boolean;
		metaKey: boolean;
		shiftKey: boolean;
	}>,
) =>
	event.button === 0 &&
	!event.altKey &&
	!event.ctrlKey &&
	!event.metaKey &&
	!event.shiftKey;

/**
 * A link's `href` as the docs page renders it: a Storybook `?path=` link points
 * at Storybook itself rather than at the preview frame, so it still opens
 * Storybook when the browser follows it, in a new tab or window.
 *
 * @example
 * storybookHrefOf("?path=/docs/design-system-foundation-motion--docs"); // "./?path=/docs/design-system-foundation-motion--docs"
 */
export const storybookHrefOf = (href: string) =>
	href.startsWith("?") ? `./${href}` : href;

/**
 * The docs page and section id a design-system link points at.
 *
 * @example
 * targetOf({ page: "Foundation/Motion", section: "Every wait has an indicator" });
 * // { id: "design-system-foundation-motion--docs", anchor: "every-wait-has-an-indicator" }
 */
export const targetOf = (link: DesignSystemLink) => ({
	id: `${sanitize("page" in link ? `Design system/${link.page}` : link.component)}--docs`,
	anchor:
		link.section === undefined
			? undefined
			: slug(link.section),
});
