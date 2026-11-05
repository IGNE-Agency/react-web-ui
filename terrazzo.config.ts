import { defineConfig } from "@terrazzo/cli";
import type { ConfigInit } from "@terrazzo/parser";
import js from "@terrazzo/plugin-js";

import kitTokens from "./src/terrazzo/index.ts";

/**
 * Builds the kit's default theme from its own token files. Apps run the
 * published preset (`@maanlamp/react-web-ui/terrazzo`) against their own
 * resolver instead; this config imports the preset's source so `bun run tokens`
 * needs no build first. The token values as JavaScript are for the design
 * system's specimens only and never ship.
 */
const config: ConfigInit = defineConfig({
	tokens: ["./tokens/kit.resolver.json"],
	outDir: "./src/style/",
	plugins: [
		kitTokens({ filename: "tokens.gen.css" }),
		js({
			filename: "../../docs/design-system/tokens.gen.js",
			properties: [
				"$type",
				"$value",
				"$description",
				"$extensions",
				"aliasOf",
				"aliasChain",
			],
		}),
	],
});

export default config;
