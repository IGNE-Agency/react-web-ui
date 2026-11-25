import { relative } from "node:path";
import type { Plugin } from "vite";
import { buildTokens, watchTokens } from "./build.ts";

/**
 * A Vite plugin that builds the app's tokens from the `terrazzo.config.*` in
 * the working directory, where Terrazzo resolves the config's paths from: once
 * before a build, and on every change to the config or a token file while the
 * dev server runs.
 *
 * @example
 *   export default defineConfig({ plugins: [tokens()] });
 */
export const tokens = (): Plugin => {
	const root = process.cwd();
	let command: "build" | "serve" = "serve";
	let stop: (() => void) | undefined;
	return {
		name: "react-web-ui-tokens",
		configResolved: config => {
			command = config.command;
		},
		buildStart: async () => {
			if (command === "build") {
				await buildTokens(root);
			}
		},
		configureServer: async server => {
			const { logger } = server.config;
			stop = await watchTokens(root, {
				onBuild: written => {
					if (written.length > 0) {
						logger.info(
							`tokens built: ${written.map(path => relative(root, path)).join(", ")}`,
							{ timestamp: true },
						);
					}
				},
				onError: error => {
					logger.error(
						`tokens failed: ${error instanceof Error ? error.message : String(error)}`,
						{ timestamp: true },
					);
				},
			});
		},
		closeBundle: () => {
			stop?.();
		},
	};
};

export default tokens;
