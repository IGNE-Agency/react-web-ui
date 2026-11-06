import { create, type ThemeVars } from "storybook/theming";

const brand = {
	brandTitle: "@igne-agency/react-web-ui",
	brandImage: "brand/igne-logo-yellow.svg",
	brandUrl: "./",
	brandTarget: "_self",
	fontBase: "Satoshi, system-ui, sans-serif",
	appBorderRadius: 12,
	inputBorderRadius: 8,
	colorPrimary: "#ffd86f",
} as const;

const light = {
	paper: "#f8f4f1",
	surface: "#ffffff",
	sand: "#efe8e3",
	sandStrong: "#d8cac0",
	ink: "#363636",
	muted: "#655e5d",
} as const;

const dark = {
	paper: "#262321",
	surface: "#393533",
	sand: "#433f3c",
	sandStrong: "#5d5751",
	ink: "#f8f4f1",
	muted: "#d2c9c2",
	blue: "#9fc8f7",
} as const;

/**
 * Storybook's manager and docs themes in the IGNE docs palette of
 * `docs/brand/palette.scss`, one per toolbar theme.
 *
 * @example
 * addons.setConfig({ theme: brandThemes.dark });
 */
export const brandThemes: Readonly<
	Record<"light" | "dark", ThemeVars>
> = {
	light: create({
		...brand,
		base: "light",
		colorSecondary: light.ink,
		appBg: light.paper,
		appContentBg: light.surface,
		appHoverBg: light.sand,
		appBorderColor: light.sandStrong,
		textColor: light.ink,
		textMutedColor: light.muted,
		textInverseColor: light.paper,
		barBg: light.surface,
		barTextColor: light.muted,
		barHoverColor: light.ink,
		barSelectedColor: light.ink,
		buttonBg: light.paper,
		buttonBorder: light.sandStrong,
		booleanBg: light.sand,
		booleanSelectedBg: light.surface,
		inputBg: light.surface,
		inputBorder: light.sandStrong,
		inputTextColor: light.ink,
	}),
	dark: create({
		...brand,
		base: "dark",
		colorSecondary: dark.blue,
		appBg: dark.paper,
		appContentBg: dark.surface,
		appHoverBg: dark.sand,
		appBorderColor: dark.sandStrong,
		textColor: dark.ink,
		textMutedColor: dark.muted,
		textInverseColor: dark.paper,
		barBg: dark.surface,
		barTextColor: dark.muted,
		barHoverColor: dark.ink,
		barSelectedColor: dark.ink,
		buttonBg: dark.paper,
		buttonBorder: dark.sandStrong,
		booleanBg: dark.paper,
		booleanSelectedBg: dark.sand,
		inputBg: dark.paper,
		inputBorder: dark.sandStrong,
		inputTextColor: dark.ink,
	}),
};
