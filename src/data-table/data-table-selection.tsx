import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { type ReactNode, useRef } from "react";
import { Button } from "../components/button/button.tsx";
import { Checkbox } from "../components/checkbox-field/checkbox.tsx";
import { usePresence } from "../lib/hooks/use-presence.ts";
import type { RowSelectionView } from "../lib/hooks/use-row-selection.ts";
import { useDataTable } from "./data-table-context.tsx";
import type {
	DataTableColumnMeta,
	DataTableFeatures,
} from "./table-features.ts";
import style from "./data-table.module.scss";

const useSelection = (): RowSelectionView => {
	const { selection } = useDataTable();
	if (!selection) {
		throw new Error(
			"The selection parts require <DataTable.Root selection={…}>.",
		);
	}
	return selection;
};

const PageCheckbox = ({
	label,
}: Readonly<{ label: string }>) => {
	const { table } = useDataTable();
	const selection = useSelection();
	const pageIds = table
		.getRowModel()
		.rows.map(row => row.id);
	const selectedOnPage = pageIds.filter(id =>
		selection.isRowSelected(id),
	);
	const allOnPage =
		pageIds.length > 0 &&
		selectedOnPage.length === pageIds.length;

	return (
		<Checkbox
			aria-label={label}
			checked={allOnPage}
			indeterminate={
				selectedOnPage.length > 0 && !allOnPage
			}
			onCheckedChange={checked => {
				for (const id of pageIds) {
					selection.toggleRow(
						id,
						checked,
						table.getRowCount(),
					);
				}
			}}
		/>
	);
};

const RowCheckbox = ({
	rowId,
	label,
}: Readonly<{ rowId: string; label: string }>) => {
	const { table } = useDataTable();
	const selection = useSelection();
	return (
		<Checkbox
			aria-label={label}
			checked={selection.isRowSelected(rowId)}
			onCheckedChange={checked => {
				selection.toggleRow(
					rowId,
					checked,
					table.getRowCount(),
				);
			}}
		/>
	);
};

export type SelectionColumnOptions = Readonly<{
	sticky?: DataTableColumnMeta["sticky"];
	/** The header checkbox's name, such as "Select page". */
	selectPageLabel: string;
	/** Each row checkbox's name, such as "Select row". */
	selectRowLabel: string;
}>;

/**
 * The selection column: a page checkbox in the header, three-state over the
 * current page, and a row checkbox per row, collapsed to content width. It
 * sits with the table's other leading control columns.
 *
 * @example
 * const columns = [
 * 	selectionColumn<Declaration>({ sticky: "start", selectPageLabel: "Select page", selectRowLabel: "Select row" }),
 * 	...dataColumns,
 * ];
 */
export const selectionColumn = <
	TRow extends Record<string, unknown>,
>({
	sticky,
	selectPageLabel,
	selectRowLabel,
}: SelectionColumnOptions): ColumnDef<
	DataTableFeatures,
	TRow
> => ({
	id: "select",
	meta: {
		fit: true,
		sticky,
		placeholderCell: () => (
			<Checkbox aria-label={selectRowLabel} />
		),
	},
	header: () => <PageCheckbox label={selectPageLabel} />,
	cell: ({ row }) => (
		<RowCheckbox rowId={row.id} label={selectRowLabel} />
	),
});

export type DataTableSelectionBarProps = Readonly<{
	/** What the bar says while nothing is selected, such as "30 declarations". */
	total?: ReactNode;
	totalRows: number;
	/** How many of the matching rows are selected, such as "3 of 30 selected". */
	countLabel: (selected: number, total: number) => string;
	/** The button that clears the selection, such as "Clear selection". */
	clearLabel: string;
	/** The button that selects every matching row, such as "Select all 30". */
	selectAllLabel: (total: number) => string;
	/** Bulk actions to offer for the current selection. */
	children?: ReactNode;
	className?: string;
}>;

/**
 * The bar above a selectable table: the total while nothing is selected, then
 * the selected count, a clear button, the offer to select every matching row,
 * and the caller's bulk actions.
 */
export const DataTableSelectionBar = ({
	total,
	totalRows,
	countLabel,
	clearLabel,
	selectAllLabel,
	children,
	className,
}: DataTableSelectionBarProps): ReactNode => {
	const selection = useSelection();
	const selected = selection.count(totalRows);
	const empty = selected === 0;
	const barRef = useRef<HTMLDivElement>(null);
	const clearRef = useRef<HTMLButtonElement>(null);
	const canSelectAll = selected > 0 && selected < totalRows;
	const selectAllRef = useRef<HTMLButtonElement>(null);
	const selectAll = usePresence(canSelectAll, selectAllRef);

	return (
		<div className={style.selectionContainer}>
			<div
				ref={barRef}
				tabIndex={-1}
				className={clsx(style.selectionBar, className)}
				data-selected={!empty || undefined}>
				<span
					className={style.selectionSummary}
					aria-hidden>
					<span className={style.selectionTotal}>
						{total}
					</span>
					{totalRows > 0 && (
						<>
							<span className={style.selectionCount}>
								{countLabel(selected, totalRows)}
							</span>
							<span className={style.selectionMeasure}>
								{countLabel(totalRows, totalRows)}
							</span>
						</>
					)}
				</span>

				<span
					className={style.selectionStatus}
					role="status">
					{empty ? total : countLabel(selected, totalRows)}
				</span>

				<div
					className={style.selectionActions}
					inert={empty}>
					<Button
						ref={clearRef}
						variant="tertiary"
						onClick={() => {
							selection.clear();
							barRef.current?.focus();
						}}>
						{clearLabel}
					</Button>
					{selectAll.mounted && (
						<Button
							ref={selectAllRef}
							className={style.selectionSelectAll}
							variant="tertiary"
							inert={!canSelectAll}
							onClick={() => {
								selection.selectAllMatching();
								clearRef.current?.focus();
							}}
							{...selectAll.props}>
							{selectAllLabel(totalRows)}
						</Button>
					)}

					<div className={style.selectionBulk}>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};
