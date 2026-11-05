import {
	type DefaultError,
	type QueryKey,
	useQueries,
	type UseQueryOptions,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
	type ItemLookupsProps,
	ItemLookupsContext,
} from "./item-lookups.ts";
import type { ItemLookup } from "./value-state.ts";

const QueryItemLookups = <
	TItem,
	TData,
	TKey extends QueryKey,
>({
	keys,
	itemQuery,
	children,
}: ItemLookupsProps<TItem, TData, TKey>): ReactNode => {
	const lookups = useQueries<
		Array<
			UseQueryOptions<TData, DefaultError, TItem, TKey> & {
				queryFnData: TData;
				data: TItem;
				error: DefaultError;
			}
		>,
		readonly ItemLookup<TItem>[]
	>({
		queries: keys.map(key => ({
			...itemQuery(key),
			placeholderData: undefined,
		})),
		combine: results =>
			results.map((result): ItemLookup<TItem> => ({
				data: result.data,
				error: result.error,
			})),
	});
	return children(lookups);
};

/**
 * Lets every `ComboboxField` under it run its `itemQuery` through TanStack
 * Query. Mount it once, inside the app's `QueryClientProvider`.
 *
 * @example
 * <QueryClientProvider client={queryClient}>
 * 	<ComboboxItemQueries>
 * 		<App />
 * 	</ComboboxItemQueries>
 * </QueryClientProvider>
 */
export const ComboboxItemQueries = ({
	children,
}: Readonly<{ children: ReactNode }>): ReactNode => (
	<ItemLookupsContext value={QueryItemLookups}>
		{children}
	</ItemLookupsContext>
);
