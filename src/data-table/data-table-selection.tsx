import { useRender } from "@base-ui/react/use-render";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	createContext,
	type ReactElement,
	type ReactNode,
	type RefObject,
	useRef,
} from "react";
import { Button } from "../components/button/button.tsx";
import { Checkbox } from "../components/checkbox-field/checkbox.tsx";
import { useCopy } from "../components/copy-provider/index.ts";
import { useIcons } from "../components/icon-provider/index.ts";
import { usePresence } from "../lib/hooks/use-presence.ts";
import type { RowSelectionView } from "../lib/hooks/use-row-selection.ts";
import { useRequiredContext } from "../lib/use-required-context.ts";
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

const PageCheckbox = () => {
	const copy = useCopy();
	const icons = useIcons();
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
			aria-label={copy.table.selectPage}
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
				{indeterminate ? icons.indeterminate : icons.check}
			</Checkbox.Indicator>
		</Checkbox.Control>
	);
};

const PlaceholderCheckbox = () => {
	const copy = useCopy();
	const icons = useIcons();
	return (
		<Checkbox.Control aria-label={copy.table.selectRow}>
			<Checkbox.Indicator>{icons.check}</Checkbox.Indicator>
		</Checkbox.Control>
	);
};

const RowCheckbox = ({
	rowId,
}: Readonly<{ rowId: string }>) => {
	const copy = useCopy();
	const icons = useIcons();
	const { table } = useDataTable();
	const selection = useSelection();
	return (
		<Checkbox.Control
			aria-label={copy.table.selectRow}
			checked={selection.isRowSelected(rowId)}
			onCheckedChange={checked => {
				selection.toggleRow(
					rowId,
					checked,
					table.getRowCount(),
				);
			}}>
			<Checkbox.Indicator>{icons.check}</Checkbox.Indicator>
		</Checkbox.Control>
	);
};

export type SelectionColumnOptions = Readonly<{
	sticky?: DataTableColumnMeta["sticky"];
}>;

/**
 * The selection column: a page checkbox in the header, three-state over the
 * current page, and a row checkbox per row, collapsed to content width. It
 * sits with the table's other leading control columns.
 *
 * @example
 * const columns = [
 * 	selectionColumn<Invoice>({ sticky: "start" }),
 * 	...dataColumns,
 * ];
 */
export const selectionColumn = <
	TRow extends Record<string, unknown>,
>({ sticky }: SelectionColumnOptions = {}): ColumnDef<
	DataTableFeatures,
	TRow
> => ({
	id: "select",
	meta: {
		fit: true,
		sticky,
		placeholderCell: () => <PlaceholderCheckbox />,
	},
	header: () => <PageCheckbox />,
	cell: ({ row }) => <RowCheckbox rowId={row.id} />,
});

type SelectionBarState = Readonly<{
	selection: RowSelectionView;
	totalRows: number;
	selected: number;
	focusBar: () => void;
	clearRef: RefObject<HTMLButtonElement | null>;
}>;

const SelectionBarContext =
	createContext<SelectionBarState | null>(null);

const useSelectionBar = (): SelectionBarState =>
	useRequiredContext(
		SelectionBarContext,
		"DataTable.SelectionBar.* must be rendered inside <DataTable.SelectionBar.Root>.",
	);

export type DataTableSelectionBarRootProps =
	useRender.ComponentProps<"div"> &
		Readonly<{
			/** How many rows match, selected or not. */
			totalRows: number;
		}>;

/**
 * The bar above a selectable table, holding the selection for the parts inside
 * it and marked `data-selected` while any row is. It sits in a container that
 * lets it wrap where it is narrow.
 *
 * @example
 * <DataTable.SelectionBar.Root totalRows={30}>…</DataTable.SelectionBar.Root>
 */
const SelectionBarRoot = ({
	totalRows,
	render,
	className,
	ref,
	...props
}: DataTableSelectionBarRootProps): ReactNode => {
	const selection = useSelection();
	const selected = selection.count(totalRows);
	const barRef = useRef<HTMLDivElement>(null);
	const clearRef = useRef<HTMLButtonElement>(null);
	const element = useRender({
		defaultTagName: "div",
		render,
		ref: ref === undefined ? barRef : [barRef, ref],
		props: {
			tabIndex: -1,
			...props,
			"data-selected": selected > 0 || undefined,
			className: clsx(style.selectionBar, className),
		},
	});

	return (
		<SelectionBarContext
			value={{
				selection,
				totalRows,
				selected,
				focusBar: () => barRef.current?.focus(),
				clearRef,
			}}>
			<div className={style.selectionContainer}>
				{element}
			</div>
		</SelectionBarContext>
	);
};

export type DataTableSelectionBarSummaryProps = Omit<
	useRender.ComponentProps<"span">,
	"children"
> &
	Readonly<{
		/** What the bar says while nothing is selected, such as "30 invoices". */
		total?: ReactNode;
	}>;

/**
 * What the bar shows, hidden from assistive tech: the total while nothing is
 * selected, crossing over to the selected count, at the width of the longest
 * count.
 *
 * @example
 * <DataTable.SelectionBar.Summary total="30 invoices" />
 */
const SelectionBarSummary = ({
	total,
	render,
	className,
	ref,
	...props
}: DataTableSelectionBarSummaryProps): ReactElement => {
	const copy = useCopy();
	const count = copy.table.selected;
	const { totalRows, selected } = useSelectionBar();
	return useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.selectionSummary, className),
			children: (
				<>
					<span className={style.selectionTotal}>
						{total}
					</span>
					{totalRows > 0 && (
						<>
							<span className={style.selectionCount}>
								{count(selected, totalRows)}
							</span>
							<span className={style.selectionMeasure}>
								{count(totalRows, totalRows)}
							</span>
						</>
					)}
				</>
			),
		},
	});
};

export type DataTableSelectionBarStatusProps =
	DataTableSelectionBarSummaryProps;

/**
 * The hidden live region that announces the total while nothing is selected,
 * and the selected count once something is.
 *
 * @example
 * <DataTable.SelectionBar.Status total="30 invoices" />
 */
const SelectionBarStatus = ({
	total,
	render,
	className,
	ref,
	...props
}: DataTableSelectionBarStatusProps): ReactElement => {
	const copy = useCopy();
	const count = copy.table.selected;
	const { totalRows, selected } = useSelectionBar();
	return useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			role: "status",
			...props,
			className: clsx(style.selectionStatus, className),
			children:
				selected === 0 ? total : count(selected, totalRows),
		},
	});
};

export type DataTableSelectionBarActionsProps =
	useRender.ComponentProps<"div">;

/**
 * The row of actions on the selection, `Clear`, `SelectAll` and `Bulk`, out of
 * reach while nothing is selected.
 *
 * @example
 * <DataTable.SelectionBar.Actions>
 * 	<DataTable.SelectionBar.Clear render={<Button variant="tertiary">Clear selection</Button>} />
 * </DataTable.SelectionBar.Actions>
 */
const SelectionBarActions = ({
	render,
	className,
	ref,
	...props
}: DataTableSelectionBarActionsProps): ReactElement => {
	const { selected } = useSelectionBar();
	return useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			inert: selected === 0,
			className: clsx(style.selectionActions, className),
		},
	});
};

/** The props of a selection bar button part: the button's own, but the click, which the part owns. */
type SelectionButtonProps = Omit<
	ComponentPropsWithRef<"button">,
	"onClick" | "type" | "children"
> &
	Readonly<{
		/** The button to render, such as `<Button variant="tertiary">Clear selection</Button>`. */
		render: useRender.RenderProp;
	}>;

export type DataTableSelectionBarClearProps =
	SelectionButtonProps;

/**
 * The button that clears the selection and returns focus to the bar. It
 * renders whichever button it is given.
 *
 * @example
 * <DataTable.SelectionBar.Clear render={<Button variant="tertiary">Clear selection</Button>} />
 */
const SelectionBarClear = ({
	render,
	ref,
	...props
}: DataTableSelectionBarClearProps): ReactElement => {
	const { selection, focusBar, clearRef } =
		useSelectionBar();
	return useRender({
		render,
		ref: ref === undefined ? clearRef : [clearRef, ref],
		props: {
			...props,
			type: "button",
			onClick: () => {
				selection.clear();
				focusBar();
			},
		},
	});
};

export type DataTableSelectionBarSelectAllProps =
	SelectionButtonProps;

/**
 * The offer to select every matching row, fading in while some but not all are
 * selected, then handing focus to `Clear`. It renders whichever button it is
 * given.
 *
 * @example
 * <DataTable.SelectionBar.SelectAll render={<Button variant="tertiary">Select all 30</Button>} />
 */
const SelectionBarSelectAll = ({
	render,
	className,
	ref,
	...props
}: DataTableSelectionBarSelectAllProps): ReactElement | null => {
	const { selection, totalRows, selected, clearRef } =
		useSelectionBar();
	const canSelectAll = selected > 0 && selected < totalRows;
	const selectAllRef = useRef<HTMLButtonElement>(null);
	const presence = usePresence(canSelectAll, selectAllRef);
	return useRender({
		render,
		ref:
			ref === undefined
				? selectAllRef
				: [selectAllRef, ref],
		enabled: presence.mounted,
		props: {
			...props,
			...presence.props,
			type: "button",
			inert: !canSelectAll,
			className: clsx(style.selectionSelectAll, className),
			onClick: () => {
				selection.selectAllMatching();
				clearRef.current?.focus();
			},
		},
	});
};

export type DataTableSelectionBarBulkProps =
	useRender.ComponentProps<"div">;

/**
 * The caller's bulk actions for the selection, at the end of the `Actions`.
 *
 * @example
 * <DataTable.SelectionBar.Bulk><Button>Export</Button></DataTable.SelectionBar.Bulk>
 */
const SelectionBarBulk = ({
	render,
	className,
	ref,
	...props
}: DataTableSelectionBarBulkProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.selectionBulk, className),
		},
	});

export type DataTableSelectionBarProps = Readonly<{
	/** What the bar says while nothing is selected, such as "30 invoices". */
	total?: ReactNode;
	totalRows: number;
	/** Bulk actions to offer for the current selection. */
	children?: ReactNode;
	className?: string;
}>;

const SelectionBarPrefab = ({
	total,
	totalRows,
	children,
	className,
}: DataTableSelectionBarProps): ReactNode => {
	const copy = useCopy();

	return (
		<SelectionBarRoot
			totalRows={totalRows}
			className={className}>
			<SelectionBarSummary total={total} />
			<SelectionBarStatus total={total} />
			<SelectionBarActions>
				<SelectionBarClear
					render={
						<Button variant="tertiary">
							{copy.table.clearSelection}
						</Button>
					}
				/>
				<SelectionBarSelectAll
					render={
						<Button variant="tertiary">
							{copy.table.selectAll(totalRows)}
						</Button>
					}
				/>
				<SelectionBarBulk>{children}</SelectionBarBulk>
			</SelectionBarActions>
		</SelectionBarRoot>
	);
};

/** The parts of a selection bar, hanging off its prefab. */
export type DataTableSelectionBarParts =
	typeof SelectionBarPrefab &
		Readonly<{
			Root: typeof SelectionBarRoot;
			Summary: typeof SelectionBarSummary;
			Status: typeof SelectionBarStatus;
			Actions: typeof SelectionBarActions;
			Clear: typeof SelectionBarClear;
			SelectAll: typeof SelectionBarSelectAll;
			Bulk: typeof SelectionBarBulk;
		}>;

/**
 * The bar above a selectable table: the total while nothing is selected, then
 * the selected count, a clear button, the offer to select every matching row,
 * and the caller's bulk actions. Its parts compose another bar.
 *
 * @example
 * <DataTable.SelectionBar
 * 	totalRows={30}
 * 	total="30 invoices"
 * />
 */
export const DataTableSelectionBar: DataTableSelectionBarParts =
	Object.assign(SelectionBarPrefab, {
		Root: SelectionBarRoot,
		Summary: SelectionBarSummary,
		Status: SelectionBarStatus,
		Actions: SelectionBarActions,
		Clear: SelectionBarClear,
		SelectAll: SelectionBarSelectAll,
		Bulk: SelectionBarBulk,
	});
