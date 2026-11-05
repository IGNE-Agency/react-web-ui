import type { ComponentType } from "react";

/**
 * A stretch of a paragraph's text, set as code or as prose.
 *
 * @example
 * const run: PreviewRun = { text: "border-radius", code: true };
 */
export type PreviewRun = Readonly<{
	text: string;
	code: boolean;
}>;

/**
 * A section of a docs page as a link preview shows it: its heading, its
 * number on a guide page, and its first paragraph.
 *
 * @example
 * const section: SectionPreview = { title: "Levels", number: 2, lead: [] };
 */
export type SectionPreview = Readonly<{
	title: string;
	number?: number;
	lead: readonly PreviewRun[];
}>;

/**
 * The text of a docs page a link preview reads: its title, its opening
 * paragraph and its sections by heading id.
 *
 * @example
 * const text: PageText = { title: "Motion", lead: [], sections: {} };
 */
export type PageText = Readonly<{
	title?: string;
	lead: readonly PreviewRun[];
	sections: Readonly<Record<string, SectionPreview>>;
}>;

/**
 * A docs page's link preview: its text, and its opening drawing when it has
 * one, loaded on first render or ahead of it by `preload`.
 *
 * @example
 * const preview: PagePreview = { ...text, drawing: { Component: lazy(load), preload: load } };
 */
export type PagePreview = PageText &
	Readonly<{
		drawing?: Readonly<{
			Component: ComponentType;
			preload: () => Promise<unknown>;
		}>;
	}>;
