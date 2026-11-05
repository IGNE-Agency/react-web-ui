/**
 * Where a value's item lookup stands. A `useQuery` result fits.
 *
 * @example
 * const lookup: ItemLookup<User> = { data: undefined, error: null };
 */
export type ItemLookup<TItem> = Readonly<{
	data: TItem | undefined;
	error: unknown;
}>;

/**
 * How a value shows: its item, or its item marked as no longer available.
 *
 * @example
 * const state: ValueState<User> = { status: "ready", key: "u1", item: user };
 */
export type ValueState<TItem> = Readonly<{
	status: "ready" | "unavailable";
	key: string;
	item: TItem;
}>;

/** The copy a combobox shows for values its `itemQuery` reports gone. */
export type ValueStateLabels = Readonly<{
	/** The word a value no longer available shows beside it, such as "unavailable". */
	valueUnavailableLabel: string;
	/** How a value no longer available is read, such as "Jan Jansen, unavailable". */
	valueUnavailableName: (itemLabel: string) => string;
	/** The status sentence for such values, such as "2 selected values are no longer available.". */
	valuesUnavailableLabel: (count: number) => string;
}>;

type ValueSources<TItem> = Readonly<{
	key: string;
	item: TItem;
	picked: boolean;
	listed: TItem | undefined;
	lookup: ItemLookup<TItem> | undefined;
	retryable: (error: unknown) => boolean;
}>;

/**
 * The state a value shows in: a value picked here as it is, else the list's
 * copy, else what its lookup says. A lookup that failed for good marks the
 * value unavailable; one that may still succeed keeps the value as known.
 *
 * @example
 * valueStateOf({ key: "u1", item: user, picked: false, listed: undefined, lookup: undefined, retryable: () => true });
 * // { status: "ready", key: "u1", item: user }
 */
export const valueStateOf = <TItem>({
	key,
	item,
	picked,
	listed,
	lookup,
	retryable,
}: ValueSources<TItem>): ValueState<TItem> => {
	if (picked) {
		return { status: "ready", key, item };
	}
	if (listed !== undefined) {
		return { status: "ready", key, item: listed };
	}
	if (lookup === undefined) {
		return { status: "ready", key, item };
	}
	const known = lookup.data ?? item;
	return lookup.error !== null &&
		lookup.error !== undefined &&
		!retryable(lookup.error)
		? { status: "unavailable", key, item: known }
		: { status: "ready", key, item: known };
};
