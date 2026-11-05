import { dirname } from "node:path";
import { z } from "zod";
import config from "../main.ts";
import { docsGraphOf } from "./graph.ts";

const docsIndex = z.object({
	entries: z.record(
		z.string(),
		z.object({
			id: z.string(),
			title: z.string(),
			type: z.string(),
			importPath: z.string(),
		}),
	),
});

const storybook =
	process.argv[2] ?? "http://localhost:6006";
const guide = "./docs/design-system/";

const { links, sections } = docsGraphOf(
	(Array.isArray(config.stories)
		? config.stories
		: []
	).flatMap(entry =>
		typeof entry === "string" ? [entry] : [],
	),
	dirname(import.meta.dirname),
	process.cwd(),
);
const pages = Object.values(
	docsIndex.parse(
		await (
			await fetch(new URL("index.json", storybook))
		).json(),
	).entries,
).filter(entry => entry.type === "docs");

const pageAt = (path: string) =>
	pages.find(entry => entry.importPath === path);
const pageWith = (id: string) =>
	pages.find(entry => entry.id === id);
const sectionsOf = (id: string) =>
	sections[pageWith(id)?.importPath ?? ""] ?? [];
const ruleOf = (id: string | undefined, anchor: string) =>
	`${pageWith(id ?? "")?.title ?? id} → ${sectionsOf(id ?? "").find(section => section.id === anchor)?.title ?? anchor}`;

const broken = links.filter(
	link =>
		pageWith(link.to) === undefined ||
		(link.anchor !== undefined &&
			!sectionsOf(link.to).some(
				section => section.id === link.anchor,
			)),
);
const pageOnly = links.filter(
	link =>
		link.kind === "link" &&
		link.anchor === undefined &&
		link.from.startsWith(guide),
);
const linked = new Set(
	links
		.filter(link => link.kind === "link")
		.flatMap(link => [
			...(link.section === undefined
				? []
				: [`${pageAt(link.from)?.id}#${link.section.id}`]),
			...(link.anchor === undefined
				? []
				: [`${link.to}#${link.anchor}`]),
		]),
);
const isolated = Object.entries(sections)
	.filter(([path]) => path.startsWith(guide))
	.flatMap(([path, pageSections]) => {
		const id = pageAt(path)?.id;
		const rules = pageSections.some(
			section => section.kind === "rule",
		)
			? pageSections.filter(
					section => section.kind === "rule",
				)
			: pageSections;
		return rules
			.filter(section => !linked.has(`${id}#${section.id}`))
			.map(section => ruleOf(id, section.id));
	});

const print = (
	heading: string,
	lines: readonly string[],
) => {
	console.log(`\n${heading} (${lines.length})`);
	for (const line of lines) {
		console.log(`  ${line}`);
	}
};

print(
	"Links to a page or section that does not exist",
	broken.map(
		link =>
			`${link.from}${link.section === undefined ? "" : ` (${link.section.title})`} → ${link.to}${link.anchor === undefined ? "" : `#${link.anchor}`}`,
	),
);
print(
	"Links that stop at a page instead of a rule",
	pageOnly.map(
		link =>
			`${pageAt(link.from)?.title ?? link.from}${link.section === undefined ? "" : ` → ${link.section.title}`} ⇒ ${pageWith(link.to)?.title ?? link.to}`,
	),
);
print("Rules with no rule-level link in or out", isolated);

process.exitCode = broken.length === 0 ? 0 : 1;
