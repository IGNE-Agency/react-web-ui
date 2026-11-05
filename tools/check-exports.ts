/**
 * Checks the built package against its manifest, and proves in a consumer app
 * that importing one component yields only that component's CSS. Run it after
 * `bun run build`. It fails when:
 *
 * - an entry of `exports` does not list `types` first
 * - a component folder has no `./<name>` export, or an export points at a
 *   file the build did not emit
 * - the root barrel imports an optional peer, directly or through its modules,
 *   or re-exports a module that has no subpath of its own
 * - the package would ship anything under `docs/` or `.storybook/`, a story,
 *   an MDX page, an SVG or a `vendor/` folder
 * - an emitted stylesheet does not open with the cascade layer order, or has
 *   a rule outside the kit's layers
 * - a packed file or source map points at a file the package leaves out
 * - the consumer fixture (`tools/fixtures/consumer/`) fails to typecheck or
 *   build against the packed kit, one of its entries brings other kit
 *   stylesheets than the ones it lists, or a package it should load lazily,
 *   such as a zxcvbn language, lacks a chunk of its own or loads up front
 * - importing a subpath brings other kit stylesheets than the ones
 *   `tools/fixtures/consumer/stylesheets.json` lists for it, in a build or in
 *   the dev server's pre-bundle
 *
 * @example
 *   bun tools/check-exports.ts
 */
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { dirname, join, posix } from "node:path";

type Exports = Readonly<Record<string, unknown>>;

type Manifest = Readonly<{
	name: string;
	exports?: Exports;
	peerDependenciesMeta?: Readonly<
		Record<string, Readonly<{ optional?: boolean }>>
	>;
}>;

type PackedFile = Readonly<{ path: string }>;

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist");
const fixture = join(
	import.meta.dirname,
	"fixtures",
	"consumer",
);

const LAYER_ORDER =
	"@layer kit.reset, kit.base, kit.components;";

const manifest: Manifest = await Bun.file(
	join(root, "package.json"),
).json();

const exportsMap = manifest.exports ?? {};

/** Runs a command from the repository root and returns its output, or the failure as a problem. */
const run = (
	command: readonly string[],
	env: Readonly<Record<string, string>> = {},
): Readonly<{
	ok: boolean;
	stdout: string;
	output: string;
}> => {
	const result = Bun.spawnSync([...command], {
		cwd: root,
		stdout: "pipe",
		stderr: "pipe",
		env: { ...process.env, ...env },
	});
	return {
		ok: result.exitCode === 0,
		stdout: result.stdout.toString(),
		output: `${result.stdout.toString()}${result.stderr.toString()}`,
	};
};

/** Every conditions object in the map with the path that leads to it, nested ones included. */
const conditionsOf = (
	path: string,
	entry: unknown,
): readonly Readonly<{
	path: string;
	keys: readonly string[];
}>[] =>
	typeof entry === "object" &&
	entry !== null &&
	!Array.isArray(entry)
		? [
				{ path, keys: Object.keys(entry) },
				...Object.entries(entry).flatMap(([key, value]) =>
					conditionsOf(`${path} > ${key}`, value),
				),
			]
		: [];

/** Every file path an export points at, wildcard patterns left out. */
const targetsOf = (entry: unknown): readonly string[] =>
	typeof entry === "string"
		? entry.includes("*")
			? []
			: [entry]
		: typeof entry === "object" && entry !== null
			? Object.values(entry).flatMap(targetsOf)
			: [];

const typesFirst = Object.entries(exportsMap).flatMap(
	([subpath, entry]) =>
		conditionsOf(subpath, entry).flatMap(({ path, keys }) =>
			keys[0] === "types"
				? []
				: [
						`${path}: "types" must be the first condition (found ${keys.length === 0 ? "none" : keys.map(key => `"${key}"`).join(", ")})`,
					],
		),
);

const componentFolders = readdirSync(
	join(root, "src", "components"),
	{ withFileTypes: true },
)
	.filter(
		entry =>
			entry.isDirectory() &&
			existsSync(
				join(
					root,
					"src",
					"components",
					entry.name,
					"index.ts",
				),
			),
	)
	.map(entry => entry.name);

const componentExports = componentFolders.flatMap(name => {
	const entry = exportsMap[`./${name}`];
	const expected = {
		types: `./dist/components/${name}/index.d.ts`,
		default: `./dist/components/${name}/index.js`,
	};
	return Bun.deepEquals(entry, expected)
		? []
		: [
				`./${name}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(entry)}`,
			];
});

const missingTargets = Object.entries(exportsMap).flatMap(
	([subpath, entry]) =>
		targetsOf(entry).flatMap(target =>
			existsSync(join(root, target))
				? []
				: [
						`${subpath}: ${target} does not exist; run \`bun run build\` first`,
					],
		),
);

const allTargets =
	Object.values(exportsMap).flatMap(targetsOf);

const rootOnly = [
	...readFileSync(
		join(root, "src", "index.ts"),
		"utf8",
	).matchAll(/^export \* from "\.\/(.+)\.tsx?";$/gm),
].flatMap(([, module]) =>
	allTargets.includes(`./dist/${module}.js`)
		? []
		: [
				`the root re-exports src/${module}, which has no subpath of its own`,
			],
);

const optionalPeers = Object.entries(
	manifest.peerDependenciesMeta ?? {},
).flatMap(([name, meta]) => (meta.optional ? [name] : []));

const transpiler = new Bun.Transpiler({ loader: "js" });

/** Every package the module imports, followed through its relative imports. */
const packagesImportedBy = (
	file: string,
	seen: ReadonlySet<string> = new Set(),
): readonly string[] => {
	if (seen.has(file) || !existsSync(file)) {
		return [];
	}
	const visited = new Set([...seen, file]);
	return transpiler
		.scanImports(readFileSync(file, "utf8"))
		.flatMap(({ path }) =>
			path.startsWith(".")
				? path.endsWith(".js")
					? packagesImportedBy(
							join(dirname(file), path),
							visited,
						)
					: []
				: [path],
		);
};

const rootPeers = [
	...new Set(packagesImportedBy(join(dist, "index.js"))),
].flatMap(specifier =>
	optionalPeers.some(
		peer =>
			specifier === peer ||
			specifier.startsWith(`${peer}/`),
	)
		? [
				`the root barrel imports the optional peer ${specifier}`,
			]
		: [],
);

const dryRun = run([
	"npm",
	"pack",
	"--dry-run",
	"--json",
	"--ignore-scripts",
]);
const packed: readonly Readonly<{
	files: readonly PackedFile[];
}>[] = dryRun.ok ? JSON.parse(dryRun.stdout) : [];
const packedFiles = packed.flatMap(({ files }) =>
	files.map(({ path }) => path),
);

const unshippable = [
	...(dryRun.ok ? [] : [`npm pack: ${dryRun.output}`]),
	...packedFiles.flatMap(path =>
		/^(docs|\.storybook)\/|\.stories\.|\.mdx$|\.svg(\.|$)|(^|\/)vendor\//.test(
			path,
		)
			? [`the package would ship ${path}`]
			: [],
	),
];

/**
 * The preludes of a stylesheet's top-level statements and blocks, comments
 * left out.
 *
 * @example
 *   topLevelPreludes("@layer a, b; @layer a { p { color: red } } p {}");
 *   // ["@layer a, b", "@layer a", "p"]
 */
const topLevelPreludes = (
	css: string,
): readonly string[] => {
	const collapse = (text: string): string => {
		const next = text.replace(/\{[^{}]*\}/g, "\0");
		return next === text ? text : collapse(next);
	};
	return collapse(
		css
			.replace(/\/\*[\s\S]*?\*\//g, "")
			.replace(
				/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g,
				'""',
			),
	)
		.split(/[\0;]/)
		.map(prelude => prelude.trim())
		.filter(prelude => prelude !== "");
};

const unlayered = packedFiles
	.filter(path => path.endsWith(".css"))
	.flatMap(path => {
		const css = readFileSync(join(root, path), "utf8");
		const outside = topLevelPreludes(css).filter(
			prelude => !/^@layer\s+kit\./.test(prelude),
		);
		const opening = css.startsWith(LAYER_ORDER)
			? []
			: [`${path} does not open with "${LAYER_ORDER}"`];
		return opening.concat(
			outside.map(
				prelude =>
					`${path} has a rule outside the kit's layers: ${prelude}`,
			),
		);
	});

/** Where a packed file's source map or a source map's source points, resolved from the packed file. */
const mapTargets = (path: string): readonly string[] => {
	const contents = readFileSync(join(root, path), "utf8");
	const base = posix.dirname(path);
	if (path.endsWith(".map")) {
		const map: Readonly<{
			sourceRoot?: string;
			sources?: readonly string[];
		}> = JSON.parse(contents);
		return (map.sources ?? []).map(source =>
			posix.join(base, map.sourceRoot ?? "", source),
		);
	}
	return [
		...contents.matchAll(/[#@] sourceMappingURL=(\S+)/g),
	].flatMap(([, url]) =>
		url === undefined || url.startsWith("data:")
			? []
			: [posix.join(base, url)],
	);
};

const packedSet = new Set(packedFiles);

const danglingMaps = packedFiles
	.filter(path => /\.(map|js|css|d\.ts)$/.test(path))
	.flatMap(path =>
		mapTargets(path).flatMap(target =>
			packedSet.has(target)
				? []
				: [
						`${path} points at ${target}, which is not packed`,
					],
		),
	);

/** A packed stylesheet's name: its path under `dist/` without the extension, components without their folder prefix (`button/button`, `lib/calendar/temporal`). */
const sheetName = (path: string): string =>
	path
		.replace(/^(\.\/)?dist\//, "")
		.replace(/^components\//, "")
		.replace(/\.css$/, "");

/** Every component stylesheet the package ships, with the class names it defines. */
const sheetClasses: ReadonlyMap<string, readonly string[]> =
	new Map(
		packedFiles
			.filter(
				path =>
					path.endsWith(".css") &&
					!["dist/base.css", "dist/tokens.css"].includes(
						path,
					),
			)
			.map(path => [
				sheetName(path),
				[
					...new Set(
						readFileSync(join(root, path), "utf8").match(
							/\._[\w-]+/g,
						) ?? [],
					),
				],
			]),
	);

/** The kit stylesheets whose classes a build's CSS contains, sorted. */
const sheetsIn = (css: string): readonly string[] =>
	[...sheetClasses]
		.flatMap(([sheet, classes]) =>
			classes.some(name => css.includes(name))
				? [sheet]
				: [],
		)
		.sort();

/** What differs between the stylesheets an import should bring and the ones it brought. */
const sheetProblems = (
	what: string,
	expected: readonly string[],
	actual: readonly string[],
): readonly string[] => [
	...expected.flatMap(sheet =>
		actual.includes(sheet)
			? []
			: [`${what} left out ${sheet}`],
	),
	...actual.flatMap(sheet =>
		expected.includes(sheet)
			? []
			: [`${what} pulled in ${sheet}`],
	),
];

/**
 * Each fixture entry (`src/<entry>.tsx`), exactly the kit stylesheets its
 * build contains, and the packages that must each arrive in a chunk of their
 * own, loaded only through a dynamic import.
 */
const fixtureEntries: readonly Readonly<{
	entry: string;
	sheets: readonly string[];
	lazy?: readonly string[];
}>[] = [
	{
		entry: "button",
		sheets: [
			"button/button",
			"tooltip/tooltip",
		],
	},
	{
		entry: "spinner",
		sheets: ["spinner/spinner"],
	},
	{
		entry: "root",
		sheets: [
			"button/button",
			"tooltip/tooltip",
		],
	},
	{
		entry: "forms",
		sheets: [
			"button/button",
			"error-text/error-text",
			"field/field",
			"spinner/spinner",
			"text-field/text-field",
			"tooltip/tooltip",
		],
	},
	{
		entry: "password-strength",
		sheets: ["password-field/password-field"],
		lazy: [
			"@zxcvbn-ts/core",
			"@zxcvbn-ts/language-common",
			"@zxcvbn-ts/language-en",
			"@zxcvbn-ts/language-nl-be",
		],
	},
];

type ManifestChunk = Readonly<{
	file: string;
	name?: string;
	src?: string;
	isEntry?: boolean;
	isDynamicEntry?: boolean;
	imports?: readonly string[];
	dynamicImports?: readonly string[];
	css?: readonly string[];
}>;

/** The chunks a fixture build emitted, by Vite's manifest key. */
const fixtureManifest = (
	entry: string,
): Readonly<Record<string, ManifestChunk>> => {
	const path = join(
		fixture,
		"dist",
		entry,
		".vite",
		"manifest.json",
	);
	return existsSync(path)
		? JSON.parse(readFileSync(path, "utf8"))
		: {};
};

/** The files a fixture entry loads up front: its own and every one it imports statically. */
const staticFiles = (
	chunks: Readonly<Record<string, ManifestChunk>>,
): ReadonlySet<string> => {
	const reach = (
		keys: readonly string[],
		seen: ReadonlySet<string>,
	): ReadonlySet<string> => {
		const next = keys.filter(key => !seen.has(key));
		return next.length === 0
			? seen
			: reach(
					next.flatMap(key => chunks[key]?.imports ?? []),
					new Set([...seen, ...next]),
				);
	};
	const entries = Object.entries(chunks).flatMap(
		([key, chunk]) => (chunk.isEntry === true ? [key] : []),
	);
	return new Set(
		[...reach(entries, new Set())].flatMap(key => {
			const file = chunks[key]?.file;
			return file === undefined ? [] : [file];
		}),
	);
};

/** Each lazy package of a fixture entry that is missing its own chunk, shares one, or loads up front. */
const eagerPackages = (
	entry: string,
	lazy: readonly string[],
): readonly string[] => {
	const chunks = fixtureManifest(entry);
	const upFront = staticFiles(chunks);
	const filesOf = (pkg: string): readonly string[] =>
		Object.entries(chunks).flatMap(([key, chunk]) =>
			chunk.isDynamicEntry === true &&
			(chunk.src ?? key).includes(`node_modules/${pkg}/`)
				? [chunk.file]
				: [],
		);
	return lazy.flatMap(pkg => {
		const files = filesOf(pkg);
		const shared = lazy.filter(
			other =>
				other !== pkg &&
				filesOf(other).some(file => files.includes(file)),
		);
		return [
			...(files.length === 0
				? [
						`importing ${entry} left ${pkg} without a chunk of its own`,
					]
				: []),
			...files.flatMap(file =>
				upFront.has(file)
					? [`importing ${entry} loads ${pkg} up front`]
					: [],
			),
			...shared.map(
				other =>
					`importing ${entry} put ${pkg} in one chunk with ${other}`,
			),
		];
	});
};

/** The CSS a fixture build emitted, all files together. */
const fixtureCss = (entry: string): string => {
	const assets = join(fixture, "dist", entry, "assets");
	return existsSync(assets)
		? readdirSync(assets)
				.filter(file => file.endsWith(".css"))
				.map(file =>
					readFileSync(join(assets, file), "utf8"),
				)
				.join("\n")
		: "";
};

/** Every subpath an app imports a module by, such as `button`, without the token preset, which runs in Node. */
const moduleSubpaths: readonly string[] = Object.entries(
	exportsMap,
).flatMap(([subpath, entry]) =>
	subpath !== "." &&
	targetsOf(entry).some(
		target =>
			target.endsWith(".js") &&
			!target.startsWith("./dist/terrazzo/"),
	)
		? [subpath.slice(2)]
		: [],
);

/** Every file the keys reach through the edges `next` gives, the keys included. */
const closure = (
	keys: readonly string[],
	next: (key: string) => readonly string[],
	seen: ReadonlySet<string> = new Set(),
): ReadonlySet<string> => {
	const fresh = keys.filter(key => !seen.has(key));
	return fresh.length === 0
		? seen
		: closure(
				fresh.flatMap(next),
				next,
				new Set([...seen, ...fresh]),
			);
};

/** The CSS a fixture build loads for one entry chunk, up front or on demand, all files together. */
const entryCss = (
	build: string,
	chunks: Readonly<Record<string, ManifestChunk>>,
	key: string,
): string =>
	[
		...closure([key], chunk => [
			...(chunks[chunk]?.imports ?? []),
			...(chunks[chunk]?.dynamicImports ?? []),
		]),
	]
		.flatMap(chunk => chunks[chunk]?.css ?? [])
		.map(file =>
			readFileSync(
				join(fixture, "dist", build, file),
				"utf8",
			),
		)
		.join("\n");

/** The kit stylesheets a dev server's pre-bundled module loads, up front or on demand. */
const prebundledSheets = (
	deps: string,
	file: string,
): readonly string[] => {
	const imports = (name: string): readonly string[] =>
		existsSync(join(deps, name))
			? transpiler
					.scanImports(
						readFileSync(join(deps, name), "utf8"),
					)
					.map(({ path }) => path)
			: [];
	const files = closure([file], name =>
		imports(name).flatMap(path =>
			path.startsWith("./") && path.endsWith(".js")
				? [path.slice(2)]
				: [],
		),
	);
	return [
		...new Set(
			[...files].flatMap(name =>
				imports(name).flatMap(path => {
					const sheet = path.split(`/${manifest.name}/`)[1];
					return sheet?.endsWith(".css") === true &&
						sheetClasses.has(sheetName(sheet))
						? [sheetName(sheet)]
						: [];
				}),
			),
		),
	].sort();
};

/**
 * Builds an app entry per subpath that imports everything the subpath exports,
 * and pre-bundles the same subpaths as Vite's dev server does. Each must bring
 * exactly the stylesheets `tools/fixtures/consumer/stylesheets.json` lists for
 * it, and the dev server the same ones as the build.
 */
const checkSubpaths = (): readonly string[] => {
	const env = { KIT_SUBPATHS: moduleSubpaths.join(",") };
	const config = join(fixture, "vite.config.ts");
	const build = run(
		[
			"bun",
			"x",
			"vite",
			"build",
			"--config",
			config,
			"--mode",
			"subpaths",
		],
		env,
	);
	if (!build.ok) {
		return [
			`fixture build of every subpath:\n${build.output}`,
		];
	}
	const prebundle = run(
		[
			"bun",
			"x",
			"vite",
			"optimize",
			"--force",
			"--config",
			config,
			"--mode",
			"subpaths",
		],
		env,
	);
	if (!prebundle.ok) {
		return [
			`fixture pre-bundle of every subpath:\n${prebundle.output}`,
		];
	}
	const stylesheets = join(fixture, "stylesheets.json");
	const expected: Readonly<
		Record<string, readonly string[]>
	> = existsSync(stylesheets)
		? JSON.parse(readFileSync(stylesheets, "utf8"))
		: {};
	const chunks = fixtureManifest("subpaths");
	const deps = join(
		fixture,
		"node_modules",
		".vite",
		"deps",
	);
	const metadata: Readonly<{
		optimized?: Readonly<
			Record<string, Readonly<{ file: string }>>
		>;
	}> = JSON.parse(
		readFileSync(join(deps, "_metadata.json"), "utf8"),
	);

	return [
		...Object.keys(expected).flatMap(subpath =>
			moduleSubpaths.includes(subpath)
				? []
				: [
						`stylesheets.json lists ${subpath}, which the package does not export`,
					],
		),
		...moduleSubpaths.flatMap(subpath => {
			const key = Object.entries(chunks).find(
				([, chunk]) =>
					chunk.isEntry === true && chunk.name === subpath,
			)?.[0];
			if (key === undefined) {
				return [
					`the fixture built no entry for ./${subpath}`,
				];
			}
			const built = sheetsIn(
				entryCss("subpaths", chunks, key),
			);
			const file =
				metadata.optimized?.[`${manifest.name}/${subpath}`]
					?.file;
			const sheets = expected[subpath];
			const inBuild =
				sheets === undefined
					? [
							`importing ./${subpath} brings ${built.length === 0 ? "no stylesheet" : built.join(", ")}; list exactly the ones it should under "${subpath}" in stylesheets.json`,
						]
					: sheetProblems(
							`importing ./${subpath}`,
							sheets,
							built,
						);
			const inDev =
				file === undefined
					? [`the dev server pre-bundled no ./${subpath}`]
					: sheetProblems(
							`in the dev server, importing ./${subpath}`,
							built,
							prebundledSheets(deps, file),
						);
			return inBuild.concat(inDev);
		}),
	];
};

/** Packs the kit into the fixture's `node_modules`, then typechecks and builds every fixture entry. */
const checkConsumer = (): readonly string[] => {
	const installed = join(
		fixture,
		"node_modules",
		...manifest.name.split("/"),
	);
	const unpacked = join(fixture, "package");
	rmSync(installed, { recursive: true, force: true });
	rmSync(unpacked, { recursive: true, force: true });

	const pack = run([
		"npm",
		"pack",
		"--json",
		"--ignore-scripts",
		"--pack-destination",
		fixture,
	]);
	if (!pack.ok) {
		return [`npm pack: ${pack.output}`];
	}
	const tarballs: readonly Readonly<{
		filename: string;
	}>[] = JSON.parse(pack.stdout);
	const tarball = tarballs[0]?.filename;
	if (tarball === undefined) {
		return ["npm pack: no tarball"];
	}
	const extract = Bun.spawnSync(["tar", "-xzf", tarball], {
		cwd: fixture,
		stdout: "pipe",
		stderr: "pipe",
	});
	rmSync(join(fixture, tarball), { force: true });
	if (extract.exitCode !== 0) {
		return [`tar: ${extract.stderr.toString()}`];
	}
	mkdirSync(dirname(installed), { recursive: true });
	cpSync(unpacked, installed, { recursive: true });
	rmSync(unpacked, { recursive: true, force: true });

	const typecheck = run([
		"bun",
		"x",
		"tsc",
		"-p",
		join(fixture, "tsconfig.json"),
	]);

	return [
		...(typecheck.ok
			? []
			: [`fixture typecheck:\n${typecheck.output}`]),
		...fixtureEntries.flatMap(
			({ entry, sheets, lazy = [] }) => {
				const build = run([
					"bun",
					"x",
					"vite",
					"build",
					"--config",
					join(fixture, "vite.config.ts"),
					"--mode",
					entry,
				]);
				if (!build.ok) {
					return [
						`fixture build of ${entry}:\n${build.output}`,
					];
				}
				return sheetProblems(
					`importing ${entry}`,
					sheets,
					sheetsIn(fixtureCss(entry)),
				).concat(eagerPackages(entry, lazy));
			},
		),
		...checkSubpaths(),
	];
};

const sections: readonly Readonly<{
	title: string;
	problems: readonly string[];
	passed: string;
}>[] = [
	{
		title: "package.json exports",
		problems: [
			...typesFirst,
			...componentExports,
			...missingTargets,
		],
		passed:
			'"types" comes first in every entry, every component folder has its export, and every target exists.',
	},
	{
		title: "root barrel",
		problems: [...rootPeers, ...rootOnly],
		passed:
			"imports no optional peer, and everything it re-exports has a subpath of its own.",
	},
	{
		title: "packed files",
		problems: [
			...unshippable,
			...unlayered,
			...danglingMaps,
		],
		passed:
			"no docs, Storybook, stories, MDX, SVGs or vendor folder, every stylesheet opens with the layer order and keeps its rules in the kit's layers, and no source map points at a file the package leaves out.",
	},
	{
		title: "consumer fixture",
		problems: checkConsumer(),
		passed:
			"typechecks and builds against the packed kit, every subpath brings only the stylesheets it lists, in a build and in the dev server, and each lazy package has a chunk of its own, loaded on demand.",
	},
];

const failed = sections.filter(
	({ problems }) => problems.length > 0,
);

for (const { title, problems, passed } of sections) {
	if (problems.length > 0) {
		console.error(
			`${title}:\n${problems.map(problem => `  ${problem}`).join("\n")}`,
		);
	} else {
		console.log(`${title}: ${passed}`);
	}
}

if (failed.length > 0) {
	process.exit(1);
}
