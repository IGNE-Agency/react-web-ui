/**
 * Checks that the docs never declare a kit token. It fails when a stylesheet,
 * HTML head or component under `docs/` or `.storybook/` declares a `--sys-*`
 * or `--ref-*` custom property: the docs chrome reads its own `--docs-*`
 * palette, and the kit's tokens stay the kit's.
 *
 * @example
 *   bun tools/check-docs-tokens.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["docs", ".storybook"];
const EXTENSIONS = [".scss", ".css", ".html", ".tsx"];
const DECLARATION = /--(?:sys|ref)-[\w-]+["']?\s*:/g;

const filesUnder = (root: string): readonly string[] =>
	readdirSync(root, {
		recursive: true,
		withFileTypes: true,
	})
		.filter(
			entry =>
				entry.isFile() &&
				EXTENSIONS.some(extension =>
					entry.name.endsWith(extension),
				),
		)
		.map(entry => join(entry.parentPath, entry.name));

const declarationsIn = (file: string) =>
	readFileSync(file, "utf8")
		.split("\n")
		.flatMap((line, index) =>
			[...line.matchAll(DECLARATION)].map(
				match => `${file}:${index + 1}: ${match[0]}`,
			),
		);

const failures =
	ROOTS.flatMap(filesUnder).flatMap(declarationsIn);

if (failures.length > 0) {
	console.error(
		`The docs declare kit tokens; declare a --docs-* property instead:\n${failures.join("\n")}`,
	);
	process.exit(1);
}
