import type { ReactTable } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Pagination,
	type PaginationIndexProps,
} from "../components/pagination/pagination.tsx";
import type { RowSelectionView } from "../lib/hooks/use-row-selection.ts";
import { DataTableContent } from "./data-table-content.tsx";
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

export type DataTablePaginationProps = Readonly<{
	/** The page-size select's label, such as "Rows per page". */
	pageSizeLabel: string;
	/** What the index says, such as `Page 3 of 12`, from where the table stands. */
	indexLabel: PaginationIndexProps["label"];
	/** The first-page button's name, such as "First page". */
	firstLabel: string;
	/** The previous-page button's name, such as "Previous page". */
	previousLabel: string;
	/** The next-page button's name, such as "Next page". */
	nextLabel: string;
	/** The last-page button's name, such as "Last page". */
	lastLabel: string;
	className?: string;
}>;

/**
 * The kit's `Pagination`, driven by the instance's pagination API (built with
 * `manualPagination` + server `rowCount`). The page sizes come from the
 * table's `meta.pageSizeOptions`, and picking one returns to the first page.
 */
const DataTablePagination = ({
	pageSizeLabel,
	indexLabel,
	firstLabel,
	previousLabel,
	nextLabel,
	lastLabel,
	className,
}: DataTablePaginationProps): ReactNode => {
	const { table } = useDataTable();
	const { pageIndex, pageSize } = table.state.pagination;

	return (
		<Pagination.Root
			className={clsx(style.pagination, className)}
			pageIndex={pageIndex}
			pageCount={Math.max(table.getPageCount(), 1)}
			pageSize={pageSize}
			pageSizes={
				table.options.meta?.pageSizeOptions ??
				PAGE_SIZE_OPTIONS
			}
			onPageIndexChange={next => {
				table.setPageIndex(next);
			}}
			onPageSizeChange={next => {
				table.setPagination({
					pageIndex: 0,
					pageSize: next,
				});
			}}>
			<Pagination.PageSize label={pageSizeLabel} />
			<Pagination.Index label={indexLabel} />
			<Pagination.Controls
				firstLabel={firstLabel}
				previousLabel={previousLabel}
				nextLabel={nextLabel}
				lastLabel={lastLabel}
			/>
		</Pagination.Root>
	);
};

type DataTableParts = Readonly<{
	Root: typeof Root;
	Toolbar: typeof Toolbar;
	Content: typeof DataTableContent;
	Pagination: typeof DataTablePagination;
	SelectionBar: typeof DataTableSelectionBar;
}>;

/**
 * Composite data table over a TanStack Table instance. `Root` holds the
 * instance and the injected query state in context; the parts lay it out:
 * `Toolbar`, `SelectionBar`, `Content` and `Pagination`. A nested sub-table
 * gets its own `DataTable.Root`, with its own instance and context.
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
 * 	/>
 * 	<DataTable.Pagination
 * 		pageSizeLabel="Rows per page"
 * 		indexLabel={page => `Page ${page.pageIndex + 1} of ${page.pageCount}`}
 * 		firstLabel="First page"
 * 		previousLabel="Previous page"
 * 		nextLabel="Next page"
 * 		lastLabel="Last page"
 * 	/>
 * </DataTable.Root>
 */
export const DataTable: DataTableParts = {
	Root,
	Toolbar,
	Content: DataTableContent,
	Pagination: DataTablePagination,
	SelectionBar: DataTableSelectionBar,
};
