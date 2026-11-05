import {
	metaHelper,
	rowExpandingFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	tableFeatures,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

/** Per-column options a `DataTable` reads from a column definition's `meta`. */
export type DataTableColumnMeta = Readonly<{
	/**
	 * Collapse the column to its content width rather than letting it take a
	 * share of the free space. For icon-button and control columns.
	 */
	fit?: boolean;
	/**
	 * This column holds quantities — amounts, counts, measures — and is
	 * end-aligned, with its unit named in the header. Not for codes or dates.
	 */
	numeric?: boolean;
	/**
	 * Pin this column to an edge of the scroll container, so it stays put while
	 * the rest of the table scrolls sideways. At most two per edge, and each
	 * edge's columns must be adjacent and sit at that edge of the column list.
	 */
	sticky?: "start" | "end";
	/**
	 * What this column draws in a placeholder row while the first page loads.
	 * Every other column falls back to a skeleton bar.
	 */
	placeholderCell?: () => ReactNode;
}>;

/** The page sizes a table offers, as a list that is never empty. */
export type PageSizeOptions = readonly [
	number,
	...number[],
];

/**
 * The page sizes a table offers when it names none of its own.
 *
 * @example
 * pageSizeOptions: PAGE_SIZE_OPTIONS, // 10, 25, 50, 100
 */
export const PAGE_SIZE_OPTIONS: PageSizeOptions = [
	10, 25, 50, 100,
];

/** Per-table options a `DataTable` reads from a table's `meta`. */
export type DataTableMeta = Readonly<{
	/** The page sizes the pagination control offers. */
	pageSizeOptions?: PageSizeOptions;
}>;

/** The TanStack Table features a `DataTable` instance registers. */
export type DataTableFeatures = Readonly<{
	rowSortingFeature: typeof rowSortingFeature;
	rowPaginationFeature: typeof rowPaginationFeature;
	rowExpandingFeature: typeof rowExpandingFeature;
	rowSelectionFeature: typeof rowSelectionFeature;
	tableMeta: DataTableMeta;
	columnMeta: DataTableColumnMeta;
}>;

/**
 * The feature set a `DataTable` instance registers. No row-model slots:
 * sorting and pagination are server-owned and expansion drives the table's
 * own sub-row rendering.
 *
 * @example
 * const table = useTable<DataTableFeatures, Row>({ features: dataTableFeatures, columns, data });
 */
export const dataTableFeatures: DataTableFeatures =
	tableFeatures({
		rowSortingFeature,
		rowPaginationFeature,
		rowExpandingFeature,
		rowSelectionFeature,
		tableMeta: metaHelper<DataTableMeta>(),
		columnMeta: metaHelper<DataTableColumnMeta>(),
	});

const emptyRows: never[] = [];
Object.freeze(emptyRows);

/**
 * A frozen empty rows array. Pass it as the `data` default when building the
 * table instance, so an undefined query result never mints a new array.
 *
 * @example
 * data: query.data?.items ?? EMPTY_ROWS,
 */
export const EMPTY_ROWS: never[] = emptyRows;
