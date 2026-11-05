type DocComment = Readonly<{
	markdown: string;
	defaultValue: string | undefined;
}>;

const linkify = (text: string) =>
	text.replace(
		/\{@link\s+([^}\s|]+)(?:[\s|]+([^}]+))?\}/g,
		(_, name: string, label: string | undefined) =>
			`\`${label ?? name}\``,
	);

const dedent = (code: string) => {
	const lines = code
		.replace(/^\s*\n|\s+$/g, "")
		.split("\n");
	const indent = Math.min(
		...lines
			.filter(line => line.trim() !== "")
			.map(line => /^[ \t]*/.exec(line)?.[0].length ?? 0),
	);
	return lines.map(line => line.slice(indent)).join("\n");
};

const fenced = (code: string) =>
	code.includes("```")
		? code.trim()
		: `\`\`\`tsx\n${dedent(code)}\n\`\`\``;

const tagged = (name: string, body: string) => {
	switch (name) {
		case "example":
			return fenced(body);
		case "deprecated":
			return `**Deprecated.** ${linkify(body.trim())}`;
		case "see":
			return `See ${linkify(body.trim())}`;
		default:
			return `**${name.charAt(0).toUpperCase()}${name.slice(1)}** ${linkify(body.trim())}`;
	}
};

/**
 * The Markdown a docs page shows for a JSDoc comment as react-docgen extracts
 * it: prose with `{@link}`s as code, each `@example` as a `tsx` code block, and
 * the `@default` value set apart for the args table's Default column.
 *
 * @example
 * docCommentOf('Visual tier. @default "secondary"');
 * // { markdown: "Visual tier.", defaultValue: '"secondary"' }
 */
export const docCommentOf = (text: string): DocComment => {
	const sections = text
		.split(/^(?=@[a-zA-Z]+(?:\s|$))/m)
		.flatMap(section =>
			section.startsWith("@example")
				? [section]
				: section.split(/\s+(?=@[a-zA-Z]+(?:\s|$))/),
		)
		.map(section => {
			const tag = /^@([a-zA-Z]+)(?:\s|$)([\s\S]*)$/.exec(
				section,
			);
			return {
				section,
				name: tag?.[1],
				body: tag?.[2] ?? "",
			};
		});
	const tags = sections.flatMap(({ name, body }) =>
		name === undefined ? [] : [{ name, body }],
	);
	const prose = sections
		.filter(({ name }) => name === undefined)
		.map(({ section }) => linkify(section.trim()))
		.filter(section => section !== "");
	const defaultTag = tags.find(
		tag =>
			tag.name === "default" || tag.name === "defaultValue",
	);

	return {
		markdown: [
			...prose,
			...tags
				.filter(tag => tag !== defaultTag)
				.map(tag => tagged(tag.name, tag.body)),
		].join("\n\n"),
		defaultValue: defaultTag?.body.trim(),
	};
};
