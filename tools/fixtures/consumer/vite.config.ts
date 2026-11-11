import {
	defineConfig,
	type Plugin,
	type UserConfigFnObject,
} from "vite";

const VIRTUAL = "kit-entry:";

/** The kit's subpaths the check passes in `KIT_SUBPATHS`, comma-separated, such as `button,text-field`. */
const subpaths: readonly string[] = (
	process.env.KIT_SUBPATHS ?? ""
)
	.split(",")
	.filter(subpath => subpath !== "");

/** The specifier an app imports a subpath of the kit by. */
const specifier = (subpath: string): string =>
	`@igne-agency/react-web-ui/${subpath}`;

/** An app module per kit subpath, `kit-entry:<subpath>`, that imports everything the subpath exports. */
const subpathEntries = (): Plugin => ({
	name: "kit-subpath-entries",
	resolveId: id =>
		id.startsWith(VIRTUAL) ? `\0${id}` : undefined,
	load: id =>
		id.startsWith(`\0${VIRTUAL}`)
			? `import * as entry from "${specifier(id.slice(VIRTUAL.length + 1))}";\nconsole.log(entry);\n`
			: undefined,
});

/** A dev-only plugin that fails while `KIT_FORBID_VITE_CONFIG` is set, so the check can prove the token command never loads this config. */
const forbidViteConfig = (): Plugin => ({
	name: "kit-forbid-vite-config",
	apply: "serve",
	config: () => {
		if (process.env.KIT_FORBID_VITE_CONFIG !== undefined) {
			throw new Error(
				"The token command loaded the app's Vite config.",
			);
		}
	},
});

/**
 * Builds one entry of the fixture app per mode: `vite build --mode button`.
 * Mode `subpaths` builds one app entry per subpath in `KIT_SUBPATHS`, and
 * `vite optimize --mode subpaths` pre-bundles those subpaths as the dev server
 * would.
 */
const config: UserConfigFnObject = defineConfig(
	({ mode }) => ({
		root: import.meta.dirname,
		logLevel: "warn",
		plugins: [subpathEntries(), forbidViteConfig()],
		optimizeDeps: {
			noDiscovery: true,
			include: subpaths.map(specifier),
		},
		build: {
			outDir: `dist/${mode}`,
			emptyOutDir: true,
			minify: false,
			manifest: true,
			rolldownOptions: {
				input:
					mode === "subpaths"
						? Object.fromEntries(
								subpaths.map(subpath => [
									subpath,
									`${VIRTUAL}${subpath}`,
								]),
							)
						: `${import.meta.dirname}/src/${mode}.tsx`,
			},
		},
	}),
);

export default config;
