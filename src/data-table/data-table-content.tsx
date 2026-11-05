import ArrowDownwardIcon from "@material-design-icons/svg/outlined/arrow_downward.svg?react";
import ArrowUpwardIcon from "@material-design-icons/svg/outlined/arrow_upward.svg?react";
import UnfoldMoreIcon from "@material-design-icons/svg/outlined/unfold_more.svg?react";
import type {
	Column,
	Row,
	SortDirection,
} from "@tanstack/react-table";
import { clsx } from "clsx";
import { Fragment, type ReactNode } from "react";
import { Button } from "../components/button/button.tsx";
import { Icon } from "../components/icon/icon.tsx";
import { Skeleton } from "../components/skeleton/skeleton.tsx";
import { Stale } from "../components/stale/stale.tsx";
import { useDataTable } from "./data-table-context.tsx";
import { resolveView } from "./resolve-view.ts";
import type {
	DataTableColumnMeta,
	DataTableFeatures,
} from "./table-features.ts";
import { useStickyOffsets } from "./use-sticky-offsets.ts";
import style from "./data-table.module.scss";

const SORT_ICON = {
	asc: ArrowUpwardIcon,
	desc: ArrowDownwardIcon,
} as const;

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

type Pin = Readonly<{
	side: "start" | "end";
	/** Position within the group pinned to that edge, in column order. */
	index: number;
}>;

/**
 * The props a column's layout options put on its header and body cells: the
 * data attributes the stylesheet reads, plus the inset a pinned cell sits at.
 *
 * @example
 * <td {...cellProps(cell.column.columnDef.meta, pins.get(cell.column.id))} />
 */
const cellProps = (
	meta: DataTableColumnMeta | undefined,
	pin: Pin | undefined,
) => ({
	"data-fit": meta?.fit ? "true" : undefined,
	"data-numeric": meta?.numeric ? "true" : undefined,
	"data-sticky": pin?.side,
	style:
		pin === undefined
			? undefined
			: pin.side === "start"
				? {
						insetInlineStart: `var(--table-sticky-inset-${pin.index}, 0px)`,
					}
				: {
						insetInlineEnd: `var(--table-sticky-end-${pin.index}, 0px)`,
					},
});

/**
 * Maps each pinned column's id to the edge it sits at and its position in that
 * edge's group.
 *
 * @example
 * columnPins(columns).get("actions"); // -> { side: "end", index: 0 }
 */
const columnPins = <TData extends Record<string, unknown>>(
	columns: ReadonlyArray<Column<DataTableFeatures, TData>>,
): ReadonlyMap<string, Pin> =>
	new Map(
		(["start", "end"] as const).flatMap(side =>
			columns
				.filter(
					column => column.columnDef.meta?.sticky === side,
				)
				.map(
					(column, index) =>
						[column.id, { side, index }] as const,
				),
		),
	);

export type DataTableContentProps<
	TData extends Record<string, unknown>,
> = Readonly<{
	/**
	 * Renders the expanded content for a row (TanStack expansion API). The
	 * returned node is placed in a full-width cell beneath the row.
	 */
	renderSubRow?: (
		row: Row<DataTableFeatures, TData>,
	) => ReactNode;
	/** The body when the query matched nothing, such as "No declarations yet." or an `EmptyMessage`. */
	emptyState: ReactNode;
	/** What a failed fetch says, as the body or above rows still on screen, such as "The declarations could not be loaded." */
	errorLabel: string;
	/** What is announced while the first page loads, as the table's caption, such as "Loading declarations". */
	loadingLabel: string;
	/** What the overlay says when a refresh runs long, such as "This is taking longer than usual." */
	slowLabel: ReactNode;
	/** The retry's label, such as "Try again". */
	retryLabel: string;
	className?: string;
}>;

/**
 * Renders the `<table>` header and body from the enclosing `DataTable`
 * instance, resolving the injected query state into one of four bodies:
 * loading, error, empty, or ready.
 */
export const DataTableContent = <
	TData extends Record<string, unknown>,
>({
	renderSubRow,
	emptyState,
	errorLabel,
	loadingLabel,
	slowLabel,
	retryLabel,
	className,
}: DataTableContentProps<TData>): ReactNode => {
	const { table, status, isFetching, onRetry } =
		useDataTable<TData>();
	const rows = table.getRowModel().rows;
	const leafColumns = table.getAllLeafColumns();
	const columnCount = leafColumns.length;
	const pins = columnPins(leafColumns);
	const pinCount = (side: "start" | "end") =>
		[...pins.values()].filter(pin => pin.side === side)
			.length;
	const startPinCount = pinCount("start");
	const endPinCount = pinCount("end");
	const frameRef = useStickyOffsets(
		[...pins]
			.map(([id, pin]) => `${id}:${pin.side}`)
			.join(","),
	);
	const { view, stale, refreshFailed } = resolveView({
		status,
		isFetching,
		hasRows: rows.length > 0,
	});

	return (
		<>
			{refreshFailed ? (
				<div className={style.refreshFailed} role="alert">
					<span>{errorLabel}</span>
					{onRetry ? (
						<Button
							variant="tertiary"
							size="sm"
							onClick={onRetry}>
							{retryLabel}
						</Button>
					) : null}
				</div>
			) : null}
			<div ref={frameRef} className={style.scrollFrame}>
				<Stale.Root busy={stale} className={style.stale}>
					<Stale.Content className={style.stale}>
						<div
							data-scroller
							className={clsx(
								style.contentWrap,
								className,
							)}>
							<table
								className={style.table}
								aria-busy={
									view === "loading" ? "true" : undefined
								}>
								{view === "loading" ? (
									<caption className={style.busyCaption}>
										{loadingLabel}
									</caption>
								) : null}
								<thead className={style.thead}>
									{table
										.getHeaderGroups()
										.map(headerGroup => (
											<tr key={headerGroup.id}>
												{headerGroup.headers.map(header => {
													const sorted =
														header.column.getIsSorted();
													return (
														<th
															key={header.id}
															scope="col"
															colSpan={header.colSpan}
															className={style.th}
															aria-sort={ariaSort(sorted)}
															{...cellProps(
																header.column.columnDef
																	.meta,
																pins.get(header.column.id),
															)}>
															{header.isPlaceholder ? null : header.column.getCanSort() ? (
																<button
																	type="button"
																	className={
																		style.sortToggle
																	}
																	onClick={() => {
																		header.column.toggleSorting();
																		table.setPageIndex(0);
																	}}>
																	<table.FlexRender
																		header={header}
																	/>
																	<Icon
																		svg={
																			sorted === false
																				? UnfoldMoreIcon
																				: SORT_ICON[sorted]
																		}
																		label=""
																		className={
																			sorted === false
																				? style.sortIconIdle
																				: undefined
																		}
																	/>
																</button>
															) : (
																<table.FlexRender
																	header={header}
																/>
															)}
														</th>
													);
												})}
											</tr>
										))}
								</thead>
								<tbody>
									{view === "ready" ? (
										rows.map(row => (
											<Fragment key={row.id}>
												<tr
													className={style.row}
													data-stripe={
														row.index % 2 === 1
															? "true"
															: undefined
													}>
													{row.getAllCells().map(cell => (
														<td
															key={cell.id}
															className={style.td}
															{...cellProps(
																cell.column.columnDef.meta,
																pins.get(cell.column.id),
															)}>
															<table.FlexRender
																cell={cell}
															/>
														</td>
													))}
												</tr>
												{renderSubRow &&
												row.getIsExpanded() ? (
													<tr className={style.subRow}>
														{startPinCount > 0 ? (
															<td
																className={style.td}
																colSpan={startPinCount}
																data-sticky="start"
																style={{
																	insetInlineStart: 0,
																}}
															/>
														) : null}
														<td
															colSpan={
																columnCount -
																startPinCount -
																endPinCount
															}>
															{renderSubRow(row)}
														</td>
														{endPinCount > 0 ? (
															<td
																className={style.td}
																colSpan={endPinCount}
																data-sticky="end"
																style={{
																	insetInlineEnd: 0,
																}}
															/>
														) : null}
													</tr>
												) : null}
											</Fragment>
										))
									) : view === "loading" ? (
										<PlaceholderRows
											rowCount={
												table.state.pagination.pageSize
											}
											columns={leafColumns.map(column => ({
												id: column.id,
												meta: column.columnDef.meta,
												pin: pins.get(column.id),
											}))}
										/>
									) : (
										<tr>
											<td
												colSpan={columnCount}
												className={style.stateCell}>
												<StateBody
													view={view}
													emptyState={emptyState}
													errorLabel={errorLabel}
												/>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</Stale.Content>
					<Stale.Overlay className={style.staleOverlay}>
						<Stale.Message>{slowLabel}</Stale.Message>
						{onRetry ? (
							<Stale.Retry onRetry={onRetry}>
								{retryLabel}
							</Stale.Retry>
						) : null}
					</Stale.Overlay>
				</Stale.Root>
			</div>
		</>
	);
};

type PlaceholderRowsProps = Readonly<{
	/** How many placeholder rows to draw — one per row the page will hold. */
	rowCount: number;
	columns: ReadonlyArray<
		Readonly<{
			id: string;
			meta: DataTableColumnMeta | undefined;
			pin: Pin | undefined;
		}>
	>;
}>;

/**
 * Inert placeholder rows for a first load: one row per row of the selected page
 * size. A column that declares a `placeholderCell` draws it; every other column
 * gets a skeleton bar.
 */
const PlaceholderRows = ({
	rowCount,
	columns,
}: PlaceholderRowsProps) => (
	<>
		{Array.from({ length: rowCount }, (_, index) => (
			<tr
				key={index}
				className={style.row}
				data-stripe={index % 2 === 1 ? "true" : undefined}
				inert>
				{columns.map(column => (
					<td
						key={column.id}
						className={style.td}
						{...cellProps(column.meta, column.pin)}>
						{column.meta?.placeholderCell?.() ?? (
							<Skeleton className={style.skeletonBar} />
						)}
					</td>
				))}
			</tr>
		))}
	</>
);

type StateBodyProps = Readonly<{
	view: "error" | "empty";
	emptyState: ReactNode;
	errorLabel: string;
}>;

const StateBody = ({
	view,
	emptyState,
	errorLabel,
}: StateBodyProps) => {
	if (view === "error") {
		return (
			<span className={style.errorState} role="alert">
				{errorLabel}
			</span>
		);
	}
	return <>{emptyState}</>;
};
