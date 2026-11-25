import type { ReactNode } from "react";
import { useCopy } from "../copy-provider/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import type { ValueState } from "./value-state.ts";
import style from "./value-state-view.module.scss";

/**
 * What a value is read as: its label, or, where it is no longer available and
 * an `unavailableName` is given, that name for it.
 *
 * @example
 * valueStateName(state, user => user.name, copy.options.unavailableName); // "Jan Jansen"
 */
export const valueStateName = <TItem,>(
	state: ValueState<TItem>,
	itemLabel: (item: TItem) => string,
	unavailableName:
		| ((itemLabel: string) => string)
		| undefined,
): string =>
	state.status === "unavailable" &&
	unavailableName !== undefined
		? unavailableName(itemLabel(state.item))
		: itemLabel(state.item);

type ValueStateViewProps<TItem> = Readonly<{
	state: ValueState<TItem>;
	renderItem: (item: TItem) => ReactNode;
	itemLabel: (item: TItem) => string;
	/** Marks a value that is no longer available. */
	marked: boolean;
}>;

/**
 * One value as it shows in a tag or a trigger: its item, or, where `marked`,
 * the item muted and marked unavailable, read as `valueStateName`.
 *
 * @example
 * <ValueStateView state={state} renderItem={renderItem} itemLabel={itemLabel} marked />
 */
export const ValueStateView = <TItem,>({
	state,
	renderItem,
	itemLabel,
	marked,
}: ValueStateViewProps<TItem>): ReactNode => {
	const { options } = useCopy();
	const { unavailable } = useIcons();
	return state.status === "unavailable" && marked ? (
		<span className={style.muted}>
			<span aria-hidden="true" className={style.item}>
				{renderItem(state.item)}
			</span>
			{unavailable === undefined ? null : (
				<span aria-hidden="true" className={style.icon}>
					{unavailable}
				</span>
			)}
			<span aria-hidden="true">{options.unavailable}</span>
			<span className={style.name}>
				{valueStateName(
					state,
					itemLabel,
					options.unavailableName,
				)}
			</span>
		</span>
	) : (
		renderItem(state.item)
	);
};

/**
 * The polite status that sums up a field's values that are no longer
 * available. Mount it once per field, outside any popup.
 *
 * @example
 * <ValueStatesStatus states={states} />
 */
export const ValueStatesStatus = <TItem,>({
	states,
}: Readonly<{
	states: readonly ValueState<TItem>[];
}>): ReactNode => {
	const { options } = useCopy();
	const unavailable = states.filter(
		state => state.status === "unavailable",
	).length;
	return (
		<div
			role="status"
			aria-atomic="true"
			className={style.name}>
			{unavailable === 0
				? null
				: options.unavailableCount(unavailable)}
		</div>
	);
};
