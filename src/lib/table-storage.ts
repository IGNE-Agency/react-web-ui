import type { StandardSchemaV1 } from "@tanstack/react-form";
import type { StorageAdapter } from "./storage.ts";

/** One persisted value, checked by its validator on every read and write. */
export type StoredValue<T> = Readonly<{
	/**
	 * The stored value, or the fallback when nothing is stored or the stored
	 * value no longer passes the validator.
	 */
	read: () => T;
	/** Stores `value`. Throws, storing nothing, when it fails the validator. */
	write: (value: T) => void;
	/** Forgets the stored value, so the next read returns the fallback. */
	clear: () => void;
	/** Calls `listener` whenever the value may have changed. Returns the unsubscribe. */
	subscribe: (listener: () => void) => () => void;
}>;

/** What a stored value is checked against, and what it reads as when nothing valid is stored. */
export type StoredValueShape<T> = Readonly<{
	/** A synchronous Standard Schema validator; an asynchronous result counts as a failure. */
	schema: StandardSchemaV1<unknown, T>;
	fallback: T;
}>;

type Checked<T> =
	| Readonly<{ ok: true; value: T }>
	| Readonly<{ ok: false; reason: string }>;

const check = <T>(
	schema: StandardSchemaV1<unknown, T>,
	value: unknown,
): Checked<T> => {
	const result = schema["~standard"].validate(value);
	if (result instanceof Promise) {
		return {
			ok: false,
			reason: "the validator is asynchronous",
		};
	}
	return result.issues === undefined
		? { ok: true, value: result.value }
		: {
				ok: false,
				reason: result.issues
					.map(issue => issue.message)
					.join("; "),
			};
};

/**
 * A value one table instance remembers across reloads, stored in `storage`
 * under its `tableId` and `name`.
 *
 * @example
 * const filters = tableStoredValue(
 * 	"declarations",
 * 	"filters",
 * 	{ schema: z.object({ status: z.array(z.string()) }), fallback: { status: [] } },
 * 	localStorageAdapter,
 * );
 */
export const tableStoredValue = <T>(
	tableId: string,
	name: string,
	{ schema, fallback }: StoredValueShape<T>,
	storage: StorageAdapter,
): StoredValue<T> => {
	const key = `table:${tableId}:${name}`;
	return {
		read: () => {
			const stored = check(schema, storage.read(key));
			return stored.ok ? stored.value : fallback;
		},
		write: value => {
			const checked = check(schema, value);
			if (!checked.ok) {
				throw new Error(
					`Refusing to store ${key}: ${checked.reason}`,
				);
			}
			storage.write(key, checked.value);
		},
		clear: () => {
			storage.remove(key);
		},
		subscribe: listener => storage.subscribe(key, listener),
	};
};

const pageSizeSchema = (
	options: readonly number[],
): StandardSchemaV1<unknown, number> => ({
	"~standard": {
		version: 1,
		vendor: "react-web-ui",
		validate: value =>
			typeof value === "number" && options.includes(value)
				? { value }
				: {
						issues: [
							{
								message: `expected one of ${options.join(", ")}`,
							},
						],
					},
	},
});

/**
 * The page size a table remembers: one of its `options`, or `fallback` when
 * none is stored.
 *
 * @example
 * storedPageSize("nza-rates", [10, 25, 50, 100], 10, localStorageAdapter).read(); // 50, or 10
 */
export const storedPageSize = (
	tableId: string,
	options: readonly number[],
	fallback: number,
	storage: StorageAdapter,
): StoredValue<number> =>
	tableStoredValue(
		tableId,
		"page-size",
		{ schema: pageSizeSchema(options), fallback },
		storage,
	);
