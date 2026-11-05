import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import axe from "axe-core";
import {
	GLOBALS_UPDATED,
	SET_GLOBALS,
} from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";
import { configure, spyOn } from "storybook/test";
import { z } from "zod";
import {
	STORY_LOCALE,
	StoryProviders,
} from "../src/lib/storybook/story-providers.tsx";
import { registerContrastChecks } from "./contrast-checks.ts";
import { docCommentOf } from "./doc-comment.ts";
import { DocsPage } from "./docs-page.tsx";
import { mdxComponents } from "./mdx-components.tsx";
import { themeOf } from "./theme-global.ts";
import { ThemedDocsContainer } from "./themed-docs-container.tsx";
import "../src/style/tokens.gen.css";
import "../src/style/base.scss";
import "./docs.scss";

configure({ asyncUtilTimeout: 30_000 });

const resetAxe = axe.reset;
axe.reset = () => {
	resetAxe();
	registerContrastChecks();
};

const docgenInfo = z.object({
	description: z.string(),
	namespace: z
		.object({ description: z.string() })
		.optional(),
});

const applyTheme = (payload: unknown) => {
	const theme = themeOf(payload);
	if (theme !== undefined) {
		document.documentElement.dataset["theme"] = theme;
	}
};

addons.getChannel().on(SET_GLOBALS, applyTheme);
addons.getChannel().on(GLOBALS_UPDATED, applyTheme);

const preview: Preview = {
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			page: DocsPage,
			container: ThemedDocsContainer,
			components: mdxComponents,
			extractComponentDescription: (component: unknown) => {
				const info =
					typeof component === "function" &&
					"__docgenInfo" in component
						? docgenInfo.safeParse(
								component["__docgenInfo"],
							)
						: undefined;
				if (info?.success !== true) {
					return null;
				}
				const markdown = [
					info.data.namespace?.description,
					info.data.description,
				]
					.flatMap(text =>
						text === undefined
							? []
							: [docCommentOf(text).markdown],
					)
					.filter(text => text !== "")
					.join("\n\n");
				return markdown === "" ? null : markdown;
			},
		},
		options: {
			storySort: {
				order: [
					"Design system",
					[
						"Introduction",
						"Getting started",
						"Foundation",
						[
							"Token architecture",
							"Colour",
							"Spacing",
							"Shape",
							"Elevation",
							"Motion",
							"Type",
							"Iconography",
							"States",
						],
						"Principles",
						[
							"Overview",
							"Separation",
							"Interaction",
							"Accessibility",
							"Layout",
							"Responsiveness",
							"Language",
						],
						"Patterns",
						"Components",
						"Working on the system",
						["Contributing", "Writing a rule", "Changelog"],
					],
					"*",
				],
			},
		},
	},
	argTypesEnhancers: [
		({ argTypes }) =>
			Object.fromEntries(
				Object.entries(argTypes).map(([name, argType]) => {
					if (argType.description === undefined) {
						return [name, argType];
					}
					const { markdown, defaultValue } = docCommentOf(
						argType.description,
					);
					return [
						name,
						{
							...argType,
							description: markdown,
							table:
								defaultValue === undefined ||
								argType.table?.defaultValue !== undefined
									? argType.table
									: {
											...argType.table,
											defaultValue: {
												summary: defaultValue,
											},
										},
						},
					];
				}),
			),
	],
	initialGlobals: {
		theme: "light",
	},
	decorators: [
		withThemeByDataAttribute({
			themes: { light: "light", dark: "dark" },
			defaultTheme: "light",
			attributeName: "data-theme",
		}),
		Story => (
			<StoryProviders>
				<Story />
			</StoryProviders>
		),
	],
	beforeEach: () => {
		document.documentElement.setAttribute(
			"lang",
			STORY_LOCALE,
		);

		const offline = spyOn(
			globalThis,
			"fetch",
		).mockRejectedValue(new TypeError("offline"));
		return () => offline.mockRestore();
	},
};

export default preview;
