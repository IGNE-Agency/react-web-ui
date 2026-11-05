import {
	existsSync,
	readdirSync,
	readFileSync,
} from "node:fs";
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { compile } from "sass-embedded";
import {
	defineConfig,
	type Plugin,
	type UserConfig,
} from "vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import manifest from "./package.json" with { type: "json" };

const root = import.meta.dirname;
const src = join(root, "src");

const componentEntries = readdirSync(
	join(src, "components"),
	{ withFileTypes: true },
)
	.filter(
		entry =>
			entry.isDirectory() &&
			existsSync(
				join(src, "components", entry.name, "index.ts"),
			),
	)
	.map(entry =>
		join(src, "components", entry.name, "index.ts"),
	);

const libEntries = [
	"lib/forms/index.ts",
	"lib/hooks/index.ts",
	"lib/storage.ts",
	"lib/table-storage.ts",
	"lib/tone.ts",
	"lib/unsaved-changes/index.ts",
].map(path => join(src, path));

const optionalPeerEntries = [
	"components/combobox-field/react-query.tsx",
	"components/composer/index.ts",
	"data-table/index.ts",
	"data-view/index.ts",
	"lib/unsaved-changes/tanstack-router.ts",
]
	.map(path => join(src, path))
	.filter(path => existsSync(path));

const externalPackages = [
	...Object.keys(manifest.dependencies),
	...Object.keys(manifest.peerDependencies),
];

/** Whether an import resolves to a package the app installs, rather than one bundled into the kit. */
const isExternal = (id: string): boolean =>
	externalPackages.some(
		name => id === name || id.startsWith(`${name}/`),
	);

/** Emits `base.css` from `src/style/base.scss` and the default theme as `tokens.css`. */
const stylesheets = (): Plugin => ({
	name: "kit-stylesheets",
	apply: "build",
	generateBundle() {
		this.emitFile({
			type: "asset",
			fileName: "base.css",
			source: compile(join(src, "style", "base.scss"), {
				loadPaths: [join(root, "node_modules")],
			}).css,
		});
		this.emitFile({
			type: "asset",
			fileName: "tokens.css",
			source: readFileSync(
				join(src, "style", "tokens.gen.css"),
				"utf8",
			),
		});
	},
});

/** Names an emitted module after its source file, without the stylesheet extension. */
const entryFileName = ({
	name,
}: Readonly<{ name: string }>): string =>
	`${name.replace(/\.s?css$/, "")}.js`;

/** Names an emitted asset after its source, with `.module.css` emitted as plain `.css`. */
const assetFileName = ({
	names,
}: Readonly<{ names: readonly string[] }>): string => {
	const name = names[0];
	return name?.endsWith(".module.css")
		? name.replace(/\.module\.css$/, ".css")
		: "[name][extname]";
};

const config: UserConfig = defineConfig({
	plugins: [
		react({ compiler: true }),
		libInjectCss(),
		stylesheets(),
	],
	css: {
		modules: {
			localsConvention: "camelCase",
		},
	},
	build: {
		lib: {
			entry: [
				join(src, "index.ts"),
				...componentEntries.filter(
					entry => !optionalPeerEntries.includes(entry),
				),
				...libEntries,
				...optionalPeerEntries,
			],
			formats: ["es"],
		},
		cssCodeSplit: true,
		minify: false,
		copyPublicDir: false,
		rolldownOptions: {
			external: isExternal,
			output: {
				preserveModules: true,
				preserveModulesRoot: "src",
				entryFileNames: entryFileName,
				assetFileNames: assetFileName,
			},
		},
	},
});

export default config;
