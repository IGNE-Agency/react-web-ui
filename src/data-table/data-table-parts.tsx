import { useRender } from "@base-ui/react/use-render";
import type {
	Cell as TableCell,
	Header as TableHeader,
	Row as TableRow,
	SortDirection,
	SortingState,
} from "@tanstack/react-table";
import { clsx } from "clsx";
import type {
	ComponentProps,
	CSSProperties,
	ReactElement,
	ReactNode,
} from "react";
import { Skeleton } from "../components/skeleton/skeleton.tsx";
import {
	Stale,
	type StaleOverlayProps,
} from "../components/stale/stale.tsx";
import { useDataTable } from "./data-table-context.tsx";
import {
	type ResolvedView,
	resolveView,
} from "./resolve-view.ts";
import type {
	DataTableColumnMeta,
	DataTableFeatures,
} from "./table-features.ts";
import { useStickyOffsets } from "./use-sticky-offsets.ts";
import style from "./data-table.module.scss";

const ARIA_SORT = {
	asc: "ascending",
	desc: "descending",
} as const;

/**
 * The `aria-sort` value for a header cell, given its column's sort state.
 *
 * @example
 * ariaSort("desc"); // -> "descending"
 * ariaSort(false); // -> undefined
 */
const ariaSort = (
	sorted: false | SortDirection,
): "ascending" | "descending" | undefined =>
	sorted === false ? undefined : ARIA_SORT[sorted];

/**
 * Which way a column sorts, read from the table's sorting state.
 *
 * @example
 * sortOf([{ id: "amount", desc: true }], "amount"); // -> "desc"
 */
const sortOf = (
	sorting: SortingState,
	columnId: string,
): false | SortDirection => {
	const entry = sorting.find(sort => sort.id === columnId);
	return entry === undefined
		? false
		: entry.desc
			? "desc"
			: "asc";
};

type Pin = Readonly<{
	side: "start" | "end";
	/** Position within the group pinned to that edge, in column order. */
	index: number;
}>;

type LayoutColumn = Readonly<{
	id: string;
	columnDef: Readonly<{ meta?: DataTableColumnMeta }>;
}>;

/**
 * The edge a column is pinned to and its position in that edge's group, or
 * `undefined` for a column that scrolls.
 *
 * @example
 * columnPin(columns, "actions"); // -> { side: "end", index: 0 }
 */
const columnPin = (
	columns: ReadonlyArray<LayoutColumn>,
	id: string,
): Pin | undefined => {
	const side = columns.find(column => column.id === id)
		?.columnDef.meta?.sticky;
	if (side === undefined) {
		return undefined;
	}
	return {
		side,
		index: columns
			.filter(
				column => column.columnDef.meta?.sticky === side,
			)
			.findIndex(column => column.id === id),
	};
};

/**
 * How many columns are pinned to an edge.
 *
 * @example
 * pinCount(columns, "start"); // -> 1
 */
const pinCount = (
	columns: ReadonlyArray<LayoutColumn>,
	side: "start" | "end",
): number =>
	columns.filter(
		column => column.columnDef.meta?.sticky === side,
	).length;

/**
 * The props a column's layout options put on its header and body cells: the
 * data attributes the stylesheet reads, plus the inset a pinned cell sits at.
 *
 * @example
 * <td {...cellProps(cell.column.columnDef.meta, columnPin(columns, cell.column.id))} />
 */
const cellProps = (
	meta: DataTableColumnMeta | undefined,
	pin: Pin | undefined,
	inlineStyle: CSSProperties | undefined,
) => ({
	"data-fit": meta?.fit ? "true" : undefined,
	"data-numeric": meta?.numeric ? "true" : undefined,
	"data-sticky": pin?.side,
	style:
		pin === undefined
			? inlineStyle
			: pin.side === "start"
				? {
						insetInlineStart: `var(--table-sticky-inset-${pin.index}, 0px)`,
						...inlineStyle,
					}
				: {
						insetInlineEnd: `var(--table-sticky-end-${pin.index}, 0px)`,
						...inlineStyle,
					},
});

/**
 * Which body the enclosing `DataTable` shows, whether its rows are stale, and
 * whether a refresh failed over rows still on screen.
 *
 * @example
 * const { view } = useDataTableView();
 * if (view === "empty") return <DataTable.StateRow>No invoices yet.</DataTable.StateRow>;
 */
export const useDataTableView = (): ResolvedView => {
	const { table, status, isFetching } = useDataTable();
	return resolveView({
		status,
		isFetching,
		hasRows: table.getRowModel().rows.length > 0,
	});
};

export type DataTableRefreshFailedProps =
	useRender.ComponentProps<"div">;

/** The alert above rows still on screen when a refresh fails. Renders nothing otherwise. */
export const RefreshFailed = ({
	render,
	className,
	ref,
	...props
}: DataTableRefreshFailedProps): ReactElement | null => {
	const { refreshFailed } = useDataTableView();
	return useRender({
		defaultTagName: "div",
		render,
		ref,
		enabled: refreshFailed,
		props: {
			role: "alert",
			...props,
			className: clsx(style.refreshFailed, className),
		},
	});
};

export type DataTableFrameProps =
	useRender.ComponentProps<"div">;

/**
 * The frame that stays put around the scroller: it measures the pinned columns
 * and holds the stale state, so it takes a `Scroller` and a `StaleOverlay`.
 */
export const Frame = ({
	render,
	className,
	ref,
	children,
	...props
}: DataTableFrameProps): ReactElement => {
	const { table } = useDataTable();
	const { stale } = useDataTableView();
	const columns = table.getAllLeafColumns();
	const frameRef = useStickyOffsets(
		columns
			.filter(
				column =>
					column.columnDef.meta?.sticky !== undefined,
			)
			.map(
				column =>
					`${column.id}:${column.columnDef.meta?.sticky}`,
			)
			.join(","),
	);
	return useRender({
		defaultTagName: "div",
		render,
		ref: ref === undefined ? frameRef : [frameRef, ref],
		props: {
			...props,
			className: clsx(style.scrollFrame, className),
			children: (
				<Stale.Root busy={stale} className={style.stale}>
					{children}
				</Stale.Root>
			),
		},
	});
};

export type DataTableScrollerProps =
	useRender.ComponentProps<"div">;

/** The scrolling card that holds the `Table`, dimmed while its rows are stale. */
export const Scroller = ({
	render,
	className,
	ref,
	...props
}: DataTableScrollerProps): ReactNode => {
	const element = useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			"data-scroller": true,
			className: clsx(style.contentWrap, className),
		},
	});
	return (
		<Stale.Content className={style.stale}>
			{element}
		</Stale.Content>
	);
};

/** What covers the table once a refresh is slow: its `Stale.Message` and `Stale.Retry`. */
export const StaleOverlay = ({
	className,
	...props
}: StaleOverlayProps): ReactNode => (
	<Stale.Overlay
		className={clsx(style.staleOverlay, className)}
		{...props}
	/>
);

export type DataTableTableProps =
	useRender.ComponentProps<"table">;

/** The `<table>`, marked busy while its first page loads. */
export const Table = ({
	render,
	className,
	ref,
	...props
}: DataTableTableProps): ReactElement => {
	const { view } = useDataTableView();
	return useRender({
		defaultTagName: "table",
		render,
		ref,
		props: {
			"aria-busy": view === "loading" ? "true" : undefined,
			...props,
			className: clsx(style.table, className),
		},
	});
};

export type DataTableLoadingCaptionProps =
	useRender.ComponentProps<"caption">;

/** What is announced while the first page loads, such as "Loading invoices". Renders nothing otherwise. */
export const LoadingCaption = ({
	render,
	className,
	ref,
	...props
}: DataTableLoadingCaptionProps): ReactElement | null => {
	const { view } = useDataTableView();
	return useRender({
		defaultTagName: "caption",
		render,
		ref,
		enabled: view === "loading",
		props: {
			...props,
			className: clsx(style.busyCaption, className),
		},
	});
};

export type DataTableHeadProps =
	useRender.ComponentProps<"thead">;

/** The header, stuck to the top of the scroller. */
export const Head = ({
	render,
	className,
	ref,
	...props
}: DataTableHeadProps): ReactElement =>
	useRender({
		defaultTagName: "thead",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.thead, className),
		},
	});

export type DataTableHeaderRowProps =
	useRender.ComponentProps<"tr">;

/** One row of header cells. */
export const HeaderRow = ({
	render,
	ref,
	...props
}: DataTableHeaderRowProps): ReactElement =>
	useRender({ defaultTagName: "tr", render, ref, props });

export type DataTableHeaderCellProps<
	TData extends Record<string, unknown>,
> = useRender.ComponentProps<"th"> &
	Readonly<{
		/** The header this cell draws. */
		header: TableHeader<DataTableFeatures, TData>;
	}>;

/**
 * A column header, laid out by its column's `meta` and announcing its sort.
 * It draws the column's header unless given children, such as a `SortButton`.
 */
export const HeaderCell = <
	TData extends Record<string, unknown>,
>({
	header,
	render,
	className,
	style: inlineStyle,
	ref,
	children,
	...props
}: DataTableHeaderCellProps<TData>): ReactElement => {
	const { table, sorting } = useDataTable<TData>();
	return useRender({
		defaultTagName: "th",
		render,
		ref,
		props: {
			scope: "col",
			colSpan: header.colSpan,
			"aria-sort": ariaSort(
				sortOf(sorting, header.column.id),
			),
			...props,
			...cellProps(
				header.column.columnDef.meta,
				columnPin(
					table.getAllLeafColumns(),
					header.column.id,
				),
				inlineStyle,
			),
			className: clsx(style.th, className),
			children:
				children === undefined ? (
					header.isPlaceholder ? null : (
						<table.FlexRender header={header} />
					)
				) : (
					children
				),
		},
	});
};

export type DataTableSortButtonProps<
	TData extends Record<string, unknown>,
> = Omit<ComponentProps<"button">, "ref"> &
	Readonly<{
		/** The header whose column this sorts. */
		header: TableHeader<DataTableFeatures, TData>;
		/** The glyph while the column sorts ascending. */
		sortAscendingIcon?: ReactNode;
		/** The glyph while the column sorts descending. */
		sortDescendingIcon?: ReactNode;
		/** The glyph while the column is not sorted. */
		unsortedIcon?: ReactNode;
	}>;

/**
 * The header's sort toggle, which returns the table to its first page. It
 * draws the column's header unless given children, followed by the glyph for
 * the column's sort, where one is given.
 */
export const SortButton = <
	TData extends Record<string, unknown>,
>({
	header,
	sortAscendingIcon,
	sortDescendingIcon,
	unsortedIcon,
	className,
	children,
	onClick,
	...props
}: DataTableSortButtonProps<TData>): ReactNode => {
	const { table, sorting } = useDataTable<TData>();
	const sorted = sortOf(sorting, header.column.id);
	const icon =
		sorted === "asc"
			? sortAscendingIcon
			: sorted === "desc"
				? sortDescendingIcon
				: unsortedIcon;

	return (
		<button
			type="button"
			{...props}
			className={clsx(style.sortToggle, className)}
			onClick={event => {
				onClick?.(event);
				header.column.toggleSorting();
				table.setPageIndex(0);
			}}>
			{children ?? <table.FlexRender header={header} />}
			{icon === undefined || icon === null ? null : (
				<span
					className={style.sortIcon}
					data-sort={sorted === false ? "none" : sorted}
					aria-hidden="true">
					{icon}
				</span>
			)}
		</button>
	);
};

export type DataTableBodyProps =
	useRender.ComponentProps<"tbody">;

/** The body: the page's `Row`s, the `PlaceholderRows` or a `StateRow`. */
export const Body = ({
	render,
	ref,
	...props
}: DataTableBodyProps): ReactElement =>
	useRender({
		defaultTagName: "tbody",
		render,
		ref,
		props,
	});

export type DataTableRowProps<
	TData extends Record<string, unknown>,
> = useRender.ComponentProps<"tr"> &
	Readonly<{
		/** The row this draws, which sets its stripe. */
		row: TableRow<DataTableFeatures, TData>;
	}>;

/** A body row, striped on every other row. */
export const Row = <TData extends Record<string, unknown>>({
	row,
	render,
	className,
	ref,
	...props
}: DataTableRowProps<TData>): ReactElement =>
	useRender({
		defaultTagName: "tr",
		render,
		ref,
		props: {
			"data-stripe":
				row.index % 2 === 1 ? "true" : undefined,
			...props,
			className: clsx(style.row, className),
		},
	});

export type DataTableCellProps<
	TData extends Record<string, unknown>,
> = useRender.ComponentProps<"td"> &
	Readonly<{
		/** The cell this draws. */
		cell: TableCell<DataTableFeatures, TData>;
	}>;

/** A body cell, laid out by its column's `meta`. It draws the column's cell unless given children. */
export const Cell = <
	TData extends Record<string, unknown>,
>({
	cell,
	render,
	className,
	style: inlineStyle,
	ref,
	children,
	...props
}: DataTableCellProps<TData>): ReactElement => {
	const { table } = useDataTable<TData>();
	return useRender({
		defaultTagName: "td",
		render,
		ref,
		props: {
			...props,
			...cellProps(
				cell.column.columnDef.meta,
				columnPin(
					table.getAllLeafColumns(),
					cell.column.id,
				),
				inlineStyle,
			),
			className: clsx(style.td, className),
			children: children ?? (
				<table.FlexRender cell={cell} />
			),
		},
	});
};

export type DataTableSubRowProps =
	useRender.ComponentProps<"tr">;

/**
 * The full-width row beneath an expanded row, holding its children. The pinned
 * columns keep their place beside it.
 */
export const SubRow = ({
	render,
	className,
	ref,
	children,
	...props
}: DataTableSubRowProps): ReactElement => {
	const { table } = useDataTable();
	const columns = table.getAllLeafColumns();
	const startPins = pinCount(columns, "start");
	const endPins = pinCount(columns, "end");

	return useRender({
		defaultTagName: "tr",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.subRow, className),
			children: (
				<>
					{startPins > 0 ? (
						<td
							className={style.td}
							colSpan={startPins}
							data-sticky="start"
							style={{ insetInlineStart: 0 }}
						/>
					) : null}
					<td
						colSpan={columns.length - startPins - endPins}>
						{children}
					</td>
					{endPins > 0 ? (
						<td
							className={style.td}
							colSpan={endPins}
							data-sticky="end"
							style={{ insetInlineEnd: 0 }}
						/>
					) : null}
				</>
			),
		},
	});
};

/**
 * Inert placeholder rows for a first load: one row per row of the selected page
 * size. A column that declares a `placeholderCell` draws it; every other column
 * gets a skeleton bar.
 */
export const PlaceholderRows = (): ReactNode => {
	const { table } = useDataTable();
	const columns = table.getAllLeafColumns();

	return Array.from(
		{ length: table.state.pagination.pageSize },
		(_, index) => (
			<tr
				key={index}
				className={style.row}
				data-stripe={index % 2 === 1 ? "true" : undefined}
				inert>
				{columns.map(column => (
					<td
						key={column.id}
						className={style.td}
						{...cellProps(
							column.columnDef.meta,
							columnPin(columns, column.id),
							undefined,
						)}>
						{column.columnDef.meta?.placeholderCell?.() ?? (
							<Skeleton className={style.skeletonBar} />
						)}
					</td>
				))}
			</tr>
		),
	);
};

export type DataTableStateRowProps =
	useRender.ComponentProps<"tr">;

/** A row across every column for the body's state, such as the empty state or an `ErrorMessage`. */
export const StateRow = ({
	render,
	ref,
	children,
	...props
}: DataTableStateRowProps): ReactElement => {
	const { table } = useDataTable();
	return useRender({
		defaultTagName: "tr",
		render,
		ref,
		props: {
			...props,
			children: (
				<td
					colSpan={table.getAllLeafColumns().length}
					className={style.stateCell}>
					{children}
				</td>
			),
		},
	});
};

export type DataTableErrorMessageProps =
	useRender.ComponentProps<"span">;

/** What a failed first load says, as an alert. */
export const ErrorMessage = ({
	render,
	className,
	ref,
	...props
}: DataTableErrorMessageProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			role: "alert",
			...props,
			className: clsx(style.errorState, className),
		},
	});
