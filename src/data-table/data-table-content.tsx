import type { Row as TableRow } from "@tanstack/react-table";
import { Fragment, type ReactNode } from "react";
import { Button } from "../components/button/button.tsx";
import { useCopy } from "../components/copy-provider/index.ts";
import { useIcons } from "../components/icon-provider/index.ts";
import { Stale } from "../components/stale/stale.tsx";
import { useDataTable } from "./data-table-context.tsx";
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
	SortIcon,
	StaleOverlay,
	StateRow,
	SubRow,
	Table,
	useDataTableView,
} from "./data-table-parts.tsx";
import type { DataTableFeatures } from "./table-features.ts";

export type DataTableContentProps<
	TData extends Record<string, unknown>,
> = Readonly<{
	/**
	 * Renders the expanded content for a row (TanStack expansion API). The
	 * returned node is placed in a full-width cell beneath the row.
	 */
	renderSubRow?: (
		row: TableRow<DataTableFeatures, TData>,
	) => ReactNode;
	/** The body when the query matched nothing, such as "No invoices yet." or an `EmptyMessage`. */
	emptyState: ReactNode;
	/** What a failed fetch says, as the body or above rows still on screen, such as "The invoices could not be loaded." */
	errorLabel: string;
	/** What is announced while the first page loads, as the table's caption, such as "Loading invoices". */
	loadingLabel: string;
	/** Set on the `Scroller`. */
	className?: string;
}>;

/**
 * The whole table from the enclosing `DataTable` instance: its headers, with a
 * sort toggle on every sortable column, and one of four bodies resolved from
 * the injected query state: loading, error, empty, or ready. Compose the parts
 * where the table needs other markup.
 */
export const DataTableContent = <
	TData extends Record<string, unknown>,
>({
	renderSubRow,
	emptyState,
	errorLabel,
	loadingLabel,
	className,
}: DataTableContentProps<TData>): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const { table, onRetry } = useDataTable<TData>();
	const { view } = useDataTableView();

	return (
		<>
			<RefreshFailed>
				<span>{errorLabel}</span>
				{onRetry ? (
					<Button
						variant="tertiary"
						size="sm"
						onClick={onRetry}>
						{copy.retry}
					</Button>
				) : null}
			</RefreshFailed>
			<Frame>
				<Scroller className={className}>
					<Table>
						<LoadingCaption>{loadingLabel}</LoadingCaption>
						<Head>
							{table.getHeaderGroups().map(headerGroup => (
								<HeaderRow key={headerGroup.id}>
									{headerGroup.headers.map(header => (
										<HeaderCell
											key={header.id}
											header={header}>
											{header.isPlaceholder ? null : header.column.getCanSort() ? (
												<SortButton header={header}>
													<table.FlexRender
														header={header}
													/>
													<SortIcon header={header}>
														{sort =>
															sort === "asc"
																? icons.sortAscending
																: sort === "desc"
																	? icons.sortDescending
																	: icons.unsorted
														}
													</SortIcon>
												</SortButton>
											) : (
												<table.FlexRender header={header} />
											)}
										</HeaderCell>
									))}
								</HeaderRow>
							))}
						</Head>
						<Body>
							{view === "ready" ? (
								table.getRowModel().rows.map(row => (
									<Fragment key={row.id}>
										<Row row={row}>
											{row.getAllCells().map(cell => (
												<Cell key={cell.id} cell={cell} />
											))}
										</Row>
										{renderSubRow && row.getIsExpanded() ? (
											<SubRow>{renderSubRow(row)}</SubRow>
										) : null}
									</Fragment>
								))
							) : view === "loading" ? (
								<PlaceholderRows />
							) : (
								<StateRow>
									{view === "error" ? (
										<ErrorMessage>
											{errorLabel}
										</ErrorMessage>
									) : (
										emptyState
									)}
								</StateRow>
							)}
						</Body>
					</Table>
				</Scroller>
				<StaleOverlay>
					<Stale.Message>{copy.table.slow}</Stale.Message>
					{onRetry ? (
						<Stale.Retry onRetry={onRetry}>
							{copy.retry}
						</Stale.Retry>
					) : null}
				</StaleOverlay>
			</Frame>
		</>
	);
};
