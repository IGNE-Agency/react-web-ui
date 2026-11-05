type GuideNode = Readonly<{
	type: string;
	name?: string | null;
	tagName?: string;
	value?: string;
	attributes?: readonly Readonly<{ name?: string }>[];
	properties?: Readonly<Record<string, unknown>>;
	children?: readonly GuideNode[];
}>;

type FigureKind =
	| "pair"
	| "example"
	| "illustration"
	| "specimen"
	| "code"
	| "table"
	| "other";

type Block =
	| Readonly<{
			role:
				| "hoisted"
				| "title"
				| "heading"
				| "text"
				| "beside";
	  }>
	| Readonly<{ role: "figure"; kind: FigureKind }>;

type Beat = Readonly<{
	heading: GuideNode | undefined;
	text: readonly GuideNode[];
	figure: GuideNode | undefined;
	kind: FigureKind | undefined;
}>;

const TEXT_TAGS = new Set([
	"p",
	"ul",
	"ol",
	"blockquote",
	"h3",
	"h4",
	"h5",
	"h6",
	"hr",
]);

const JSX_FIGURES: Readonly<
	Partial<Record<string, FigureKind>>
> = {
	DoDont: "pair",
	Example: "example",
	Illustration: "illustration",
	Specimen: "specimen",
};

const blockOf = (node: GuideNode): Block | undefined => {
	switch (node.type) {
		case "mdxjsEsm":
			return { role: "hoisted" };
		case "text":
			return node.value?.trim() === ""
				? undefined
				: { role: "text" };
		case "mdxJsxFlowElement":
			if (node.name === "Meta") {
				return { role: "hoisted" };
			}
			if (node.name === "Beside") {
				return { role: "beside" };
			}
			return {
				role: "figure",
				kind: JSX_FIGURES[node.name ?? ""] ?? "other",
			};
		case "element":
			break;
		default:
			return { role: "text" };
	}
	const tagName = node.tagName ?? "";
	switch (tagName) {
		case "h1":
			return { role: "title" };
		case "h2":
			return { role: "heading" };
		case "pre":
			return { role: "figure", kind: "code" };
		case "table":
			return { role: "figure", kind: "table" };
		default:
			return TEXT_TAGS.has(tagName)
				? { role: "text" }
				: { role: "figure", kind: "other" };
	}
};

const roleOf = (node: GuideNode) => blockOf(node)?.role;

const textOf = (node: GuideNode): string =>
	node.type === "text"
		? (node.value ?? "")
		: (node.children ?? []).map(textOf).join("");

const lengthOf = (nodes: readonly GuideNode[]) =>
	nodes.map(textOf).join(" ").replace(/\s+/g, " ").trim()
		.length;

const hasVisual = (node: GuideNode): boolean =>
	(node.attributes ?? []).some(
		attribute => attribute.name === "visual",
	) || (node.children ?? []).some(hasVisual);

const isPull = (node: GuideNode) =>
	node.type === "mdxJsxTextElement" && node.name === "Pull";

const isLink = (node: GuideNode) =>
	node.type === "element" && node.tagName === "a";

const pullsOf = (node: GuideNode): readonly GuideNode[] =>
	isPull(node)
		? [node]
		: (node.children ?? []).flatMap(pullsOf);

const unwrap = (
	node: GuideNode,
	unwrapped: (child: GuideNode) => boolean,
): GuideNode =>
	node.children === undefined
		? node
		: {
				...node,
				children: node.children.flatMap(child =>
					unwrapped(child)
						? (child.children ?? []).map(grandchild =>
								unwrap(grandchild, unwrapped),
							)
						: [unwrap(child, unwrapped)],
				),
			};

const element = (
	tagName: string,
	properties: Readonly<Record<string, unknown>>,
	children: readonly GuideNode[],
): GuideNode => ({
	type: "element",
	tagName,
	properties,
	children,
});

const beatOf = (
	heading: GuideNode | undefined,
	text: readonly GuideNode[] = [],
	figure?: GuideNode,
): Beat => {
	const block =
		figure === undefined ? undefined : blockOf(figure);
	return {
		heading,
		text,
		figure,
		kind: block?.role === "figure" ? block.kind : undefined,
	};
};

const besideBeat = (
	heading: GuideNode | undefined,
	node: GuideNode,
) => {
	const parts = (node.children ?? []).filter(
		child => blockOf(child) !== undefined,
	);
	const figure = parts.findLast(
		child => roleOf(child) === "figure",
	);
	return beatOf(
		heading,
		parts.filter(child => child !== figure),
		figure,
	);
};

const isFilled = (beat: Beat) =>
	beat.heading !== undefined ||
	beat.text.length > 0 ||
	beat.figure !== undefined;

const beatsOf = (
	heading: GuideNode | undefined,
	nodes: readonly GuideNode[],
) =>
	nodes
		.reduce<readonly Beat[]>(
			(beats, node) => {
				const current = beats.at(-1) ?? beatOf(heading);
				const before = beats.slice(0, -1);
				const open =
					current.figure === undefined &&
					current.text.length === 0;
				switch (roleOf(node)) {
					case undefined:
					default:
						return beats;
					case "beside":
						return open
							? [
									...before,
									besideBeat(current.heading, node),
									beatOf(undefined),
								]
							: [
									...beats,
									besideBeat(undefined, node),
									beatOf(undefined),
								];
					case "figure":
						return current.figure === undefined
							? [
									...before,
									beatOf(
										current.heading,
										current.text,
										node,
									),
								]
							: [...beats, beatOf(undefined, [], node)];
					case "hoisted":
					case "title":
					case "heading":
					case "text":
						return current.figure === undefined
							? [
									...before,
									beatOf(current.heading, [
										...current.text,
										node,
									]),
								]
							: [...beats, beatOf(undefined, [node])];
				}
			},
			[beatOf(heading)],
		)
		.filter(isFilled);

const pullCopy = (pull: GuideNode) =>
	element(
		"div",
		{ dataPull: "", ariaHidden: "true" },
		unwrap(pull, isLink).children ?? [],
	);

const isCopy = (node: GuideNode) =>
	node.properties?.["dataPull"] !== undefined;

type Unit = Readonly<{
	beat: number;
	text: number | undefined;
	separates: boolean;
	pulls: readonly GuideNode[];
}>;

const standsBeside = (beat: Beat) =>
	beat.kind === "example" &&
	beat.figure !== undefined &&
	hasVisual(beat.figure);

const unitsOf = (beats: readonly Beat[]): readonly Unit[] =>
	beats.flatMap((beat, index) => [
		...beat.text.map((node, text) => ({
			beat: index,
			text,
			separates: true,
			pulls: pullsOf(node),
		})),
		...(beat.figure === undefined
			? []
			: [
					{
						beat: index,
						text: undefined,
						separates: !standsBeside(beat),
						pulls: [],
					},
				]),
	]);

const separates = (units: readonly Unit[]) =>
	units.some(unit => unit.separates);

const anchorOf = (
	units: readonly Unit[],
	source: number,
) => {
	const later = units.findIndex(
		(_, after) =>
			after > source &&
			separates(units.slice(source + 1, after + 1)),
	);
	const earlier = units.findLastIndex(
		(_, after) =>
			after < source &&
			separates(units.slice(after + 1, source)),
	);
	const [preferred, fallback] =
		units.length - 1 - source >= source
			? [later, earlier]
			: [earlier, later];
	return units[preferred === -1 ? fallback : preferred];
};

const withPulls = (beats: readonly Beat[]) => {
	const units = unitsOf(beats);
	const anchored = units.flatMap((unit, source) => {
		const anchor =
			unit.pulls.length === 0
				? undefined
				: anchorOf(units, source);
		return anchor === undefined
			? []
			: [{ anchor, copies: unit.pulls.map(pullCopy) }];
	});
	const copiesAfter = (beat: number, text?: number) =>
		anchored.flatMap(({ anchor, copies }) =>
			anchor.beat === beat && anchor.text === text
				? copies
				: [],
		);
	return beats.flatMap((beat, index) => {
		const trailing = copiesAfter(index);
		return [
			{
				...beat,
				text: beat.text.flatMap((node, text) => [
					node,
					...copiesAfter(index, text),
				]),
			},
			...(trailing.length === 0
				? []
				: [beatOf(undefined, trailing)]),
		];
	});
};

const proseOf = (text: readonly GuideNode[]) =>
	text.reduce<readonly GuideNode[]>((children, node) => {
		if (isCopy(node)) {
			return [...children, node];
		}
		const last = children.at(-1);
		const unwrapped = unwrap(node, isPull);
		return last === undefined || isCopy(last)
			? [
					...children,
					element("div", { dataProse: "" }, [unwrapped]),
				]
			: [
					...children.slice(0, -1),
					{
						...last,
						children: [...(last.children ?? []), unwrapped],
					},
				];
	}, []);

const beatElement = (beat: Beat) => {
	const code =
		beat.kind === "code" ||
		((beat.kind === "pair" || beat.kind === "example") &&
			beat.figure !== undefined &&
			!hasVisual(beat.figure));

	return element(
		"div",
		{
			dataBeat: "",
			dataFigure: beat.kind ?? "none",
			dataCode: code ? "" : undefined,
		},
		[
			...(beat.heading === undefined ? [] : [beat.heading]),
			...proseOf(beat.text),
			...(beat.figure === undefined
				? []
				: [
						element("div", { dataSlot: "" }, [beat.figure]),
					]),
		],
	);
};

type Composition =
	| "lead"
	| "note"
	| "beside"
	| "essay"
	| "chapter";

type Head = "hang" | "over";

type Shape = Readonly<{
	composition: Composition;
	head: Head;
}>;

const SHORT_TEXT = 320;
const LONG_RUN = 4;

const HANGS_UP_TO: Readonly<Record<Composition, number>> = {
	lead: 20,
	note: 0,
	beside: 20,
	essay: 40,
	chapter: 0,
};

const RAIL: Readonly<Record<Composition, string>> = {
	lead: "head",
	note: "text",
	beside: "head",
	essay: "wide head",
	chapter: "numeral",
};

const compositionOf = (
	beats: readonly Beat[],
): Composition => {
	const figures = beats.filter(
		beat => beat.figure !== undefined,
	);
	if (figures.length === 0) {
		return "essay";
	}
	if (figures.length >= LONG_RUN) {
		return "chapter";
	}
	if (
		figures.every(
			beat =>
				beat.kind === "example" &&
				beat.figure !== undefined &&
				hasVisual(beat.figure),
		)
	) {
		return "beside";
	}
	if (
		beats.every(
			beat =>
				beat.kind === "pair" &&
				beat.figure !== undefined &&
				hasVisual(beat.figure) &&
				lengthOf(beat.text) <= SHORT_TEXT,
		)
	) {
		return "note";
	}
	return "lead";
};

const shapeOf = (beats: readonly Beat[]): Shape => {
	const composition = compositionOf(beats);
	const heading = beats[0]?.heading;
	return {
		composition,
		head:
			heading !== undefined &&
			lengthOf([heading]) <= HANGS_UP_TO[composition]
				? "hang"
				: "over",
	};
};

const railOf = ({ composition, head }: Shape) =>
	head === "over" && composition !== "note"
		? "numeral"
		: RAIL[composition];

const turnOf = (from: Shape, to: Shape) => {
	if (
		from.composition === to.composition &&
		from.head === to.head
	) {
		return undefined;
	}
	return railOf(from) === railOf(to) ? "minor" : "major";
};

const sectionElement = (
	beats: readonly Beat[],
	shape: Shape,
	turn: string | undefined,
) => {
	const properties = {
		dataPart: "section",
		dataCompose: shape.composition,
		dataHead: shape.head,
		dataTurn: turn,
	};
	const [first, ...rest] = beats;
	if (
		shape.head === "hang" ||
		first?.heading === undefined
	) {
		return element(
			"section",
			properties,
			beats.map(beatElement),
		);
	}
	return element("section", properties, [
		first.heading,
		element(
			"div",
			{ dataRun: "" },
			[{ ...first, heading: undefined }, ...rest]
				.filter(isFilled)
				.map(beatElement),
		),
	]);
};

/**
 * A rehype plugin that turns a flat MDX page into a design-guide article: the
 * content before the first `h2` becomes an opener `header`, followed by the
 * page's `GuideContents`, each `h2` with what follows it a `section`, and each run of text with the figure it introduces a
 * beat. Each section names its composition, whether its heading hangs beside
 * its text or stands over it, and how far it turns from the section before. A
 * sentence wrapped in `<Pull>` stays where it is, and a hidden copy of it goes
 * at least a paragraph or a figure away in the same section, or nowhere when
 * the section has no such place.
 *
 * @example
 * mdxCompileOptions: { rehypePlugins: [rehypeGuide] }
 */
export const rehypeGuide = () => (tree: GuideNode) => {
	const nodes = tree.children ?? [];
	if (!nodes.some(node => roleOf(node) === "title")) {
		return tree;
	}

	const hoisted = nodes.filter(
		node => roleOf(node) === "hoisted",
	);
	const flow = nodes.filter(
		node =>
			roleOf(node) !== "hoisted" &&
			blockOf(node) !== undefined,
	);
	const starts = flow.flatMap((node, position) =>
		roleOf(node) === "heading" ? [position] : [],
	);
	const opener = flow.slice(0, starts[0] ?? flow.length);
	const title = opener.find(
		node => roleOf(node) === "title",
	);

	const sections = starts.map((start, index) =>
		beatsOf(
			flow[start],
			flow.slice(
				start + 1,
				starts[index + 1] ?? flow.length,
			),
		),
	);
	const shapes = sections.map(shapeOf);

	return {
		...tree,
		children: [
			...hoisted,
			element(
				"article",
				{ className: ["guide"], dataGuide: "" },
				[
					element(
						"header",
						{ dataPart: "opener" },
						withPulls(
							beatsOf(
								title,
								opener.filter(node => node !== title),
							),
						).map(beatElement),
					),
					...(sections.length === 0
						? []
						: [
								element(
									"div",
									{
										dataPart: "contents",
										style: `--guide-sections: ${sections.length}`,
									},
									[
										{
											type: "mdxJsxFlowElement",
											name: "GuideContents",
											attributes: [],
											children: [],
										},
									],
								),
							]),
					...sections.map((beats, index) => {
						const previous = shapes[index - 1];
						const shape = shapeOf(beats);
						return sectionElement(
							withPulls(beats),
							shape,
							previous === undefined
								? undefined
								: turnOf(previous, shape),
						);
					}),
				],
			),
		],
	};
};
