import type { QueryKey } from "@tanstack/react-query";
import {
	type Context,
	createContext,
	type ReactNode,
} from "react";
import type { ItemQuery } from "./combobox-items.ts";
import type { ItemLookup } from "./value-state.ts";

/** What a lookup component is handed: the keys to look up, and what to render with the answers. */
export type ItemLookupsProps<
	TItem,
	TData,
	TKey extends QueryKey,
> = Readonly<{
	keys: readonly string[];
	itemQuery: ItemQuery<TItem, TData, TKey>;
	/** Renders with one lookup per key, in the order of `keys`. */
	children: (
		lookups: readonly ItemLookup<TItem>[],
	) => ReactNode;
}>;

/** A component that runs a combobox's `itemQuery` for each key. */
export type ItemLookups = <
	TItem,
	TData,
	TKey extends QueryKey,
>(
	props: ItemLookupsProps<TItem, TData, TKey>,
) => ReactNode;

/**
 * The component that runs an `itemQuery`, put in place by
 * `ComboboxItemQueries`. Empty without one.
 */
export const ItemLookupsContext: Context<ItemLookups | null> =
	createContext<ItemLookups | null>(null);
