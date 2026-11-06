import type {
	ConfigInit,
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

/**
 * The typography properties the kit's tokens set. `fontFamily` is left out:
 * every role takes its family from a custom property the app sets.
 */
const TYPOGRAPHY_PROPERTIES = [
	"fontSize",
	"fontWeight",
	"lineHeight",
] as const;

const VALID_TYPOGRAPHY = "core/valid-typography";

const BODY_FAMILY = "--sys-font-family-body";

const HEADING_FAMILY = "--sys-font-family-heading";

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

/**
 * The custom property a typography token takes its family from:
 * `--sys-font-family-heading` for a heading, `--sys-font-family-body` for
 * everything else.
 *
 * @example
 *   fontFamilyPropertyOf("sys.font.heading.large"); // "--sys-font-family-heading"
 */
export const fontFamilyPropertyOf = (id: string): string =>
	id.split(".").includes("heading")
		? HEADING_FAMILY
		: BODY_FAMILY;

const families = `\t${BODY_FAMILY}: system-ui, sans-serif;\n\t${HEADING_FAMILY}: var(${BODY_FAMILY});\n`;

const literal = (value: unknown): string =>
	isRecord(value) && "value" in value && "unit" in value
		? `${String(value["value"])}${String(value["unit"])}`
		: String(value);

const typography: Transform = (token, { tokensSet }) => {
	if (token.$type !== "typography") {
		return undefined;
	}
	const alias = token.aliasChain?.[0];
	const partials: unknown = token.partialAliasOf;
	const subValue = (property: string, value: unknown) => {
		const partial = isRecord(partials)
			? partials[property]
			: undefined;
		if (alias !== undefined) {
			return `var(${variableNameOf(`${alias}-${property}`)})`;
		}
		if (typeof partial === "string") {
			return tokensSet[partial]?.$type === "typography"
				? `var(${variableNameOf(`${partial}-${property}`)})`
				: `var(${variableNameOf(partial)})`;
		}
		return literal(value);
	};
	return Object.fromEntries([
		[
			"font-family",
			`var(${fontFamilyPropertyOf(token.id)})`,
		],
		...Object.entries(token.$value).flatMap(
			([property, value]) =>
				property === "fontFamily"
					? []
					: [
							[
								variableNameOf(property).slice(2),
								subValue(property, value),
							],
						],
		),
	]);
};

/** Narrows the recommended typography rule to the properties a kit token sets, unless the project chose its own list. */
const narrowTypographyRule = (config: ConfigInit): void => {
	const rule = config.lint.rules[VALID_TYPOGRAPHY];
	if (rule === undefined) {
		return;
	}
	const [severity, options]: readonly [
		(typeof rule)[0],
		unknown,
	] = rule;
	const set = isRecord(options) ? options : {};
	if (!("requiredProperties" in set)) {
		config.lint.rules[VALID_TYPOGRAPHY] = [
			severity,
			{
				...set,
				requiredProperties: [...TYPOGRAPHY_PROPERTIES],
			},
		];
	}
};

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

const ramps = (contents: string): string =>
	`:root {\n${families}${contents}\n}`;

const light = (contents: string): string =>
	`:root,\n[data-theme="light"] {\n\tcolor-scheme: light;\n${contents}\n}`;

const LAYER_ORDER =
	"@layer kit.reset, kit.base, kit.components;";

const layered = (contents: string): string =>
	`${LAYER_ORDER}\n\n@layer kit.base {\n${contents.trimEnd()}\n}\n`;

const dark = (contents: string): string =>
	`[data-theme="dark"] {\n\tcolor-scheme: dark;\n${contents}\n}\n\n@media (prefers-color-scheme: dark) {\n\thtml:not([data-theme="light"]) {\n\t\tcolor-scheme: dark;\n${contents}\n\t}\n}`;

/**
 * A Terrazzo plugin that builds a resolver's tokens into the custom properties
 * the kit's components read: the `ref` ramps on `:root`, the `light` theme's
 * `sys` roles on `:root` and any `[data-theme="light"]` element, and the `dark`
 * theme's on any `[data-theme="dark"]` element and on `<html>` under
 * `prefers-color-scheme: dark` unless `data-theme="light"`, all in the
 * `kit.base` cascade layer after the kit's layer order. A shadow
 * tagged `$extensions["nl.igne.css"].property: "filter"` is written as
 * `drop-shadow()` filters.
 *
 * Typography tokens name no family. A heading role's `font` takes
 * `--sys-font-family-heading` and every other role `--sys-font-family-body`,
 * which defaults to the system stack; the heading family follows the body
 * family unless set. The plugin narrows Terrazzo's `core/valid-typography` rule
 * to `fontSize`, `fontWeight` and `lineHeight` unless the config sets that
 * rule's `requiredProperties` itself.
 *
 * @example
 *   // terrazzo.config.ts
 *   import { defineConfig } from "@terrazzo/cli";
 *   import kitTokens from "@igne-agency/react-web-ui/terrazzo";
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
		transform: (token, transformOptions) =>
			typography(token, transformOptions) ??
			dropShadows(token, transformOptions),
		permutations: [
			{
				input: { theme: "light" },
				include: ["ref.**"],
				prepare: ramps,
			},
			{
				input: { theme: "light" },
				include: ["sys.**"],
				prepare: light,
			},
			{
				input: { theme: "dark" },
				include: ["sys.**"],
				prepare: dark,
			},
		],
	});
	return {
		...plugin,
		config: (config, context) => {
			narrowTypographyRule(config);
			return plugin.config?.(config, context);
		},
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
