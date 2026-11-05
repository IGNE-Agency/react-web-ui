import { readFileSync } from "node:fs";
import GithubSlugger, { slug } from "github-slugger";
import { type Plugin, parseSync } from "vite";
import {
	type MdxNode,
	mdxTreeOf,
	ruleTitleOf,
	textOf,
} from "./graph.ts";
import type {
	PageText,
	PreviewRun,
	SectionPreview,
} from "./preview-types.ts";

const QUERY = "?preview";

type Block =
	| Readonly<{
			kind: "heading";
			depth: number;
			title: string;
			id: string;
	  }>
	| Readonly<{
			kind: "prose";
			runs: readonly PreviewRun[];
	  }>;

type Import = Readonly<{
	local: string;
	imported: string;
	from: string;
}>;

const runsOf = (node: MdxNode): PreviewRun[] => {
	switch (node.type) {
		case "text":
		case "inlineCode":
			return typeof node.value === "string"
				? [
						{
							text: node.value,
							code: node.type === "inlineCode",
						},
					]
				: [];
		case "break":
			return [{ text: " ", code: false }];
		case "image":
		case "mdxTextExpression":
			return [];
		default:
			return (node.children ?? []).flatMap(runsOf);
	}
};

const tidied = (runs: readonly PreviewRun[]) => {
	const merged = runs.reduce<PreviewRun[]>(
		(result, run) => {
			const text = run.text.replaceAll(/\s+/g, " ");
			const last = result.at(-1);
			return last?.code === run.code
				? [
						...result.slice(0, -1),
						{ text: last.text + text, code: run.code },
					]
				: [...result, { text, code: run.code }];
		},
		[],
	);
	return merged.map((run, index) => ({
		code: run.code,
		text:
			index === 0
				? run.text.trimStart()
				: index === merged.length - 1
					? run.text.trimEnd()
					: run.text,
	}));
};

const importsOf = (source: string): Import[] =>
	parseSync("esm.tsx", source).program.body.flatMap(
		statement =>
			statement.type === "ImportDeclaration"
				? statement.specifiers.flatMap(specifier =>
						specifier.type === "ImportSpecifier"
							? [
									{
										local: specifier.local.name,
										imported:
											specifier.imported.type ===
											"Identifier"
												? specifier.imported.name
												: specifier.imported.value,
										from: statement.source.value,
									},
								]
							: [],
					)
				: [],
	);

const blocksOf = (tree: MdxNode) => {
	const slugger = new GithubSlugger();
	const blocks: Block[] = [];
	const imports: Import[] = [];
	let drawing: string | undefined;
	let caption: readonly PreviewRun[] = [];
	let pull: PreviewRun[] = [];

	const flush = () => {
		if (pull.length > 0) {
			blocks.push({ kind: "prose", runs: tidied(pull) });
			pull = [];
		}
	};

	const visit = (node: MdxNode, prose: boolean) => {
		if (node.type === "heading") {
			const title = textOf(node);
			const id = slugger.slug(title);
			if (prose) {
				flush();
				blocks.push({
					kind: "heading",
					depth: node.depth ?? 0,
					title,
					id,
				});
			}
			return;
		}
		const rule = ruleTitleOf(node);
		if (prose && typeof rule === "string") {
			flush();
			blocks.push({
				kind: "heading",
				depth: 3,
				title: rule,
				id: slug(rule),
			});
		}
		if (
			node.type === "mdxjsEsm" &&
			typeof node.value === "string"
		) {
			imports.push(...importsOf(node.value));
			return;
		}
		if (prose && node.type === "paragraph") {
			blocks.push({
				kind: "prose",
				runs: tidied([
					...pull,
					{ text: " ", code: false },
					...runsOf(node),
				]),
			});
			pull = [];
			return;
		}
		if (prose && node.type === "mdxJsxFlowElement") {
			if (node.name === "Pull") {
				pull = [
					...pull,
					...(node.children ?? []).flatMap(runsOf),
				];
				return;
			}
			if (
				node.name === "Illustration" &&
				drawing === undefined
			) {
				drawing =
					node.children?.find(
						child => child.type === "mdxJsxFlowElement",
					)?.name ?? undefined;
				caption = (node.attributes ?? []).flatMap(
					attribute =>
						attribute.name === "caption" &&
						typeof attribute.value === "string"
							? [{ text: attribute.value, code: false }]
							: [],
				);
			}
		}
		const inner =
			node.type === "root" ||
			(prose &&
				node.type === "mdxJsxFlowElement" &&
				(node.name === "DocsPage" ||
					node.name === "DetailsList" ||
					node.name === "Details"));
		for (const child of node.children ?? []) {
			visit(child, prose && inner);
		}
	};

	visit(tree, true);
	flush();
	return {
		blocks,
		caption,
		drawing: imports.find(entry => entry.local === drawing),
	};
};

const pageTextOf = (blocks: readonly Block[]): PageText => {
	const guide = blocks.some(
		block => block.kind === "heading" && block.depth === 1,
	);
	const sections: Record<string, SectionPreview> = {};
	let title: string | undefined;
	let lead: readonly PreviewRun[] = [];
	let opening = true;
	let number = 0;
	let waiting: string | undefined;

	for (const block of blocks) {
		if (block.kind === "heading") {
			waiting = undefined;
			if (block.depth === 1) {
				title ??= block.title;
				continue;
			}
			opening = false;
			if (block.depth === 2) {
				number += 1;
			}
			if (block.depth === 2 || block.depth === 3) {
				sections[block.id] = {
					title: block.title,
					lead: [],
					...(guide ? { number } : {}),
				};
				waiting = block.id;
			}
			continue;
		}
		if (opening && lead.length === 0) {
			lead = block.runs;
		}
		const section =
			waiting === undefined ? undefined : sections[waiting];
		if (waiting !== undefined && section !== undefined) {
			sections[waiting] = { ...section, lead: block.runs };
			waiting = undefined;
		}
	}

	return {
		...(title === undefined ? {} : { title }),
		lead,
		sections,
	};
};

const moduleOf = (file: string) => {
	const { blocks, caption, drawing } = blocksOf(
		mdxTreeOf(readFileSync(file, "utf8")),
	);
	const text = pageTextOf(blocks);
	const loader =
		drawing === undefined
			? ""
			: `const load = () => import(${JSON.stringify(drawing.from)}).then(module => ({ default: module[${JSON.stringify(drawing.imported)}] }));\n\n`;
	const lazyDrawing =
		drawing === undefined
			? ""
			: `,\n\tdrawing: { Component: lazy(load), preload: load }`;
	return `import { lazy } from "react";\n\n${loader}export default {\n\t...${JSON.stringify(text.lead.length > 0 ? text : { ...text, lead: caption })}${lazyDrawing}\n};\n`;
};

/**
 * Serves an MDX docs page imported with `?preview` as its link preview: a
 * `PagePreview` of its title, opening paragraph, sections and opening drawing.
 *
 * @example
 * viteFinal: config => mergeConfig(config, { plugins: [docsPreviews()] });
 */
export const docsPreviews = (): Plugin => ({
	name: "docs-previews",
	enforce: "pre",
	load(id) {
		if (!id.endsWith(`.mdx${QUERY}`)) {
			return null;
		}
		const file = id.slice(0, -QUERY.length);
		this.addWatchFile(file);
		return moduleOf(file);
	},
});
