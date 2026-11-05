import ChevronLeft from "@material-design-icons/svg/outlined/chevron_left.svg?react";
import ChevronRight from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import type { ReactTable } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Button } from "../components/button/button.tsx";
import { Select } from "../components/select-field/select.tsx";
import type { RowSelectionView } from "../lib/hooks/use-row-selection.ts";
import { DataTableContent } from "./data-table-content.tsx";
import {
	DataTableContext,
	useDataTable,
} from "./data-table-context.tsx";
import { DataTableSelectionBar } from "./data-table-selection.tsx";
import type { QueryStatus } from "./resolve-view.ts";
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
	status: QueryStatus;
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
	/** Where the reader is, such as "Page 2 of 3". */
	pageStatusLabel: (
		page: number,
		pageCount: number,
	) => string;
	/** The previous-page button's name and tooltip, such as "Previous page". */
	previousPageLabel: string;
	/** The next-page button's name and tooltip, such as "Next page". */
	nextPageLabel: string;
	className?: string;
}>;

/**
 * Prev/next + page-size controls driven by the instance's pagination API
 * (built with `manualPagination` + server `rowCount`). The page sizes come
 * from the table's `meta.pageSizeOptions`, and picking one returns to the
 * first page.
 */
const Pagination = ({
	pageSizeLabel,
	pageStatusLabel,
	previousPageLabel,
	nextPageLabel,
	className,
}: DataTablePaginationProps): ReactNode => {
	const { table } = useDataTable();
	const { pageIndex, pageSize } = table.state.pagination;
	const pageCount = Math.max(table.getPageCount(), 1);
	const sizeOptions = (
		table.options.meta?.pageSizeOptions ?? PAGE_SIZE_OPTIONS
	).map(size => ({
		value: String(size),
		label: String(size),
	}));

	return (
		<div className={clsx(style.pagination, className)}>
			<Select.Root
				options={sizeOptions}
				value={String(pageSize)}
				onValueChange={next => {
					table.setPagination({
						pageIndex: 0,
						pageSize: Number(next),
					});
				}}>
				<div className={style.pageSize}>
					<Select.Label>{pageSizeLabel}</Select.Label>
					<Select.Trigger
						className={style.pageSizeSelect}
					/>
					<Select.Portal>
						<Select.Positioner>
							<Select.Popup>
								<Select.List>
									<Select.Items />
								</Select.List>
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</div>
			</Select.Root>

			<span className={style.pageStatus} aria-live="polite">
				{pageStatusLabel(pageIndex + 1, pageCount)}
			</span>

			<Button
				variant="tertiary"
				iconOnly
				icon={ChevronLeft}
				label={previousPageLabel}
				disabled={!table.getCanPreviousPage()}
				onClick={() => {
					table.previousPage();
				}}
			/>
			<Button
				variant="tertiary"
				iconOnly
				icon={ChevronRight}
				label={nextPageLabel}
				disabled={!table.getCanNextPage()}
				onClick={() => {
					table.nextPage();
				}}
			/>
		</div>
	);
};

type DataTableParts = Readonly<{
	Root: typeof Root;
	Toolbar: typeof Toolbar;
	Content: typeof DataTableContent;
	Pagination: typeof Pagination;
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
 * 		errorState="The declarations could not be loaded."
 * 		loadingState="Loading declarations"
 * 		slowLabel="This is taking longer than usual."
 * 		retryLabel="Try again"
 * 	/>
 * 	<DataTable.Pagination
 * 		pageSizeLabel="Rows per page"
 * 		pageStatusLabel={(page, count) => `Page ${page} of ${count}`}
 * 		previousPageLabel="Previous page"
 * 		nextPageLabel="Next page"
 * 	/>
 * </DataTable.Root>
 */
export const DataTable: DataTableParts = {
	Root,
	Toolbar,
	Content: DataTableContent,
	Pagination,
	SelectionBar: DataTableSelectionBar,
};
