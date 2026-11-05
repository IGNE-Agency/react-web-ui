import type { ReactTable } from "@tanstack/react-table";
import { type Context, createContext } from "react";
import type { RowSelectionView } from "../lib/hooks/use-row-selection.ts";
import { useRequiredContext } from "../lib/use-required-context.ts";
import type { QueryStatus } from "./resolve-view.ts";
import type { DataTableFeatures } from "./table-features.ts";

/**
 * What the `DataTable` parts share. `table` is held as `unknown` because a
 * table instance is invariant in its row type; {@link useDataTable}
 * re-narrows it.
 */
export type DataTableContextValue = Readonly<{
	table: unknown;
	status: QueryStatus;
	isFetching: boolean;
	/** Refetches; the stale overlay and the refresh-failed notice offer it as a retry. */
	onRetry?: () => void;
	/** Present only on a selectable table; the selection parts require it. */
	selection?: RowSelectionView;
}>;

/** The provider `DataTable.Root` renders. */
export const DataTableContext: Context<DataTableContextValue | null> =
	createContext<DataTableContextValue | null>(null);

export type DataTableState<
	TData extends Record<string, unknown>,
> = Omit<DataTableContextValue, "table"> &
	Readonly<{ table: ReactTable<DataTableFeatures, TData> }>;

/**
 * Reads the enclosing `DataTable.Root` and re-narrows its table instance to the
 * caller's row type. Pass the same `TData` the table was built with.
 *
 * @example
 * const { table } = useDataTable<Appointment>();
 * const rows = table.getRowModel().rows;
 */
export const useDataTable = <
	TData extends Record<string, unknown> = Record<
		string,
		unknown
	>,
>(): DataTableState<TData> => {
	const context = useRequiredContext(
		DataTableContext,
		"DataTable.* must be rendered inside <DataTable.Root>.",
	);
	return {
		...context,
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion -- a table instance is invariant in its row type, so the context holds it erased and this hook restores the type the caller built it with
		table: context.table as ReactTable<
			DataTableFeatures,
			TData
		>,
	};
};
