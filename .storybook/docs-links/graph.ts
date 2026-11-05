import { globSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import GithubSlugger, { slug } from "github-slugger";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { type ESTree, parseSync, Visitor } from "vite";
import {
	designSystemLinks,
	docsTargetOf,
	targetOf,
} from "./target.ts";

/**
 * The parts of an MDX syntax tree node the docs tools read.
 *
 * @example
 * const heading: MdxNode = { type: "heading", depth: 2, children: [{ type: "text", value: "Levels" }] };
 */
export type MdxNode = Readonly<{
	type: string;
	depth?: number;
	url?: string;
	value?: unknown;
	name?: string | null;
	attributes?: readonly Readonly<{
		type: string;
		name?: string;
		value?: unknown;
	}>[];
	children?: readonly MdxNode[];
}>;

type Section = Readonly<{
	title: string;
	id: string;
	kind: "heading" | "rule";
}>;

/**
 * One link between docs pages: an MDX link from a page's section, or a
 * stories meta's `designSystem` entry.
 *
 * @example
 * const link: DocsLink = { from: "./docs/design-system/patterns.mdx", to: "design-system-components--docs", kind: "link" };
 */
export type DocsLink = Readonly<{
	from: string;
	section?: Section;
	to: string;
	anchor?: string;
	kind: "link" | "follows";
}>;

/**
 * The `title` of a `<Details>` block, which states one technical rule.
 *
 * @example
 * ruleTitleOf(details); // "A control never carries a shadow"
 */
export const ruleTitleOf = (node: MdxNode) =>
	node.type === "mdxJsxFlowElement" &&
	node.name === "Details"
		? (node.attributes ?? []).find(
				attribute =>
					attribute.type === "mdxJsxAttribute" &&
					attribute.name === "title" &&
					typeof attribute.value === "string",
			)?.value
		: undefined;

/**
 * The plain text inside an MDX node.
 *
 * @example
 * textOf(heading); // "Levels"
 */
export const textOf = (node: MdxNode): string =>
	typeof node.value === "string"
		? node.value
		: (node.children ?? []).map(textOf).join("");

const pageTileHrefsOf = (node: MdxNode) =>
	(node.attributes ?? []).flatMap(attribute =>
		attribute.type === "mdxJsxAttribute" &&
		attribute.name === "page" &&
		typeof attribute.value === "string"
			? [
					`?path=/docs/${targetOf({ page: attribute.value }).id}`,
				]
			: [],
	);

const hrefsOf = (node: MdxNode) =>
	node.type === "link" && node.url !== undefined
		? [node.url]
		: node.type === "mdxJsxFlowElement" &&
			  node.name === "PageTile"
			? pageTileHrefsOf(node)
			: (node.attributes ?? []).flatMap(attribute =>
					attribute.type === "mdxJsxAttribute" &&
					attribute.name === "href" &&
					typeof attribute.value === "string"
						? [attribute.value]
						: [],
				);

/**
 * An MDX file's syntax tree.
 *
 * @example
 * const tree = mdxTreeOf("# Motion");
 */
export const mdxTreeOf = (source: string): MdxNode =>
	unified().use(remarkParse).use(remarkMdx).parse(source);

const mdxLinksOf = (from: string, source: string) => {
	const slugger = new GithubSlugger();
	const links: DocsLink[] = [];
	const sections: Section[] = [];
	let section: Section | undefined;

	const visit = (node: MdxNode) => {
		if (node.type === "heading") {
			const title = textOf(node);
			const id = slugger.slug(title);
			if (node.depth === 2 || node.depth === 3) {
				section = { title, id, kind: "heading" };
				sections.push(section);
			}
		}
		const rule = ruleTitleOf(node);
		const outside = section;
		if (typeof rule === "string") {
			section = {
				title: rule,
				id: slug(rule),
				kind: "rule",
			};
			sections.push(section);
		}
		for (const href of hrefsOf(node)) {
			const target = docsTargetOf(href);
			if (target !== undefined) {
				links.push({
					from,
					section,
					...target,
					kind: "link",
				});
			}
		}
		for (const child of node.children ?? []) {
			visit(child);
		}
		if (typeof rule === "string") {
			section = outside;
		}
	};

	visit(mdxTreeOf(source));
	return { links, sections };
};

const keyNameOf = (key: ESTree.PropertyKey) =>
	key.type === "Identifier"
		? key.name
		: key.type === "Literal" &&
			  typeof key.value === "string"
			? key.value
			: undefined;

const literalOf = (
	node: ESTree.Expression | ESTree.SpreadElement | null,
): unknown => {
	if (node === null) {
		return undefined;
	}
	if (
		node.type === "Literal" &&
		typeof node.value === "string"
	) {
		return node.value;
	}
	if (
		node.type === "TemplateLiteral" &&
		node.expressions.length === 0
	) {
		return node.quasis[0]?.value.cooked ?? undefined;
	}
	if (node.type === "ArrayExpression") {
		return node.elements.map(literalOf);
	}
	if (node.type === "ObjectExpression") {
		return Object.fromEntries(
			node.properties.flatMap(property => {
				if (
					property.type !== "Property" ||
					property.computed
				) {
					return [];
				}
				const name = keyNameOf(property.key);
				return name === undefined
					? []
					: [[name, literalOf(property.value)]];
			}),
		);
	}
	return undefined;
};

const storyLinksOf = (from: string, source: string) => {
	const links: DocsLink[] = [];

	const visitor = new Visitor({
		ObjectExpression: node => {
			for (const property of node.properties) {
				if (
					property.type !== "Property" ||
					property.computed ||
					keyNameOf(property.key) !== "designSystem"
				) {
					continue;
				}
				const parsed = designSystemLinks.safeParse(
					literalOf(property.value),
				);
				if (!parsed.success) {
					throw new Error(
						`${from}: designSystem is not a list of literal links`,
					);
				}
				for (const link of parsed.data) {
					const { id, anchor } = targetOf(link);
					links.push({
						from,
						to: id,
						anchor,
						kind: "follows",
					});
				}
			}
		},
	});

	visitor.visit(parseSync(from, source).program);
	return { links, sections: [] };
};

/**
 * Every link between docs pages, and every MDX page's sections, read from the
 * files the Storybook `stories` globs match, keyed by the paths Storybook's
 * index uses.
 *
 * @example
 * const { links, sections } = docsGraphOf(["../src/**\/*.mdx"], ".storybook", ".");
 */
export const docsGraphOf = (
	stories: readonly string[],
	configDir: string,
	root: string,
) => {
	const files = stories.flatMap(pattern =>
		globSync(pattern, { cwd: configDir }).map(file =>
			resolve(configDir, file),
		),
	);
	const pages = files.map(file => {
		const from = `./${relative(root, file).replaceAll("\\", "/")}`;
		const source = readFileSync(file, "utf8");
		return {
			from,
			...(file.endsWith(".mdx")
				? mdxLinksOf(from, source)
				: storyLinksOf(from, source)),
		};
	});
	return {
		links: pages.flatMap(page => page.links),
		sections: Object.fromEntries(
			pages.map(page => [page.from, page.sections]),
		),
	};
};
