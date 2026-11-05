import type {
	DimensionValue,
	Plugin,
	TokenNormalized,
} from "@terrazzo/parser";
import css, {
	type CSSPluginOptions,
} from "@terrazzo/plugin-css";

export type KitTokensOptions = Readonly<{
	/**
	 * The file the custom properties are written to, relative to the config's `outDir`.
	 *
	 * @default "tokens.css"
	 */
	filename?: string;
}>;

type Transform = NonNullable<CSSPluginOptions["transform"]>;

const isRecord = (
	value: unknown,
): value is Readonly<Record<string, unknown>> =>
	typeof value === "object" && value !== null;

const drawnAsFilter = (extensions: unknown): boolean => {
	if (!isRecord(extensions)) {
		return false;
	}
	const extension = extensions["nl.igne.css"];
	return (
		isRecord(extension) &&
		extension["property"] === "filter"
	);
};

const length = ({ value, unit }: DimensionValue): string =>
	`${value}${unit}`;

/**
 * The CSS custom property a design token is built into: its path in kebab
 * case, dots as hyphens, with no prefix.
 *
 * @example
 *   variableNameOf("sys.color.primary"); // "--sys-color-primary"
 */
export const variableNameOf = (id: string): string =>
	`--${id
		.replaceAll(".", "-")
		.replace(
			/(\p{Uppercase_Letter})(\p{Uppercase_Letter}*)/gu,
			(_, first: string, rest: string) =>
				`-${first.toLocaleLowerCase()}${rest}`,
		)}`;

const variableName = (token: TokenNormalized): string =>
	variableNameOf(token.id);

const dropShadows: Transform = (
	token,
	{ tokensSet, transformAlias },
) => {
	if (
		token.$type !== "shadow" ||
		!drawnAsFilter(token.$extensions)
	) {
		return undefined;
	}
	const alias =
		transformAlias ??
		((colour: TokenNormalized) =>
			`var(${variableName(colour)})`);
	return token.$value
		.map((layer, index) => {
			const partial = token.partialAliasOf?.[index];
			const colour =
				typeof partial === "object"
					? tokensSet[partial.color ?? ""]
					: undefined;
			if (colour === undefined) {
				throw new Error(
					`${token.id}: a shadow drawn as a filter takes its colour from a colour token`,
				);
			}
			return `drop-shadow(${length(layer.offsetX)} ${length(layer.offsetY)} ${length(layer.blur)} ${alias(colour)})`;
		})
		.join(" ");
};

const light = (contents: string): string =>
	`:root {\n\tcolor-scheme: light;\n${contents}\n}`;

const LAYER_ORDER =
	"@layer kit.reset, kit.base, kit.components;";

const layered = (contents: string): string =>
	`${LAYER_ORDER}\n\n@layer kit.base {\n${contents.trimEnd()}\n}\n`;

const dark = (contents: string): string =>
	`html[data-theme="dark"] {\n\tcolor-scheme: dark;\n${contents}\n}\n\n@media (prefers-color-scheme: dark) {\n\thtml:not([data-theme="light"]) {\n\t\tcolor-scheme: dark;\n${contents}\n\t}\n}`;

/**
 * A Terrazzo plugin that builds a resolver's tokens into the custom properties
 * the kit's components read: `--ref-*` and `--sys-*`, the `light` theme on
 * `:root` and the `dark` theme's `sys` roles on `html[data-theme="dark"]`, and
 * under `prefers-color-scheme: dark` unless `data-theme="light"`, all in the
 * `kit.base` cascade layer after the kit's layer order. A shadow
 * tagged `$extensions["nl.igne.css"].property: "filter"` is written as
 * `drop-shadow()` filters.
 *
 * @example
 *   // terrazzo.config.ts
 *   import { defineConfig } from "@terrazzo/cli";
 *   import kitTokens from "@maanlamp/react-web-ui/terrazzo";
 *
 *   export default defineConfig({
 *   	tokens: ["./src/style/tokens/app.resolver.json"],
 *   	outDir: "./src/style/",
 *   	plugins: [kitTokens({ filename: "tokens.gen.css" })],
 *   });
 */
const kitTokens = (
	options: KitTokensOptions = {},
): Plugin => {
	const plugin = css({
		filename: options.filename ?? "tokens.css",
		variableName,
		transform: dropShadows,
		permutations: [
			{ input: { theme: "light" }, prepare: light },
			{
				input: { theme: "dark" },
				include: ["sys.**"],
				prepare: dark,
			},
		],
	});
	return {
		...plugin,
		build: hook =>
			plugin.build?.({
				...hook,
				outputFile: (filename, contents) => {
					hook.outputFile(
						filename,
						typeof contents === "string"
							? layered(contents)
							: contents,
					);
				},
			}),
	};
};

export default kitTokens;
