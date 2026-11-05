import { useEffect, useState } from "react";
import type { StoredValue } from "../../lib/table-storage.ts";

/**
 * Whether a filter value narrows the view: present, and not an unchecked
 * boolean, a blank string or an empty multi-select.
 *
 * @example
 * isActiveFilterValue("open") // true
 * isActiveFilterValue([]) // false
 */
export const isActiveFilterValue = <T>(
	value: T,
): value is NonNullable<T> =>
	value !== undefined &&
	value !== null &&
	value !== false &&
	value !== "" &&
	!(Array.isArray(value) && value.length === 0);

/**
 * Counts the fields in `filters` that hold an active (present + non-empty)
 * value. Drives the applied-filter badge on the {@link FilterBar} trigger.
 *
 * @example
 * countActiveFilters({ status: "open", q: "" }) // 1
 */
export const countActiveFilters = (
	filters: object,
): number =>
	Object.values(filters).filter(isActiveFilterValue).length;

/**
 * The same filter set with every field emptied to `undefined`.
 *
 * @example
 * clearFilterValues({ status: "open", dateFrom: "2026-01-01" })
 * // -> { status: undefined, dateFrom: undefined }
 */
export const clearFilterValues = <TFilters extends object>(
	filters: TFilters,
): TFilters => ({
	...filters,
	...Object.fromEntries(
		Object.keys(filters).map(key => [key, undefined]),
	),
});

/** The committed/draft filter model returned by {@link useFilterView}. */
export type FilterView<TFilters extends object> = Readonly<{
	/** Committed filters — feed these to the query. */
	committed: TFilters;
	/** Pending drawer edits, not yet applied. Bind filter controls to these. */
	draft: TFilters;
	/** Writes one draft field (pass `undefined` to clear it). */
	setDraft: <K extends keyof TFilters>(
		key: K,
		value: TFilters[K],
	) => void;
	/** Number of active (present + non-empty) committed filters. */
	activeCount: number;

	/** Whether anything is narrowing the result set — a filter or the search. */
	isNarrowed: boolean;

	/** Commit `draft` → committed. */
	apply: () => void;
	/** Discard `draft`, restoring it from committed. */
	cancel: () => void;
	/**
	 * Restore `draft` to the initial filters. Draft-only — Apply still commits.
	 */
	reset: () => void;
	/**
	 * Empty every filter field and the search, committed immediately.
	 */
	clearAll: () => void;
	/** Clear a single committed field immediately (no Apply). */
	removeFilter: (key: keyof TFilters) => void;
	/** Commit a single field to a value immediately (no Apply). */
	setFilter: <K extends keyof TFilters>(
		key: K,
		value: TFilters[K],
	) => void;

	/** Live search input value (instant, for the text field). */
	search: string;
	/** Debounced search value — feed this to the query. */
	debouncedSearch: string;
	/** Updates both the live and debounced search values. */
	setSearch: (value: string) => void;
}>;

const DEFAULT_SEARCH_DELAY = 300;

/**
 * Holds committed-vs-draft filter state plus a debounced live search, the
 * query-agnostic core of a filter-driven view. `onCommittedChange` fires
 * whenever the committed set changes and `onSearchChange` on every keystroke;
 * controls bind straight to `draft` + `setDraft` in the consumer's own render.
 * Given a `stored` value, the committed set opens from it and is written back
 * on every commit; the search is never stored.
 *
 * @example
 * const filters = useFilterView<{ status?: string }>({
 * 	initial: {},
 * 	onCommittedChange: resetPage,
 * 	onSearchChange: resetPage,
 * });
 * // <Select value={filters.draft.status ?? ""}
 * //   onValueChange={(next) => filters.setDraft("status", next || undefined)} />
 */
export const useFilterView = <TFilters extends object>({
	initial,
	stored,
	onCommittedChange,
	onSearchChange,
	searchDelay = DEFAULT_SEARCH_DELAY,
}: Readonly<{
	initial: TFilters;
	/** Where the committed filters persist; they open from it when given. */
	stored?: StoredValue<TFilters>;
	onCommittedChange?: () => void;
	onSearchChange?: () => void;
	searchDelay?: number;
}>): FilterView<TFilters> => {
	const [committed, setCommitted] = useState<TFilters>(
		() => stored?.read() ?? initial,
	);
	const [draft, setDraftState] =
		useState<TFilters>(committed);

	const [search, setSearchLive] = useState("");
	const [debouncedSearch, setDebouncedSearch] =
		useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, searchDelay);
		return () => {
			clearTimeout(timer);
		};
	}, [search, searchDelay]);

	const setDraft = <K extends keyof TFilters>(
		key: K,
		value: TFilters[K],
	) => setDraftState(prev => ({ ...prev, [key]: value }));

	const commit = (next: TFilters) => {
		setCommitted(next);
		onCommittedChange?.();
		stored?.write(next);
	};

	const apply = () => commit(draft);

	const cancel = () => setDraftState(committed);

	const reset = () => setDraftState(initial);

	const removeFilter = (key: keyof TFilters) => {
		const clear = (prev: TFilters): TFilters => ({
			...prev,
			[key]: undefined,
		});
		setDraftState(clear);
		commit(clear(committed));
	};

	const setFilter = <K extends keyof TFilters>(
		key: K,
		value: TFilters[K],
	) => {
		const set = (prev: TFilters): TFilters => ({
			...prev,
			[key]: value,
		});
		setDraftState(set);
		commit(set(committed));
	};

	const setSearch = (value: string) => {
		setSearchLive(value);
		onSearchChange?.();
	};

	const clearAll = () => {
		setDraftState(clearFilterValues);
		commit(clearFilterValues(committed));
		setSearch("");
	};

	const activeCount = countActiveFilters(committed);

	return {
		committed,
		draft,
		setDraft,
		activeCount,
		isNarrowed: activeCount > 0 || search !== "",
		apply,
		cancel,
		reset,
		clearAll,
		removeFilter,
		setFilter,
		search,
		debouncedSearch,
		setSearch,
	};
};
