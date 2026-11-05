import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import {
	defineConfig,
	defineProject,
	mergeConfig,
} from "vitest/config";
import storybookVite from "./.storybook/vite.config.ts";

const themes = ["light", "dark"] as const;

/** Every package a test reaches, some only through a lazy import, prebundled up front so Vite never reloads a running test. */
const optimizedDeps: readonly string[] = [
	"@base-ui/react/accordion",
	"@base-ui/react/alert-dialog",
	"@base-ui/react/avatar",
	"@base-ui/react/checkbox",
	"@base-ui/react/checkbox-group",
	"@base-ui/react/collapsible",
	"@base-ui/react/combobox",
	"@base-ui/react/dialog",
	"@base-ui/react/drawer",
	"@base-ui/react/field",
	"@base-ui/react/fieldset",
	"@base-ui/react/input",
	"@base-ui/react/menu",
	"@base-ui/react/merge-props",
	"@base-ui/react/meter",
	"@base-ui/react/number-field",
	"@base-ui/react/otp-field",
	"@base-ui/react/popover",
	"@base-ui/react/radio",
	"@base-ui/react/radio-group",
	"@base-ui/react/select",
	"@base-ui/react/switch",
	"@base-ui/react/tabs",
	"@base-ui/react/toast",
	"@base-ui/react/toggle",
	"@base-ui/react/toggle-group",
	"@base-ui/react/tooltip",
	"@base-ui/react/use-render",
	"@internationalized/date",
	"@lexical/history",
	"@lexical/plain-text",
	"@lexical/react/LexicalComposerContext",
	"@lexical/react/LexicalContentEditable",
	"@lexical/react/LexicalExtensionComposer",
	"@lexical/react/LexicalOnChangePlugin",
	"@lexical/react/LexicalTypeaheadMenuPlugin",
	"@tanstack/react-form",
	"@tanstack/react-query",
	"@tanstack/react-router",
	"@tanstack/react-table",
	"@tanstack/react-virtual",
	"@zxcvbn-ts/core",
	"@zxcvbn-ts/language-common",
	"@zxcvbn-ts/language-en",
	"@zxcvbn-ts/language-nl-be",
	"clsx",
	"lexical",
	"react-aria-components",
	"react-error-boundary",
	"temporal-polyfill",
	"zod",
];

const chromium = () => ({
	enabled: true,
	headless: true,
	provider: playwright(),
	instances: [{ browser: "chromium" as const }],
});

export default defineConfig({
	test: {
		passWithNoTests: true,
		projects: [
			defineProject({
				test: {
					name: "unit",
					environment: "node",
					include: ["tests/**/*.test.ts"],
				},
			}),
			mergeConfig(
				storybookVite,
				defineProject({
					test: {
						name: "unit-browser",
						include: ["tests/**/*.test.tsx"],
						testTimeout: 60_000,
						browser: chromium(),
					},
					optimizeDeps: { include: [...optimizedDeps] },
				}),
			),
			...themes.map(theme =>
				mergeConfig(
					storybookVite,
					defineProject({
						plugins: [
							storybookTest({
								configDir: ".storybook",
								initialGlobals: { theme },
							}),
						],
						optimizeDeps: { include: [...optimizedDeps] },
						test: {
							name: `storybook-${theme}`,
							testTimeout: 60_000,
							browser: chromium(),
						},
					}),
				),
			),
		],
	},
});
