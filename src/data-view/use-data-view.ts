import {
	type DefaultError,
	keepPreviousData,
	type QueryKey,
	useQuery,
	type UseQueryOptions,
	type UseQueryResult,
} from "@tanstack/react-query";
import {
	type ColumnDef,
	functionalUpdate,
	type PaginationState,
	type ReactTable,
	type Row,
	type RowData,
	type SortingState,
	useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
	type FilterView,
	useFilterView,
} from "../components/filter-bar/use-filter-view.ts";
import {
	type RowSelectionView,
	useRowSelection,
} from "../lib/hooks/use-row-selection.ts";
import type { StorageAdapter } from "../lib/storage.ts";
import {
	type StoredValue,
	storedPageSize,
} from "../lib/table-storage.ts";
import {
	dataTableFeatures,
	type DataTableFeatures,
	EMPTY_ROWS,
	PAGE_SIZE_OPTIONS,
	type PageSizeOptions,
} from "../data-table/table-features.ts";

const DEFAULT_PAGINATION: PaginationState = {
	pageIndex: 0,
	pageSize: 25,
};

/**
 * The current view parameters handed to the caller's `queryOptions` factory:
 * committed filters, the debounced search, and table pagination + sorting.
 */
export type DataViewQueryParams<TFilters> = Readonly<{
	filters: TFilters;
	search: string;
	pagination: PaginationState;
	sorting: SortingState;
}>;

export type UseDataViewConfig<
	TFilters extends object,
	TRow extends RowData,
	TQueryData,
	TError,
	TQueryKey extends QueryKey,
> = Readonly<{
	/**
	 * Stable id of this table instance, unique in the app. What the table
	 * remembers across reloads, such as its page size, is stored under it.
	 */
	tableId: string;
	initialFilters: TFilters;
	/**
	 * Where the committed filters persist, usually
	 * `tableStoredValue(tableId, "filters", shape, storage)`. The table opens on
	 * them and writes them back on every commit.
	 */
	storedFilters?: StoredValue<TFilters>;
	/** The columns; a column is sortable when it sets `enableSorting`. */
	columns: readonly ColumnDef<DataTableFeatures, TRow>[];
	/**
	 * Query-options factory, parameterized by the committed filters, debounced
	 * search, pagination and sorting.
	 */
	queryOptions: (
		params: DataViewQueryParams<TFilters>,
	) => UseQueryOptions<
		TQueryData,
		TError,
		TQueryData,
		TQueryKey
	>;
	/** Stable application id for a row. Required for selection. */
	getRowId: (row: TRow) => string;
	/** Whether a row offers to expand. @default never */
	getRowCanExpand?: (
		row: Row<DataTableFeatures, TRow>,
	) => boolean;
	/** Extracts the current page's rows from the query data. */
	getRows: (data: TQueryData) => readonly TRow[];
	/** Extracts the server-side total row count from the query data. */
	getRowCount: (data: TQueryData) => number;
	initialPagination?: PaginationState;
	/** The page sizes the user can pick from. @default PAGE_SIZE_OPTIONS */
	pageSizeOptions?: PageSizeOptions;
	initialSorting?: SortingState;
	/** Debounce for the live search, in ms. @default 300 */
	searchDelay?: number;
	/** Where the picked page size persists, under `tableId`. Without it, nothing persists. */
	storage?: StorageAdapter;
}>;

export type DataView<
	TFilters extends object,
	TRow extends RowData,
	TQueryData,
	TError,
> = Readonly<{
	filters: FilterView<TFilters>;
	table: ReactTable<DataTableFeatures, TRow>;
	query: UseQueryResult<TQueryData, TError>;
	selection: RowSelectionView;
}>;

/**
 * Orchestrates a server-driven, filterable table: `useFilterView`, a TanStack
 * Query and a TanStack Table instance with manual pagination and sorting, plus
 * a row selection. Pagination, sorting, expansion and selection live in the
 * instance's own state: read `table.state`, never mirror it back through
 * `options.state`. A new filter or search returns to the first page and clears
 * the selection, and rows from the last settled page stay on screen when a
 * fetch fails.
 *
 * @example
 * const { filters, table, query, selection } = useDataView({
 * 	tableId: "invoices",
 * 	initialFilters: {},
 * 	columns,
 * 	queryOptions: ({ filters, search, pagination, sorting }) =>
 * 		invoicesQuery({ filters, search, pagination, sorting }),
 * 	getRowId: row => row.id,
 * 	getRows: data => data.rows,
 * 	getRowCount: data => data.totalCount,
 * 	storage: localStorageAdapter,
 * });
 */
export const useDataView = <
	TFilters extends object,
	TRow extends RowData,
	TQueryData,
	TError = DefaultError,
	TQueryKey extends QueryKey = QueryKey,
>({
	tableId,
	initialFilters,
	storedFilters,
	columns,
	queryOptions,
	getRowId,
	getRowCanExpand,
	getRows,
	getRowCount,
	initialPagination = DEFAULT_PAGINATION,
	pageSizeOptions = PAGE_SIZE_OPTIONS,
	initialSorting = [],
	searchDelay,
	storage,
}: UseDataViewConfig<
	TFilters,
	TRow,
	TQueryData,
	TError,
	TQueryKey
>): DataView<TFilters, TRow, TQueryData, TError> => {
	const pageSizeStore =
		storage === undefined
			? undefined
			: storedPageSize(
					tableId,
					pageSizeOptions,
					initialPagination.pageSize,
					storage,
				);
	const [initialPageSize] = useState(
		() =>
			pageSizeStore?.read() ?? initialPagination.pageSize,
	);

	const table = useTable<DataTableFeatures, TRow>({
		features: dataTableFeatures,
		data: EMPTY_ROWS,
		columns,
		getRowId,
		getRowCanExpand,
		manualPagination: true,
		manualSorting: true,
		meta: { pageSizeOptions },
		initialState: {
			pagination: {
				...initialPagination,
				pageSize: initialPageSize,
			},
			sorting: initialSorting,
		},
		onPaginationChange: updater => {
			const previous = table.baseAtoms.pagination.get();
			const next = functionalUpdate(updater, previous);
			table.baseAtoms.pagination.set(next);
			if (next.pageSize !== previous.pageSize) {
				pageSizeStore?.write(next.pageSize);
			}
		},
	});
	const { pagination, sorting } = table.state;

	const selection = useRowSelection();

	const resetForNewResultSet = () => {
		table.setPageIndex(0);
		selection.clear();
	};

	const filters = useFilterView<TFilters>({
		initial: initialFilters,
		stored: storedFilters,
		onCommittedChange: resetForNewResultSet,
		onSearchChange: resetForNewResultSet,
		searchDelay,
	});

	const query = useQuery({
		...queryOptions({
			filters: filters.committed,
			search: filters.debouncedSearch,
			pagination,
			sorting,
		}),
		placeholderData: keepPreviousData,
	});

	const [lastSettled, setLastSettled] = useState<
		TQueryData | undefined
	>(undefined);
	if (
		query.data !== undefined &&
		query.data !== lastSettled
	) {
		setLastSettled(query.data);
	}
	const data = query.data ?? lastSettled;

	table.setOptions(prev => ({
		...prev,
		data: data ? getRows(data) : EMPTY_ROWS,
		rowCount: data ? getRowCount(data) : 0,
	}));

	return {
		filters,
		table,
		query,
		selection,
	};
};
