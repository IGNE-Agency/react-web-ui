/** The lifecycle status of the injected query, mirroring TanStack Query. */
export type QueryStatus = "pending" | "error" | "success";

/** Which body state `DataTable.Content` should render. */
export type TableView =
	| "loading"
	| "error"
	| "empty"
	| "ready";

export type ResolvedView = Readonly<{
	view: TableView;
	/**
	 * True when rendered rows are from a previous successful fetch while a
	 * background refetch is in flight. Drives the subtle "stale" affordance.
	 */
	stale: boolean;
	/**
	 * True when the fetch failed but earlier rows are still on screen, so the
	 * failure is reported alongside them instead of replacing the body.
	 */
	refreshFailed: boolean;
}>;

/**
 * Maps an injected query state to the single body view `DataTable.Content`
 * renders. Rows never unmount once they are on screen: a failure with rows
 * still present stays on the `"ready"` body and reports `refreshFailed`.
 *
 * @example
 * resolveView({ status: "success", isFetching: true, hasRows: true });
 * // => { view: "ready", stale: true, refreshFailed: false }
 */
export const resolveView = ({
	status,
	isFetching,
	hasRows,
}: Readonly<{
	status: QueryStatus;
	isFetching: boolean;
	hasRows: boolean;
}>): ResolvedView => {
	if (status === "error") {
		return hasRows
			? { view: "ready", stale: false, refreshFailed: true }
			: {
					view: "error",
					stale: false,
					refreshFailed: false,
				};
	}
	if (status === "pending") {
		return {
			view: "loading",
			stale: false,
			refreshFailed: false,
		};
	}
	if (!hasRows) {
		return {
			view: "empty",
			stale: false,
			refreshFailed: false,
		};
	}
	return {
		view: "ready",
		stale: isFetching,
		refreshFailed: false,
	};
};
