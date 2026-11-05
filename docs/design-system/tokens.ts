import { z } from "zod";
import {
	type Color,
	type Dimension,
	type Duration,
	resolver,
	type Tokens,
	type Typography,
} from "./tokens.gen.js";
import ref from "../../tokens/ref.tokens.json";
import sys from "../../tokens/sys.tokens.json";
import { variableNameOf } from "../../src/terrazzo/index";

/** A theme the tokens resolve in. */
export type Theme = Parameters<
	typeof resolver.apply
>[0]["theme"];

/** A design token's id, e.g. `sys.color.primary`. */
export type TokenId = keyof Tokens;

/** A colour token's resolved value. */
export type ColourValue = Color["$value"];

/** A dimension token's resolved value. */
export type DimensionValue = Dimension["$value"];

/** A typography token's resolved value. */
export type TypographyValue = Typography["$value"];

/** A duration token's resolved value. */
export type DurationValue = Duration["$value"];

/** A group of tokens as the token files declare it, in their order. */
export type Group = Readonly<{
	id: string;
	/** The group's own segment of its id, e.g. `green` for `ref.green`. */
	name: string;
	description: string | undefined;
	extensions: unknown;
	/** The tokens directly in the group. */
	tokens: readonly TokenId[];
	/** The ids of the groups directly in the group. */
	groups: readonly string[];
}>;

/** A colour ramp: a colour group in the reference layer. */
export type Ramp = Group;

/** Every theme the tokens resolve in, the default first. */
export const THEMES: readonly Theme[] = resolver
	.listPermutations()
	.map(({ theme }) => theme);

const BASE = resolver.apply({ theme: "light" });
const SOURCES: readonly unknown[] = [ref, sys];

const groupNode = z.record(z.string(), z.unknown());
const described = z.object({ $description: z.string() });
const derivedExtension = z.object({
	"nl.igne.derived": z.object({ hue: z.number() }),
});
const filterExtension = z.object({
	"nl.igne.css": z.object({
		property: z.literal("filter"),
	}),
});

/**
 * Whether a string is the id of a token in the set.
 *
 * @example
 * isTokenId("sys.color.primary"); // true
 */
export const isTokenId = (id: string): id is TokenId =>
	Object.hasOwn(BASE, id);

/**
 * A token as one theme resolves it.
 *
 * @example
 * tokenOf("sys.color.primary", "dark").aliasOf; // "ref.green.200"
 */
export const tokenOf = (id: TokenId, theme: Theme) =>
	resolver.apply({ theme })[id];

/**
 * The last segment of a token or group id.
 *
 * @example
 * nameOf("sys.radius.md"); // "md"
 */
export const nameOf = (id: string) =>
	id.split(".").at(-1) ?? id;

const childOf = (node: unknown, name: string) =>
	groupNode.safeParse(node).data?.[name];

const nodeAt = (id: string) =>
	SOURCES.map(source =>
		id.split(".").reduce<unknown>(childOf, source),
	).find(node => node !== undefined);

const groupDescriptionOf = (id: string) =>
	described.safeParse(nodeAt(id)).data?.$description;

/**
 * A group of the token files, with its description, extensions, tokens and
 * child groups in declaration order.
 *
 * @example
 * groupOf("sys.radius").tokens; // ["sys.radius.none", "sys.radius.xs", …]
 */
export const groupOf = (id: string): Group => {
	const node = groupNode.safeParse(nodeAt(id)).data ?? {};
	const children = Object.keys(node)
		.filter(name => !name.startsWith("$"))
		.map(name => `${id}.${name}`);
	return {
		id,
		name: nameOf(id),
		description: groupDescriptionOf(id),
		extensions: node["$extensions"],
		tokens: children.filter(isTokenId),
		groups: children.filter(child => !isTokenId(child)),
	};
};

/**
 * What a token is for: its own description, or else that of the nearest group
 * around it that has one.
 *
 * @example
 * descriptionOf("sys.color.success.bg"); // "Done, approved"
 */
export const descriptionOf = (id: TokenId) => {
	const segments = id.split(".");
	return (
		BASE[id].$description ??
		segments
			.slice(1)
			.map((_, index) =>
				segments.slice(0, -1 - index).join("."),
			)
			.map(groupDescriptionOf)
			.find(description => description !== undefined)
	);
};

/**
 * Every colour ramp, in declaration order.
 *
 * @example
 * RAMPS.map(ramp => ramp.name); // ["green", "blue", …]
 */
export const RAMPS: readonly Ramp[] = groupOf("ref")
	.groups.map(groupOf)
	.filter(group =>
		group.tokens.some(id => BASE[id].$type === "color"),
	);

/**
 * The ramp a token is a step of, if it is one.
 *
 * @example
 * rampOf("ref.green.550")?.name; // "green"
 */
export const rampOf = (id: string) =>
	RAMPS.find(ramp => ramp.tokens.some(step => step === id));

/**
 * Whether a token is drawn as a CSS filter rather than its usual property.
 *
 * @example
 * isFilter("sys.elevation.1-filter"); // true
 */
export const isFilter = (id: TokenId) =>
	filterExtension.safeParse(BASE[id].$extensions).success;

const FUNCTIONAL_SPACES = new Set<
	ColourValue["colorSpace"]
>(["lab", "lch", "oklab", "oklch"]);

/**
 * A colour value as a CSS colour.
 *
 * @example
 * cssColourOf({ colorSpace: "oklch", components: [0.54, 0.1, 170], alpha: 1 });
 * // "oklch(0.54 0.1 170 / 1)"
 */
export const cssColourOf = ({
	colorSpace,
	components,
	alpha,
}: ColourValue) => {
	const channels = `${components.map(component => component ?? "none").join(" ")} / ${alpha}`;
	return FUNCTIONAL_SPACES.has(colorSpace)
		? `${colorSpace}(${channels})`
		: `color(${colorSpace} ${channels})`;
};

/**
 * A dimension or duration value as a CSS length or time.
 *
 * @example
 * cssDimensionOf({ value: 0.75, unit: "rem" }); // "0.75rem"
 */
export const cssDimensionOf = ({
	value,
	unit,
}: DimensionValue | DurationValue) => `${value}${unit}`;

const rootPixels = () =>
	Number.parseFloat(
		getComputedStyle(document.documentElement).fontSize,
	);

/**
 * A dimension value in CSS pixels.
 *
 * @example
 * pixelsOf({ value: 0.75, unit: "rem" }); // 12
 */
export const pixelsOf = ({ value, unit }: DimensionValue) =>
	unit === "px" ? value : value * rootPixels();

/**
 * A duration value in milliseconds.
 *
 * @example
 * millisecondsOf({ value: 0.2, unit: "s" }); // 200
 */
export const millisecondsOf = ({
	value,
	unit,
}: DurationValue) => (unit === "s" ? value * 1000 : value);

/**
 * A colour token's value in one theme, or `undefined` for another type.
 *
 * @example
 * colourOf("sys.color.primary", "light")?.colorSpace; // "oklch"
 */
export const colourOf = (id: TokenId, theme: Theme) => {
	const token = tokenOf(id, theme);
	return token.$type === "color" ? token.$value : undefined;
};

/**
 * A dimension token's value, or `undefined` for another type.
 *
 * @example
 * dimensionOf("sys.radius.md"); // { value: 0.75, unit: "rem" }
 */
export const dimensionOf = (id: TokenId) => {
	const token = BASE[id];
	return token.$type === "dimension"
		? token.$value
		: undefined;
};

/**
 * A typography token's value, or `undefined` for another type.
 *
 * @example
 * typographyOf("sys.font.body.medium")?.fontWeight; // 400
 */
export const typographyOf = (id: TokenId) => {
	const token = BASE[id];
	return token.$type === "typography"
		? token.$value
		: undefined;
};

/**
 * A number token's value in one theme, or `undefined` for another type.
 *
 * @example
 * numberOf("sys.state.hover", "dark"); // 0.1
 */
export const numberOf = (id: TokenId, theme: Theme) => {
	const token = tokenOf(id, theme);
	return token.$type === "number"
		? token.$value
		: undefined;
};

/**
 * A colour token as CSS for one theme: the variable of the ramp step it points
 * at, which no theme changes, or else its value in that theme.
 *
 * @example
 * colourIn("sys.color.primary", "dark"); // "var(--ref-green-200)"
 */
export const colourIn = (id: TokenId, theme: Theme) => {
	const token = tokenOf(id, theme);
	if (rampOf(id) !== undefined) {
		return `var(${variableNameOf(id)})`;
	}
	if (
		token.aliasOf !== undefined &&
		rampOf(token.aliasOf) !== undefined
	) {
		return `var(${variableNameOf(token.aliasOf)})`;
	}
	return token.$type === "color"
		? cssColourOf(token.$value)
		: undefined;
};

/**
 * A shadow token as a CSS `box-shadow` in one theme.
 *
 * @example
 * shadowIn("sys.elevation.1", "light"); // "0px 1px 2px 0px color(srgb 0 0 0 / 0.1), …"
 */
export const shadowIn = (id: TokenId, theme: Theme) => {
	const token = tokenOf(id, theme);
	return token.$type === "shadow"
		? token.$value
				.map(layer =>
					[
						layer.inset ? "inset" : undefined,
						cssDimensionOf(layer.offsetX),
						cssDimensionOf(layer.offsetY),
						cssDimensionOf(layer.blur),
						cssDimensionOf(layer.spread),
						cssColourOf(layer.color),
					]
						.filter(part => part !== undefined)
						.join(" "),
				)
				.join(", ")
		: undefined;
};

/**
 * What a colour token points at in one theme, in words: a ramp step, another
 * role, or the hue it turns its role to.
 *
 * @example
 * sourceOf("sys.color.primary", "light"); // "green-550"
 * sourceOf("sys.color.focus-ring", "light"); // "primary"
 * sourceOf("sys.color.identity.1.bg", "light"); // "hue 84°"
 */
export const sourceOf = (id: TokenId, theme: Theme) => {
	const token = tokenOf(id, theme);
	const derived = derivedExtension.safeParse(
		token.$extensions,
	).data?.["nl.igne.derived"];
	const target = token.aliasChain?.[0];
	if (derived !== undefined) {
		return `hue ${derived.hue}°`;
	}
	if (target === undefined) {
		return "derived";
	}
	const ramp = rampOf(target);
	return ramp === undefined
		? nameOf(target)
		: `${ramp.name}-${nameOf(target)}`;
};

/**
 * The token a role points at in one theme, one alias step down, if it points
 * at one.
 *
 * @example
 * referenceOf("sys.color.primary", "light"); // "ref.green.550"
 */
export const referenceOf = (id: TokenId, theme: Theme) => {
	const target = tokenOf(id, theme).aliasChain?.[0];
	return target !== undefined && isTokenId(target)
		? target
		: undefined;
};

const canvas = document.createElement("canvas");
canvas.width = 1;
canvas.height = 1;
const context = canvas.getContext("2d", {
	willReadFrequently: true,
});

/**
 * A colour token's value in one theme as sRGB hex.
 *
 * @example
 * hexOf("ref.green.500", "light"); // "#009777"
 */
export const hexOf = (id: TokenId, theme: Theme) => {
	const colour = colourOf(id, theme);
	if (colour === undefined) {
		return "";
	}
	const css = cssColourOf(colour);
	if (context === null) {
		return css;
	}
	context.clearRect(0, 0, 1, 1);
	context.fillStyle = css;
	context.fillRect(0, 0, 1, 1);
	const [red = 0, green = 0, blue = 0] =
		context.getImageData(0, 0, 1, 1).data;
	return `#${[red, green, blue]
		.map(channel => channel.toString(16).padStart(2, "0"))
		.join("")}`;
};

/**
 * The theme the document is drawn in.
 *
 * @example
 * documentTheme(); // "dark"
 */
export const documentTheme = (): Theme =>
	document.documentElement.dataset["theme"] === "dark"
		? "dark"
		: "light";
