import { type ReactNode, useRef } from "react";
import { useInfiniteScroll } from "../../lib/use-infinite-scroll.ts";
import { Button } from "../button/index.ts";
import {
	type OptionsLoad,
	type OptionsLoadLabels,
} from "../field/index.ts";
import { optionsLoadMessage } from "../field/options-load.ts";
import { Spinner } from "../spinner/index.ts";
import { Combobox } from "./combobox.tsx";
import type {
	PagedProgress,
	PagedQuery,
} from "./combobox-items.ts";

/** The copy a combobox's popup shows about its options. */
export type ComboboxPopupLabels = OptionsLoadLabels &
	Readonly<{
		/** Shown when the search matches nothing. */
		noResultsLabel: string;
		/** The search box's accessible name, such as "Search". */
		searchLabel: string;
		/** Read while a paged query fetches its next page. */
		loadingMoreLabel: string;
		/** The match count of a paged query, such as "40 results". */
		resultsLabel: (count: number) => string;
	}>;

const statusMessage = (
	copy: ComboboxPopupLabels,
	load: OptionsLoad,
	paged: PagedProgress | undefined,
): string | undefined => {
	const loadMessage = optionsLoadMessage(load, copy);
	if (loadMessage !== undefined || paged === undefined) {
		return loadMessage;
	}
	if (paged.isFetchingNextPage) {
		return copy.loadingMoreLabel;
	}
	return paged.totalCount === undefined
		? undefined
		: copy.resultsLabel(paged.totalCount);
};

type ComboboxPopupBodyProps<TItem> = Readonly<{
	copy: ComboboxPopupLabels;
	load: OptionsLoad;
	paged: PagedProgress | undefined;
	pagedQuery: PagedQuery<TItem> | undefined;
	noOptions: boolean;
	multiple: boolean;
	itemKey: (item: TItem) => string;
	renderItem: (item: TItem) => ReactNode;
}>;

/**
 * What a combobox field's popup holds: the search box, the load status with a
 * retry where one can help, the empty state and the list, which loads the next
 * page of a paged query as it nears its end.
 *
 * @example
 * <ComboboxPopupBody copy={copy} load={load} … />
 */
export const ComboboxPopupBody = <TItem,>({
	copy,
	load,
	paged,
	pagedQuery,
	noOptions,
	multiple,
	itemKey,
	renderItem,
}: ComboboxPopupBodyProps<TItem>): ReactNode => {
	const listRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const retry =
		load.status === "error" ? load.retry : undefined;

	useInfiniteScroll({
		ref: listRef,
		enabled:
			pagedQuery !== undefined &&
			pagedQuery.hasNextPage &&
			!pagedQuery.isFetchingNextPage,
		onLoadMore: () => {
			void pagedQuery?.fetchNextPage();
		},
	});

	return (
		<>
			<Combobox.Search
				ref={searchRef}
				aria-label={copy.searchLabel}
			/>
			<Combobox.StatusArea>
				<Combobox.Status>
					{(load.status === "pending" ||
						paged?.isFetchingNextPage === true) && (
						<Spinner size={1} />
					)}
					{statusMessage(copy, load, paged)}
				</Combobox.Status>
				{retry !== undefined && (
					<Button
						variant="tertiary"
						size="sm"
						onClick={() => {
							retry();
							searchRef.current?.focus();
						}}>
						{copy.retryLabel}
					</Button>
				)}
			</Combobox.StatusArea>
			<Combobox.Empty>
				{load.status === "success"
					? noOptions
						? copy.noOptionsLabel
						: copy.noResultsLabel
					: null}
			</Combobox.Empty>
			<Combobox.List ref={listRef}>
				{(item: TItem) => (
					<Combobox.Option
						key={itemKey(item)}
						value={item}
						multiple={multiple}>
						{renderItem(item)}
					</Combobox.Option>
				)}
			</Combobox.List>
		</>
	);
};
