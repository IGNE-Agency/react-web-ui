import { useReducer } from "react";

/** What a selection asks the server to act on: the checked ids, or every matching row but the excluded ones. */
export type RowSelectionRequest =
	| Readonly<{ mode: "ids"; ids: readonly string[] }>
	| Readonly<{
			mode: "allMatching";
			excludedIds: readonly string[];
	  }>;

/** The marked row ids: selected ones, or, while `allMatching`, excluded ones. */
export type SelectionState = Readonly<{
	allMatching: boolean;
	rowSelection: Readonly<Record<string, boolean>>;
}>;

export type SelectionAction =
	| Readonly<{
			type: "toggleRow";
			rowId: string;
			selected: boolean;
			totalRows: number;
	  }>
	| Readonly<{ type: "allMatching" }>
	| Readonly<{ type: "clear" }>;

const EMPTY_SELECTION: SelectionState = {
	allMatching: false,
	rowSelection: {},
};

/**
 * Applies one selection action. While every matching row is selected, the
 * marked ids are exclusions, and excluding every row clears the selection.
 *
 * @example
 * selectionReducer(state, { type: "toggleRow", rowId: "a", selected: true, totalRows: 20 });
 */
export const selectionReducer = (
	state: SelectionState,
	action: SelectionAction,
): SelectionState => {
	if (action.type === "allMatching") {
		return { allMatching: true, rowSelection: {} };
	}
	if (action.type === "clear") {
		return EMPTY_SELECTION;
	}
	const marked = state.allMatching
		? !action.selected
		: action.selected;
	const others = Object.fromEntries(
		Object.entries(state.rowSelection).filter(
			([id]) => id !== action.rowId,
		),
	);
	const rowSelection = marked
		? { ...others, [action.rowId]: true }
		: others;
	if (
		state.allMatching &&
		Object.keys(rowSelection).length >= action.totalRows
	) {
		return EMPTY_SELECTION;
	}
	return { ...state, rowSelection };
};

const markedIds = (
	state: SelectionState,
): readonly string[] =>
	Object.keys(state.rowSelection).filter(
		id => state.rowSelection[id],
	);

/**
 * How many rows a selection holds, out of `totalRows` matching rows.
 *
 * @example
 * selectionCount({ allMatching: true, rowSelection: { a: true } }, 20); // 19
 */
export const selectionCount = (
	state: SelectionState,
	totalRows: number,
): number =>
	state.allMatching
		? Math.max(totalRows - markedIds(state).length, 0)
		: markedIds(state).length;

/**
 * The request a selection sends to the server, or `null` when nothing is selected.
 *
 * @example
 * selectionRequest({ allMatching: false, rowSelection: { a: true } }); // { mode: "ids", ids: ["a"] }
 */
export const selectionRequest = (
	state: SelectionState,
): RowSelectionRequest | null => {
	const ids = markedIds(state);
	return state.allMatching
		? { mode: "allMatching", excludedIds: ids }
		: ids.length > 0
			? { mode: "ids", ids }
			: null;
};

/** The row selection model returned by {@link useRowSelection}. */
export type RowSelectionView = Readonly<{
	allMatching: boolean;
	isRowSelected: (rowId: string) => boolean;
	toggleRow: (
		rowId: string,
		selected: boolean,
		totalRows: number,
	) => void;
	selectAllMatching: () => void;
	clear: () => void;
	count: (totalRows: number) => number;
	request: () => RowSelectionRequest | null;
}>;

/**
 * Holds a server-side row selection: checked ids, or every matching row
 * minus the unchecked ones once the reader selects all matching.
 *
 * @example
 * const selection = useRowSelection();
 * selection.toggleRow("a", true, totalRows);
 * exportRows(selection.request());
 */
export const useRowSelection = (): RowSelectionView => {
	const [state, dispatch] = useReducer(
		selectionReducer,
		EMPTY_SELECTION,
	);

	return {
		allMatching: state.allMatching,
		isRowSelected: rowId =>
			state.allMatching
				? !state.rowSelection[rowId]
				: Boolean(state.rowSelection[rowId]),
		toggleRow: (rowId, selected, totalRows) => {
			dispatch({
				type: "toggleRow",
				rowId,
				selected,
				totalRows,
			});
		},
		selectAllMatching: () => {
			dispatch({ type: "allMatching" });
		},
		clear: () => {
			dispatch({ type: "clear" });
		},
		count: totalRows => selectionCount(state, totalRows),
		request: () => selectionRequest(state),
	};
};
