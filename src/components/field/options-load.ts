import type { KitCopy } from "../copy-provider/index.ts";

/**
 * How far the options of a select or combobox have loaded. A failure that
 * trying again can clear carries a `retry`.
 */
export type OptionsLoad =
	| Readonly<{ status: "pending" | "success" }>
	| Readonly<{ status: "error"; retry?: () => void }>;

/**
 * What a popup says about a load that is pending or failed; nothing once the
 * options are there.
 *
 * @example
 * optionsLoadMessage({ status: "pending" }, useCopy().options); // "Loading options…"
 */
export const optionsLoadMessage = (
	load: OptionsLoad,
	copy: KitCopy["options"],
): string | undefined => {
	if (load.status === "pending") {
		return copy.loading;
	}
	if (load.status === "error") {
		return load.retry === undefined
			? copy.loadBroken
			: copy.loadFailed;
	}
	return undefined;
};

/**
 * The load of options that are all there from the start.
 *
 * @example
 * const load = source ?? itemsLoad ?? OPTIONS_LOADED;
 */
export const OPTIONS_LOADED: OptionsLoad = {
	status: "success",
};

/** The part of a query `optionsLoad` reads, such as a TanStack Query result. */
export type OptionsQuery = Readonly<{
	data: unknown;
	error: unknown;
	isFetching: boolean;
	refetch: () => Promise<unknown>;
}>;

/**
 * The options load of a query: loaded once it holds data, pending while it
 * fetches without any, failed otherwise. A failure offers a retry when
 * `retryable` says trying again can help, which by default is always.
 *
 * @example
 * <SelectField options={options} load={optionsLoad(query, isRetryable)} … />
 */
export const optionsLoad = (
	query: OptionsQuery,
	retryable: (error: unknown) => boolean = () => true,
): OptionsLoad => {
	if (query.data !== undefined) {
		return { status: "success" };
	}
	if (query.isFetching || query.error === null) {
		return { status: "pending" };
	}
	return retryable(query.error)
		? {
				status: "error",
				retry: () => {
					void query.refetch();
				},
			}
		: { status: "error" };
};
