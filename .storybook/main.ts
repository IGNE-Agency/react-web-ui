import type { StorybookConfig } from "@storybook/react-vite";
import rehypeShiki from "@shikijs/rehype";
import remarkGfm from "remark-gfm";
import { mergeConfig, type UserConfig } from "vite";
import { kitDocgen } from "./docgen.ts";
import { docsPreviews } from "./docs-links/previews.ts";
import { rehypeGuide } from "./guide/rehype-guide.ts";

const config: StorybookConfig = {
	stories: [
		"../src/**/*.stories.tsx",
		"../src/**/*.mdx",
		"../docs/**/*.mdx",
		"../docs/**/*.stories.tsx",
	],
	addons: [
		{
			name: "@storybook/addon-docs",
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [remarkGfm],
						rehypePlugins: [
							rehypeGuide,
							[
								rehypeShiki,
								{
									themes: {
										light: "github-light",
										dark: "github-dark",
									},
									defaultColor: false,
								},
							],
						],
					},
				},
			},
		},
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
		"@storybook/addon-themes",
	],
	framework: "@storybook/react-vite",
	staticDirs: [
		{ from: "../docs/brand/assets", to: "/brand" },
	],
	core: {
		builder: {
			name: "@storybook/builder-vite",
			options: {
				viteConfigPath: ".storybook/vite.config.ts",
			},
		},
		disableTelemetry: true,
		disableWhatsNewNotifications: true,
	},
	typescript: {
		reactDocgen: false,
	},
	viteFinal: viteConfig =>
		mergeConfig(
			{
				...viteConfig,
				plugins: [
					kitDocgen(),
					...(viteConfig.plugins ?? []),
				],
			},
			{
				plugins: [docsPreviews()],
				build: {
					rolldownOptions: {
						onwarn: (warning, warn) => {
							if (warning.code === "IMPORT_IS_UNDEFINED") {
								throw new Error(warning.message);
							}
							warn(warning);
						},
					},
				},
			} satisfies UserConfig,
		),
};

export default config;
