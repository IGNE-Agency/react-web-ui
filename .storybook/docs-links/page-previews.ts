import type { DocsEntry } from "./docs-index.ts";
import type { PagePreview } from "./preview-types.ts";

const pages = import.meta.glob<PagePreview>(
	["/src/**/*.mdx", "/docs/**/*.mdx"],
	{ query: "?preview", import: "default", eager: true },
);

/**
 * A docs page's link preview: its text, its sections and its opening drawing.
 *
 * @example
 * const drawing = previewOf(entry)?.drawing;
 */
export const previewOf = (entry: DocsEntry) =>
	pages[entry.importPath.slice(1)];
