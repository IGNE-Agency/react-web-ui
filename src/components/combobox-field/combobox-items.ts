import type {
	DefaultError,
	QueryKey,
	UseQueryOptions,
} from "@tanstack/react-query";
import {
	OPTIONS_LOADED,
	type OptionsLoad,
	optionsLoad,
} from "../field/index.ts";

type Page<TItem> = Readonly<{
	items?: readonly TItem[] | null;
	totalCount?: number;
}>;

/**
 * A query searched and paged on the server. A `useInfiniteQuery` result over
 * paginated lists fits.
 *
 * @example
 * const query: PagedQuery<Client> = useInfiniteQuery(clientsQuery(search));
 */
export type PagedQuery<TItem> = Readonly<{
	data:
		| Readonly<{ pages: readonly Page<TItem>[] }>
		| undefined;
	error: unknown;
	isFetching: boolean;
	refetch: () => Promise<unknown>;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => Promise<unknown>;
}>;

/**
 * The query options for one item by its key, such as a generated
 * `getApiUsersByUserIdOptions`.
 *
 * @example
 * itemQuery: userId => getApiUsersByUserIdOptions({ path: { userId } })
 */
export type ItemQuery<
	TItem,
	TData = TItem,
	TKey extends QueryKey = QueryKey,
> = (
	key: string,
) => UseQueryOptions<TData, DefaultError, TItem, TKey>;

/**
 * Where a combobox's items come from: a list filtered on the client, with the
 * load of the query it came from, or a paged query searched on the server.
 *
 * @example
 * const source: ComboboxItems<Client> = { query, onSearchChange: setSearch };
 */
export type ComboboxItems<TItem> =
	| Readonly<{
			items: readonly TItem[];
			/** How far `items` have loaded, when they come from a query. */
			load?: OptionsLoad;
			query?: never;
			onSearchChange?: never;
	  }>
	| Readonly<{
			/** The paged query, searched on the server. */
			query: PagedQuery<TItem>;
			/** Hands the debounced search text on to the query. */
			onSearchChange: (search: string) => void;
			items?: never;
			load?: never;
	  }>;

/** How far a paged query has got: its match count, and whether it fetches another page. */
export type PagedProgress = Readonly<{
	totalCount: number | undefined;
	isFetchingNextPage: boolean;
}>;

/**
 * The items of a source, as far as they have loaded.
 *
 * @example
 * itemsOf({ items: ["a", "b"] }); // ["a", "b"]
 */
export const itemsOf = <TItem>(
	source: ComboboxItems<TItem>,
): readonly TItem[] =>
	source.query === undefined
		? source.items
		: (source.query.data?.pages.flatMap(
				page => page.items ?? [],
			) ?? []);

/**
 * The load of a source: a list's own `load`, or the paged query's.
 *
 * @example
 * loadOf({ items: statuses }, () => true); // { status: "success" }
 */
export const loadOf = <TItem>(
	source: ComboboxItems<TItem>,
	retryable: (error: unknown) => boolean,
): OptionsLoad =>
	source.query === undefined
		? (source.load ?? OPTIONS_LOADED)
		: optionsLoad(source.query, retryable);

/**
 * A paged query's progress once it holds data, else nothing.
 *
 * @example
 * pagedProgress({ items: statuses }); // undefined
 */
export const pagedProgress = <TItem>(
	source: ComboboxItems<TItem>,
): PagedProgress | undefined =>
	source.query?.data === undefined
		? undefined
		: {
				totalCount:
					source.query.data.pages.at(0)?.totalCount,
				isFetchingNextPage: source.query.isFetchingNextPage,
			};
