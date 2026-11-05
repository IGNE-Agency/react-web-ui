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

type SelectionMarks = Readonly<{
	checkIcon: ReactNode;
	indeterminateIcon: ReactNode;
}>;

const PageCheckbox = ({
	label,
	checkIcon,
	indeterminateIcon,
}: SelectionMarks & Readonly<{ label: string }>) => {
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

	const indeterminate =
		selectedOnPage.length > 0 && !allOnPage;

	return (
		<Checkbox.Control
			aria-label={label}
			checked={allOnPage}
			indeterminate={indeterminate}
			onCheckedChange={checked => {
				for (const id of pageIds) {
					selection.toggleRow(
						id,
						checked,
						table.getRowCount(),
					);
				}
			}}>
			<Checkbox.Indicator>
				{indeterminate ? indeterminateIcon : checkIcon}
			</Checkbox.Indicator>
		</Checkbox.Control>
	);
};

const RowCheckbox = ({
	rowId,
	label,
	checkIcon,
}: Readonly<{
	rowId: string;
	label: string;
	checkIcon: ReactNode;
}>) => {
	const { table } = useDataTable();
	const selection = useSelection();
	return (
		<Checkbox.Control
			aria-label={label}
			checked={selection.isRowSelected(rowId)}
			onCheckedChange={checked => {
				selection.toggleRow(
					rowId,
					checked,
					table.getRowCount(),
				);
			}}>
			<Checkbox.Indicator>{checkIcon}</Checkbox.Indicator>
		</Checkbox.Control>
	);
};

export type SelectionColumnOptions = Readonly<{
	sticky?: DataTableColumnMeta["sticky"];
	/** The header checkbox's name, such as "Select page". */
	selectPageLabel: string;
	/** Each row checkbox's name, such as "Select row". */
	selectRowLabel: string;
	/** The mark a checked box shows, such as a tick. */
	checkIcon: ReactNode;
	/** The mark the page checkbox shows while only some rows on the page are selected, such as a dash. */
	indeterminateIcon: ReactNode;
}>;

/**
 * The selection column: a page checkbox in the header, three-state over the
 * current page, and a row checkbox per row, collapsed to content width. It
 * sits with the table's other leading control columns.
 *
 * @example
 * const columns = [
 * 	selectionColumn<Declaration>({ sticky: "start", selectPageLabel: "Select page", selectRowLabel: "Select row", checkIcon: <CheckIcon />, indeterminateIcon: <RemoveIcon /> }),
 * 	...dataColumns,
 * ];
 */
export const selectionColumn = <
	TRow extends Record<string, unknown>,
>({
	sticky,
	selectPageLabel,
	selectRowLabel,
	checkIcon,
	indeterminateIcon,
}: SelectionColumnOptions): ColumnDef<
	DataTableFeatures,
	TRow
> => ({
	id: "select",
	meta: {
		fit: true,
		sticky,
		placeholderCell: () => (
			<Checkbox.Control aria-label={selectRowLabel}>
				<Checkbox.Indicator>{checkIcon}</Checkbox.Indicator>
			</Checkbox.Control>
		),
	},
	header: () => (
		<PageCheckbox
			label={selectPageLabel}
			checkIcon={checkIcon}
			indeterminateIcon={indeterminateIcon}
		/>
	),
	cell: ({ row }) => (
		<RowCheckbox
			rowId={row.id}
			label={selectRowLabel}
			checkIcon={checkIcon}
		/>
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
