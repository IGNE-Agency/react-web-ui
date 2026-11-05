import {
	defineConfig,
	type UserConfigFnObject,
} from "vite";

/** Builds one entry of the fixture app per mode: `vite build --mode button`. */
const config: UserConfigFnObject = defineConfig(
	({ mode }) => ({
		root: import.meta.dirname,
		logLevel: "warn",
		build: {
			outDir: `dist/${mode}`,
			emptyOutDir: true,
			minify: false,
			manifest: true,
			rolldownOptions: {
				input: `${import.meta.dirname}/src/${mode}.tsx`,
			},
		},
	}),
);

export default config;
