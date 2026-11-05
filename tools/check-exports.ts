/**
 * Checks the built package against its manifest, and proves in a consumer app
 * that importing one component yields only that component's CSS. Run it after
 * `bun run build`. It fails when:
 *
 * - an entry of `exports` does not list `types` first
 * - a component folder has no `./<name>` export, or an export points at a
 *   file the build did not emit
 * - the root barrel imports an optional peer, directly or through its modules
 * - the package would ship anything under `docs/` or `.storybook/`, a story,
 *   or an MDX page
 * - an emitted stylesheet does not open with the cascade layer order
 * - the consumer fixture (`tools/fixtures/consumer/`) fails to typecheck or
 *   build against the packed kit, its CSS for one component carries
 *   another's, or a package it should load lazily, such as a zxcvbn language,
 *   lacks a chunk of its own or loads up front
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
import { dirname, join } from "node:path";

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
): Readonly<{ ok: boolean; output: string }> => {
	const result = Bun.spawnSync([...command], {
		cwd: root,
		stdout: "pipe",
		stderr: "pipe",
	});
	return {
		ok: result.exitCode === 0,
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
}>[] = dryRun.ok ? JSON.parse(dryRun.output) : [];
const packedFiles = packed.flatMap(({ files }) =>
	files.map(({ path }) => path),
);

const unshippable = [
	...(dryRun.ok ? [] : [`npm pack: ${dryRun.output}`]),
	...packedFiles.flatMap(path =>
		/^(docs|\.storybook)\/|\.stories\.|\.mdx$/.test(path)
			? [`the package would ship ${path}`]
			: [],
	),
];

const unlayered = packedFiles
	.filter(path => path.endsWith(".css"))
	.flatMap(path =>
		readFileSync(join(root, path), "utf8").startsWith(
			LAYER_ORDER,
		)
			? []
			: [`${path} does not open with "${LAYER_ORDER}"`],
	);

/** The class names a component's own emitted stylesheet defines. */
const classesOf = (
	component: string,
): readonly string[] => [
	...new Set(
		readFileSync(
			join(
				dist,
				"components",
				component,
				`${component}.css`,
			),
			"utf8",
		).match(/\._[\w-]+/g) ?? [],
	),
];

/**
 * Each fixture entry (`src/<entry>.tsx`), the component stylesheets its build
 * must and must not contain, and the packages that must each arrive in a chunk
 * of their own, loaded only through a dynamic import.
 */
const fixtureEntries: readonly Readonly<{
	entry: string;
	includes: readonly string[];
	excludes: readonly string[];
	lazy?: readonly string[];
}>[] = [
	{
		entry: "button",
		includes: ["button", "icon"],
		excludes: ["spinner", "skeleton", "link"],
	},
	{
		entry: "spinner",
		includes: ["spinner"],
		excludes: ["button", "icon", "skeleton", "link"],
	},
	{
		entry: "password-strength",
		includes: ["password-field"],
		excludes: ["button", "spinner", "text-field"],
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
	src?: string;
	isEntry?: boolean;
	isDynamicEntry?: boolean;
	imports?: readonly string[];
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
	}>[] = JSON.parse(pack.output);
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
			({ entry, includes, excludes, lazy = [] }) => {
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
				const css = fixtureCss(entry);
				const missing = includes.flatMap(component =>
					classesOf(component).every(name =>
						css.includes(name),
					)
						? []
						: [
								`importing ${entry} left out ${component}'s CSS`,
							],
				);
				const extra = excludes.flatMap(component =>
					classesOf(component).some(name =>
						css.includes(name),
					)
						? [
								`importing ${entry} pulled in ${component}'s CSS`,
							]
						: [],
				);
				return missing.concat(
					extra,
					eagerPackages(entry, lazy),
				);
			},
		),
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
		problems: rootPeers,
		passed: "imports no optional peer.",
	},
	{
		title: "packed files",
		problems: [...unshippable, ...unlayered],
		passed:
			"no docs, Storybook, stories or MDX, and every stylesheet opens with the layer order.",
	},
	{
		title: "consumer fixture",
		problems: checkConsumer(),
		passed:
			"typechecks and builds against the packed kit, each component brings only its own CSS, and each lazy package has a chunk of its own, loaded on demand.",
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
