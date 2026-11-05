import { z } from "zod";
import { labelOf } from "../label.ts";

const docsIndex = z.object({
	entries: z.record(
		z.string(),
		z.object({
			id: z.string(),
			title: z.string(),
			type: z.string(),
			importPath: z.string(),
			tags: z.array(z.string()).default([]),
		}),
	),
});

/**
 * One docs page in Storybook's index.
 *
 * @example
 * const entry: DocsEntry = { id: "design-system-foundation-motion--docs", title: "Design system/Foundation/Motion", type: "docs", importPath: "./docs/design-system/motion.mdx", tags: [] };
 */
export type DocsEntry = z.infer<
	typeof docsIndex
>["entries"][string];

let index: Promise<readonly DocsEntry[]> | undefined;
let docs: Promise<readonly DocsEntry[]> | undefined;
const previewStories = new Map<
	string,
	Promise<string | undefined>
>();

const indexEntries = () => {
	index ??= fetch("./index.json")
		.then(response => response.json())
		.then(json =>
			Object.values(docsIndex.parse(json).entries),
		);
	return index;
};

/**
 * Every docs page in Storybook's index, in sidebar order, fetched once.
 *
 * @example
 * const pages = use(docsEntries());
 */
export const docsEntries = () => {
	docs ??= indexEntries().then(entries =>
		entries.filter(entry => entry.type === "docs"),
	);
	return docs;
};

/**
 * The story that stands for a component docs page in a preview: the first one
 * the page shows that has no play function, so rendering it on its own does
 * nothing but draw the component.
 *
 * @example
 * const story = use(previewStoryOf(entry)); // "components-button--primary"
 */
export const previewStoryOf = (page: DocsEntry) => {
	const cached = previewStories.get(page.id);
	if (cached !== undefined) {
		return cached;
	}
	const story = indexEntries().then(
		entries =>
			entries.find(
				entry =>
					entry.type === "story" &&
					entry.title === page.title &&
					entry.tags.includes("autodocs") &&
					!entry.tags.includes("play-fn"),
			)?.id,
	);
	previewStories.set(page.id, story);
	return story;
};

/**
 * A docs page's name as the sidebar shows it: the last segment of its title.
 *
 * @example
 * nameOf(entry); // "Link button"
 */
export const nameOf = (entry: DocsEntry) =>
	labelOf(entry.title.split("/").at(-1) ?? entry.title);

/**
 * The sidebar group a docs page sits in: the first segment of its title.
 *
 * @example
 * groupOf(entry); // "Design system"
 */
export const groupOf = (entry: DocsEntry) =>
	entry.title.split("/")[0] ?? entry.title;
