import { describe, expect, test } from "vitest";
import { rehypeGuide } from "../.storybook/guide/rehype-guide.ts";

type Node = Parameters<ReturnType<typeof rehypeGuide>>[0];

const element = (tagName: string, text = ""): Node => ({
	type: "element",
	tagName,
	properties: {},
	children: [{ type: "text", value: text }],
});

const jsx = (
	name: string,
	children: readonly Node[] = [],
	attributes: readonly Readonly<{ name: string }>[] = [],
): Node => ({
	type: "mdxJsxFlowElement",
	name,
	attributes,
	children,
});

const visualPair = jsx("DoDont", [
	jsx("Example", [], [{ name: "visual" }]),
	jsx("Example", [], [{ name: "visual" }]),
]);

const codePair = jsx("DoDont", [
	jsx("Example", [element("pre")]),
	jsx("Example", [element("pre")]),
]);

const blank = { type: "text", value: "\n" };

const text = (value: string): Node => ({
	type: "text",
	value,
});

const pull = (...children: readonly Node[]): Node => ({
	type: "mdxJsxTextElement",
	name: "Pull",
	children,
});

const paragraph = (...children: readonly Node[]): Node => ({
	type: "element",
	tagName: "p",
	properties: {},
	children,
});

const link: Node = {
	type: "element",
	tagName: "a",
	properties: { href: "#separation" },
	children: [text("the ladder")],
};

const lone = (copy = "A lone example.") =>
	jsx("Beside", [
		element("p", copy),
		jsx("Example", [], [{ name: "visual" }]),
	]);

const page = [
	{ type: "mdxjsEsm", value: "import x from 'y';" },
	jsx("Meta"),
	element("h1", "Separation"),
	blank,
	element("p", "Given two regions, work down this list."),
	jsx("Illustration"),
	element("h2", "Lines"),
	element("p", "Everything else uses space."),
	visualPair,
	codePair,
	element("h2", "Arrows"),
	lone("A popup arrow is a piece of the popup."),
	element("p", "A closing note."),
	lone("A second lone example."),
	element("h2", "A short note"),
	element("p", "A popup arrow has no stroke."),
	visualPair,
	element("h2", "Long text"),
	element(
		"p",
		"A rule that takes a while to explain. ".repeat(12),
	),
	visualPair,
	element("h2", "Who edits what"),
	element("p", "Prose, and nothing to show."),
	element("h2", "A long run"),
	element("p", "Four figures in a row."),
	visualPair,
	lone(),
	codePair,
	visualPair,
	element(
		"h2",
		"A popup with an arrow casts one shadow around the whole silhouette",
	),
	paragraph(text("An arrow nub is a sibling. ".repeat(12))),
	paragraph(
		text("Work down the list. "),
		pull(text("Stop at the first rung.")),
		text(" Each later rung adds weight."),
	),
	paragraph(text("A closing paragraph.")),
	visualPair,
	element("h2", "Beside a lone example, at length"),
	lone("A lone example."),
	element("h2", "A heading short enough for the rail"),
	element("p", "Prose, and nothing to show."),
	element(
		"h2",
		"One that wraps beyond the wider essay column",
	),
	paragraph(pull(text("Read "), link, text(" first."))),
];

const transform = rehypeGuide();
const result = transform({ type: "root", children: page });
const [esm, meta, article] = result.children ?? [];
const isContents = (part: Node) =>
	part.properties?.["dataPart"] === "contents";
const contents = article?.children?.filter(isContents);
const parts =
	article?.children?.filter(part => !isContents(part)) ??
	[];
const beatsOf = (index: number) =>
	(parts[index]?.children ?? []).map(
		beat => beat.properties ?? {},
	);
const sectionsOf = () =>
	parts.slice(1).map(part => ({
		compose: part.properties?.["dataCompose"],
		head: part.properties?.["dataHead"],
		turn: part.properties?.["dataTurn"],
	}));
const textOf = (node: Node | undefined): string =>
	node?.type === "text"
		? (node.value ?? "")
		: (node?.children ?? []).map(textOf).join("");
const findAll = (
	node: Node | undefined,
	found: (candidate: Node) => boolean,
): readonly Node[] => [
	...(node !== undefined && found(node) ? [node] : []),
	...(node?.children ?? []).flatMap(child =>
		findAll(child, found),
	),
];

const sectionOf = (...nodes: readonly Node[]) =>
	transform({
		type: "root",
		children: [
			element("h1", "Title"),
			element("h2", "Heading"),
			...nodes,
		],
	}).children?.[0]?.children?.find(
		part => part.properties?.["dataPart"] === "section",
	);
const isFlow = (node: Node) =>
	["dataProse", "dataPull", "dataSlot"].some(
		name => node.properties?.[name] !== undefined,
	);
const flowOf = (...nodes: readonly Node[]) =>
	findAll(sectionOf(...nodes), isFlow).flatMap(node => {
		if (node.properties?.["dataSlot"] !== undefined) {
			return ["figure"];
		}
		if (node.properties?.["dataPull"] !== undefined) {
			return [`“${textOf(node)}”`];
		}
		return (node.children ?? []).map(textOf);
	});

describe("rehypeGuide", () => {
	test("keeps imports and the meta at the root, before the article", () => {
		expect(esm?.type).toBe("mdxjsEsm");
		expect(meta?.name).toBe("Meta");
		expect(article?.tagName).toBe("article");
	});

	test("follows the opener with the page's contents", () => {
		expect(article?.children?.[1]).toBe(contents?.[0]);
		expect(contents?.[0]?.properties).toEqual({
			dataPart: "contents",
			style: "--guide-sections: 10",
		});
		expect(contents?.[0]?.children?.[0]?.name).toBe(
			"GuideContents",
		);
	});

	test("makes an opener and one section per h2", () => {
		expect(
			parts.map(part => [
				part.tagName,
				part.properties?.["dataPart"],
			]),
		).toEqual([
			["header", "opener"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
			["section", "section"],
		]);
	});

	test("groups text with the figure it introduces", () => {
		expect(
			parts[0]?.children?.[0]?.children?.map(
				child => child.tagName,
			),
		).toEqual(["h1", "div", "div"]);
		expect(beatsOf(0)[0]).toMatchObject({
			dataFigure: "illustration",
		});
	});

	test("marks a figure that shows only code", () => {
		expect(beatsOf(1)).toEqual([
			{ dataBeat: "", dataFigure: "pair" },
			{ dataBeat: "", dataFigure: "pair", dataCode: "" },
		]);
	});

	test("turns Beside into a beat and leaves trailing text its own beat", () => {
		expect(beatsOf(2)).toMatchObject([
			{ dataFigure: "example" },
			{ dataFigure: "none" },
			{ dataFigure: "example" },
		]);
	});

	test("chooses each section's composition from its shape", () => {
		expect(
			sectionsOf().map(section => section.compose),
		).toEqual([
			"lead",
			"beside",
			"note",
			"lead",
			"essay",
			"chapter",
			"lead",
			"beside",
			"essay",
			"essay",
		]);
	});

	test("marks a change of composition from the section before as a turn, larger when the rail holds something else", () => {
		expect(
			sectionsOf().map(section => section.turn),
		).toEqual([
			undefined,
			"minor",
			"major",
			"major",
			"major",
			"major",
			"minor",
			"minor",
			"major",
			"major",
		]);
	});

	test("lifts a long run's heading out of its first beat, above the whole run", () => {
		const run = parts[6]?.children ?? [];
		expect(run.map(child => child.tagName)).toEqual([
			"h2",
			"div",
		]);
		expect(run[1]?.properties).toEqual({ dataRun: "" });
		expect(run[1]?.children).toHaveLength(4);
	});

	test("hangs a heading beside its text only when it fits there in two lines, and otherwise stands it over the section", () => {
		expect(
			sectionsOf().map(section => section.head),
		).toEqual([
			"hang",
			"hang",
			"over",
			"hang",
			"hang",
			"over",
			"over",
			"over",
			"hang",
			"over",
		]);
		expect(
			parts[7]?.children?.map(child => child.tagName),
		).toEqual(["h2", "div"]);
		expect(
			parts[9]?.children?.[0]?.children?.[0]?.tagName,
		).toBe("h2");
	});

	test("keeps a pulled sentence in its paragraph, out of the copy's way", () => {
		const prose = findAll(
			parts[7],
			node => node.properties?.["dataProse"] !== undefined,
		);
		expect(textOf(prose[0]?.children?.[1])).toBe(
			"Work down the list. Stop at the first rung. Each later rung adds weight.",
		);
		expect(
			findAll(article, node => node.name === "Pull"),
		).toEqual([]);
	});

	test("puts the copy a paragraph after its source when the source sits early in the section", () => {
		expect(
			flowOf(
				paragraph(
					pull(text("Stop at the first rung.")),
					text(" Each later rung adds weight."),
				),
				element("p", "Then the next."),
				element("p", "And the last."),
				visualPair,
			),
		).toEqual([
			"Stop at the first rung. Each later rung adds weight.",
			"Then the next.",
			"“Stop at the first rung.”",
			"And the last.",
			"figure",
		]);
	});

	test("puts the copy a paragraph before its source when the source sits late in the section", () => {
		expect(
			flowOf(
				element("p", "One."),
				element("p", "Two."),
				element("p", "Three."),
				paragraph(text("Then "), pull(text("stop."))),
			),
		).toEqual([
			"One.",
			"Two.",
			"“stop.”",
			"Three.",
			"Then stop.",
		]);
	});

	test("lets a figure stand between the copy and its source", () => {
		expect(
			flowOf(
				element("p", "Intro."),
				paragraph(pull(text("A rule."))),
				visualPair,
				element("p", "After."),
			),
		).toEqual([
			"Intro.",
			"A rule.",
			"figure",
			"“A rule.”",
			"After.",
		]);
	});

	test("does not count a lone example that stands beside its source as between them", () => {
		expect(
			flowOf(
				jsx("Beside", [
					paragraph(pull(text("A rule."))),
					jsx("Example", [], [{ name: "visual" }]),
				]),
				visualPair,
				element("p", "After."),
			),
		).toEqual([
			"A rule.",
			"figure",
			"figure",
			"“A rule.”",
			"After.",
		]);
	});

	test("leaves the copy out when the section has no place a paragraph or a figure away", () => {
		const nodes = [
			element("p", "Before."),
			paragraph(pull(text("A rule."))),
		];
		expect(flowOf(...nodes)).toEqual([
			"Before.",
			"A rule.",
		]);
		expect(
			findAll(
				sectionOf(...nodes),
				node => node.name === "Pull",
			),
		).toEqual([]);
		expect(
			findAll(
				parts[10],
				node => node.properties?.["dataPull"] !== undefined,
			),
		).toEqual([]);
		expect(textOf(parts[10])).toContain(
			"Read the ladder first.",
		);
	});

	test("leaves links out of the copy, so nothing hidden takes focus", () => {
		const section = sectionOf(
			paragraph(pull(text("Read "), link, text(" first."))),
			element("p", "Then the next."),
			element("p", "And the last."),
		);
		const copy = findAll(
			section,
			node => node.properties?.["dataPull"] !== undefined,
		);
		expect(copy.map(textOf)).toEqual([
			"Read the ladder first.",
		]);
		expect(
			findAll(copy[0], node => node.tagName === "a"),
		).toEqual([]);
		expect(
			findAll(section, node => node.tagName === "a"),
		).toHaveLength(1);
	});

	test("leaves a page without a title untouched", () => {
		const tree = { type: "root", children: [element("p")] };
		expect(transform(tree)).toBe(tree);
	});
});

const metaTitled = (title: string): Node => ({
	type: "mdxJsxFlowElement",
	name: "Meta",
	attributes: [
		{
			type: "mdxJsxAttribute",
			name: "title",
			value: title,
		},
	],
	children: [],
});

const guideExport = (
	options: Readonly<Record<string, unknown>>,
): Node => ({
	type: "mdxjsEsm",
	value: "export const guide = {};",
	data: {
		estree: {
			type: "Program",
			body: [
				{
					type: "ExportNamedDeclaration",
					declaration: {
						type: "VariableDeclaration",
						declarations: [
							{
								type: "VariableDeclarator",
								id: { type: "Identifier", name: "guide" },
								init: {
									type: "ObjectExpression",
									properties: Object.entries(options).map(
										([name, value]) => ({
											type: "Property",
											key: { type: "Identifier", name },
											value: { type: "Literal", value },
										}),
									),
								},
							},
						],
					},
				},
			],
		},
	},
});

const guideOf = (...nodes: readonly Node[]) =>
	transform({
		type: "root",
		children: nodes,
	}).children?.find(node => node.tagName === "article");

const titleOf = (guide: Node | undefined) =>
	findAll(guide, node => node.tagName === "h1")[0];

describe("rehypeGuide's signatures", () => {
	test("ends the title in a full stop and names its section as an eyebrow", () => {
		const guide = guideOf(
			metaTitled("Design system/Foundation/Colour"),
			element("h1", "Colour"),
		);
		const title = titleOf(guide);
		expect(guide?.properties?.["dataAccent"]).toBe(
			"yellow",
		);
		expect(guide?.properties?.["dataHero"]).toBeUndefined();
		expect(title?.properties?.["dataEyebrow"]).toBe(
			"Foundation",
		);
		expect(title?.children?.[0]?.properties).toEqual({
			dataStop: "",
		});
		expect(textOf(title)).toBe("Colour");
	});

	test("leaves the eyebrow out of a top-level page and of a title that already names its section", () => {
		expect(
			titleOf(
				guideOf(
					metaTitled("Design system/Brand"),
					element("h1", "Brand"),
				),
			)?.properties?.["dataEyebrow"],
		).toBeUndefined();
		expect(
			titleOf(
				guideOf(
					metaTitled("Design system/Principles/Overview"),
					element("h1", "Principles"),
				),
			)?.properties?.["dataEyebrow"],
		).toBeUndefined();
	});

	test("takes the accent, the hero and the heading stops from the page's guide export", () => {
		const guide = guideOf(
			guideExport({
				accent: "green",
				hero: "wave",
				headingStops: true,
			}),
			metaTitled("Design system/Brand"),
			element("h1", "Brand"),
			element("p", "The opener."),
			element("h2", "Colour"),
			element("p", "Yellow is the scheme."),
		);
		expect(guide?.properties).toMatchObject({
			dataAccent: "green",
			dataHero: "",
		});
		const opener = findAll(
			guide,
			node => node.properties?.["dataBeat"] !== undefined,
		)[0];
		expect(opener?.children?.[0]?.properties).toEqual({
			dataTiles: "",
		});
		expect(opener?.children?.[0]?.children?.[0]?.name).toBe(
			"GuideTiles",
		);
		expect(
			findAll(
				titleOf(guide),
				node => node.name === "GuideUnderline",
			)[0]?.attributes,
		).toEqual([
			{
				type: "mdxJsxAttribute",
				name: "shape",
				value: "wave",
			},
		]);
		expect(
			findAll(guide, node => node.tagName === "h2")[0]
				?.children?.[0]?.properties,
		).toEqual({ dataStop: "" });
	});

	test("keeps section headings without a full stop unless the page asks", () => {
		const guide = guideOf(
			element("h1", "Colour"),
			element("h2", "Ramps"),
		);
		expect(
			findAll(guide, node => node.tagName === "h2")[0]
				?.children?.[0]?.type,
		).toBe("text");
	});

	test("rejects an option it does not know", () => {
		expect(() =>
			guideOf(
				guideExport({ accent: "purple" }),
				element("h1", "Colour"),
			),
		).toThrow();
	});
});
