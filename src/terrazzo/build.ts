import {
	existsSync,
	type FSWatcher,
	mkdirSync,
	readFileSync,
	watch,
	writeFileSync,
} from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadTokens } from "@terrazzo/cli";
import {
	build,
	type Config,
	defineConfig,
	Logger,
	parse,
} from "@terrazzo/parser";

type ConfigModule = Readonly<{ default: Config }>;

const CONFIG_EXTENSIONS = [
	"ts",
	"js",
	"mts",
	"mjs",
	"cts",
	"cjs",
] as const;

const REBUILD_DELAY = 50;

const moduleCache = createRequire(import.meta.url).cache;

const configIn = (root: string): string => {
	const path = CONFIG_EXTENSIONS.map(extension =>
		join(root, `terrazzo.config.${extension}`),
	).find(candidate => existsSync(candidate));
	if (path === undefined) {
		throw new Error(`No terrazzo.config found in ${root}.`);
	}
	return path;
};

const request = async (src: URL): Promise<string> => {
	if (src.protocol === "file:") {
		return readFile(src, "utf8");
	}
	const response = await fetch(src);
	if (!response.ok) {
		throw new Error(
			`${src.href} responded with ${response.status}.`,
		);
	}
	return response.text();
};

const writeIfChanged = (
	path: string,
	contents: string | Buffer,
): boolean => {
	const bytes =
		typeof contents === "string"
			? Buffer.from(contents)
			: contents;
	if (
		existsSync(path) &&
		readFileSync(path).equals(bytes)
	) {
		return false;
	}
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, bytes);
	return true;
};

/**
 * Builds the tokens of the `terrazzo.config.*` in `root` and writes the
 * output files whose contents changed. Reports every local file it
 * reads to `onRead`, the config and the files its resolver references
 * included, also when the build fails. Resolves to the files it wrote.
 *
 * @example
 *   const written = await buildTokens(process.cwd());
 */
export const buildTokens = async (
	root: string,
	onRead: (path: string) => void = () => undefined,
): Promise<readonly string[]> => {
	const directory = resolve(root);
	const configPath = configIn(directory);
	onRead(configPath);
	delete moduleCache[configPath];
	const configModule: ConfigModule = await import(
		`${pathToFileURL(configPath).href}?t=${Date.now()}`
	);
	const logger = new Logger();
	const config = defineConfig(configModule.default, {
		cwd: pathToFileURL(`${directory}/`),
		logger,
	});
	const read = (src: URL): void => {
		if (src.protocol === "file:") {
			onRead(fileURLToPath(src));
		}
	};
	config.tokens.forEach(read);
	const sources = await loadTokens(config.tokens, {
		logger,
	});
	if (sources === undefined) {
		throw new Error(`No tokens found for ${configPath}.`);
	}
	const {
		tokens,
		resolver,
		sources: parsed,
	} = await parse(sources, {
		config,
		logger,
		skipLint: !config.lint.build.enabled,
		req: async src => {
			read(src);
			return request(src);
		},
	});
	const { outputFiles } = await build(tokens, {
		resolver,
		sources: parsed,
		config,
		logger,
	});
	return outputFiles.flatMap(({ filename, contents }) => {
		const path = fileURLToPath(
			new URL(filename, config.outDir),
		);
		return writeIfChanged(path, contents) ? [path] : [];
	});
};

export type WatchTokensOptions = Readonly<{
	/** Called after each build with the files it wrote. */
	onBuild: (written: readonly string[]) => void;
	/** Called when a build fails. Watching goes on. */
	onError: (error: unknown) => void;
}>;

/**
 * Builds the tokens in `root` like `buildTokens`, then builds them again
 * whenever a file the build read changes: the config, the resolver or any
 * token file it references. Watching never keeps the process alive.
 * Resolves after the first build to a function that stops watching.
 *
 * @example
 *   const stop = await watchTokens(process.cwd(), {
 *   	onBuild: written => console.log(written),
 *   	onError: console.error,
 *   });
 */
export const watchTokens = async (
	root: string,
	{ onBuild, onError }: WatchTokensOptions,
): Promise<() => void> => {
	let inputs: ReadonlySet<string> = new Set();
	let watchers: ReadonlyMap<string, FSWatcher> = new Map();
	let timer: ReturnType<typeof setTimeout> | undefined;
	let queue: Promise<void> = Promise.resolve();
	let stopped = false;

	const schedule = (): void => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			queue = queue.then(rebuild);
		}, REBUILD_DELAY);
	};

	const watchDirectory = (directory: string): FSWatcher =>
		watch(
			directory,
			{ persistent: false },
			(_, filename) => {
				if (
					filename !== null &&
					inputs.has(join(directory, filename))
				) {
					schedule();
				}
			},
		);

	const follow = (paths: ReadonlySet<string>): void => {
		inputs = paths;
		const directories = new Set([...paths].map(dirname));
		for (const [directory, watcher] of watchers) {
			if (!directories.has(directory)) {
				watcher.close();
			}
		}
		watchers = new Map(
			[...directories].map(directory => [
				directory,
				watchers.get(directory) ??
					watchDirectory(directory),
			]),
		);
	};

	const rebuild = async (): Promise<void> => {
		const read = new Set<string>();
		try {
			const written = await buildTokens(root, path =>
				read.add(path),
			);
			if (!stopped) {
				follow(read);
				onBuild(written);
			}
		} catch (error) {
			if (!stopped) {
				follow(new Set([...inputs, ...read]));
				onError(error);
			}
		}
	};

	queue = rebuild();
	await queue;

	return () => {
		stopped = true;
		clearTimeout(timer);
		for (const watcher of watchers.values()) {
			watcher.close();
		}
	};
};
