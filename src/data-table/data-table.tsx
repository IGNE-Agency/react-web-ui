import type { ReactTable } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Pagination,
	type PaginationContentProps,
	type PaginationRootProps,
} from "../components/pagination/pagination.tsx";
import type { RowSelectionView } from "../lib/hooks/use-row-selection.ts";
import { DataTableContent } from "./data-table-content.tsx";
import {
	Body,
	Cell,
	ErrorMessage,
	Frame,
	Head,
	HeaderCell,
	HeaderRow,
	LoadingCaption,
	PlaceholderRows,
	RefreshFailed,
	Row,
	Scroller,
	SortButton,
	StaleOverlay,
	StateRow,
	SubRow,
	Table,
} from "./data-table-parts.tsx";
import {
	DataTableContext,
	useDataTable,
} from "./data-table-context.tsx";
import { DataTableSelectionBar } from "./data-table-selection.tsx";
import type { DataTableStatus } from "./resolve-view.ts";
import {
	type DataTableFeatures,
	PAGE_SIZE_OPTIONS,
} from "./table-features.ts";
import style from "./data-table.module.scss";

export type DataTableRootProps<
	TData extends Record<string, unknown>,
> = Readonly<{
	/** The configured table instance (built by the caller). */
	table: ReactTable<DataTableFeatures, TData>;
	/**
	 * Selection model from `useRowSelection`, enabling the selection parts
	 * (`selectionColumn()`, `DataTable.SelectionBar`).
	 */
	selection?: RowSelectionView;
	/** Injected query lifecycle status (TanStack Query `status`). */
	status: DataTableStatus;
	/**
	 * Whether a fetch is in flight. With keep-previous-data this drives the
	 * "stale" affordance while previous rows stay visible. @default false
	 */
	isFetching?: boolean;
	/** Refetches, offered as a retry when a fetch fails or runs long. */
	onRetry?: () => void;
	children: ReactNode;
	className?: string;
}>;

/** Holds the table instance and the injected query state for the parts inside it. */
const Root = <TData extends Record<string, unknown>>({
	table,
	selection,
	status,
	isFetching = false,
	onRetry,
	children,
	className,
}: DataTableRootProps<TData>): ReactNode => (
	<DataTableContext
		value={{
			table,
			selection,
			status,
			isFetching,
			onRetry,
		}}>
		<div className={clsx(style.root, className)}>
			{children}
		</div>
	</DataTableContext>
);

export type DataTableToolbarProps = Readonly<{
	children: ReactNode;
	className?: string;
}>;

/** Layout slot above the table for search, filters and actions. */
const Toolbar = ({
	children,
	className,
}: DataTableToolbarProps): ReactNode => (
	<div className={clsx(style.toolbar, className)}>
		{children}
	</div>
);

type TableBoundPagination =
	| "pageIndex"
	| "pageCount"
	| "pageSize"
	| "pageSizes"
	| "onPageIndexChange"
	| "onPageSizeChange";

export type DataTablePaginationProps = Omit<
	PaginationRootProps,
	TableBoundPagination | "children"
> &
	(
		| (PaginationContentProps &
				Readonly<{ children?: undefined }>)
		| (Readonly<{
				/** The `Pagination` parts, such as `Pagination.PageSize`, `Pagination.Index` and `Pagination.Controls`, in place of the ready-made pager. */
				children: ReactNode;
		  }> &
				Readonly<
					Partial<
						Record<keyof PaginationContentProps, undefined>
					>
				>)
	);

/**
 * The pager driven by the instance's pagination API (built with
 * `manualPagination` + server `rowCount`): the ready-made `Pagination` from its
 * labels and icons, or a `Pagination.Root` holding the parts it is given. The
 * page sizes come from the table's `meta.pageSizeOptions`, and picking one
 * returns to the first page.
 */
const DataTablePagination = (
	props: DataTablePaginationProps,
): ReactNode => {
	const { table } = useDataTable();
	const { pageIndex, pageSize } = table.state.pagination;
	const bound = {
		className: clsx(style.pagination, props.className),
		pageIndex,
		pageCount: Math.max(table.getPageCount(), 1),
		pageSize,
		pageSizes:
			table.options.meta?.pageSizeOptions ??
			PAGE_SIZE_OPTIONS,
		onPageIndexChange: (next: number) => {
			table.setPageIndex(next);
		},
		onPageSizeChange: (next: number) => {
			table.setPagination({
				pageIndex: 0,
				pageSize: next,
			});
		},
	};

	return props.indexLabel === undefined ? (
		<Pagination.Root {...props} {...bound} />
	) : (
		<Pagination {...props} {...bound} />
	);
};

type DataTableParts = Readonly<{
	Root: typeof Root;
	Toolbar: typeof Toolbar;
	Content: typeof DataTableContent;
	Pagination: typeof DataTablePagination;
	SelectionBar: typeof DataTableSelectionBar;
	RefreshFailed: typeof RefreshFailed;
	Frame: typeof Frame;
	Scroller: typeof Scroller;
	StaleOverlay: typeof StaleOverlay;
	Table: typeof Table;
	LoadingCaption: typeof LoadingCaption;
	Head: typeof Head;
	HeaderRow: typeof HeaderRow;
	HeaderCell: typeof HeaderCell;
	SortButton: typeof SortButton;
	Body: typeof Body;
	Row: typeof Row;
	Cell: typeof Cell;
	SubRow: typeof SubRow;
	PlaceholderRows: typeof PlaceholderRows;
	StateRow: typeof StateRow;
	ErrorMessage: typeof ErrorMessage;
}>;

/**
 * Composite data table over a TanStack Table instance. `Root` holds the
 * instance and the injected query state in context; the parts lay it out:
 * `Toolbar`, `SelectionBar`, `Content` and `Pagination`. `Content` is the
 * whole table; where a table needs other markup, compose its parts instead:
 * `RefreshFailed`, then a `Frame` holding a `Scroller` and a `StaleOverlay`,
 * the `Scroller` holding the `Table` and its rows and cells, with
 * `useDataTableView` to pick the body. A nested sub-table gets its own
 * `DataTable.Root`, with its own instance and context.
 *
 * @example
 * <DataTable.Root table={table} status={query.status} isFetching={query.isFetching}>
 * 	<DataTable.Toolbar>
 * 		<FilterBar.Root filters={filters}>…</FilterBar.Root>
 * 	</DataTable.Toolbar>
 * 	<DataTable.Content
 * 		emptyState="No declarations yet."
 * 		errorLabel="The declarations could not be loaded."
 * 		loadingLabel="Loading declarations"
 * 		slowLabel="This is taking longer than usual."
 * 		retryLabel="Try again"
 * 		sortAscendingIcon={<ArrowUpwardIcon />}
 * 		sortDescendingIcon={<ArrowDownwardIcon />}
 * 	/>
 * 	<DataTable.Pagination
 * 		pageSizeLabel="Rows per page"
 * 		indexLabel={page => `Page ${page.pageIndex + 1} of ${page.pageCount}`}
 * 		firstLabel="First page"
 * 		previousLabel="Previous page"
 * 		nextLabel="Next page"
 * 		lastLabel="Last page"
 * 		firstIcon={<FirstPageIcon />}
 * 		previousIcon={<ChevronLeftIcon />}
 * 		nextIcon={<ChevronRightIcon />}
 * 		lastIcon={<LastPageIcon />}
 * 		checkIcon={<CheckIcon />}
 * 	/>
 * </DataTable.Root>
 */
export const DataTable: DataTableParts = {
	Root,
	Toolbar,
	Content: DataTableContent,
	Pagination: DataTablePagination,
	SelectionBar: DataTableSelectionBar,
	RefreshFailed,
	Frame,
	Scroller,
	StaleOverlay,
	Table,
	LoadingCaption,
	Head,
	HeaderRow,
	HeaderCell,
	SortButton,
	Body,
	Row,
	Cell,
	SubRow,
	PlaceholderRows,
	StateRow,
	ErrorMessage,
};
