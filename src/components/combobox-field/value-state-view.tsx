import type { ReactNode } from "react";
import type {
	ValueState,
	ValueStateLabels,
} from "./value-state.ts";
import style from "./value-state-view.module.scss";

/**
 * What a value is read as: its label, marked when it is no longer available.
 *
 * @example
 * valueStateName(state, user => user.name, labels); // "Jan Jansen"
 */
export const valueStateName = <TItem,>(
	state: ValueState<TItem>,
	itemLabel: (item: TItem) => string,
	labels: ValueStateLabels | undefined,
): string =>
	state.status === "unavailable" && labels !== undefined
		? labels.valueUnavailableName(itemLabel(state.item))
		: itemLabel(state.item);

type ValueStateViewProps<TItem> = Readonly<{
	state: ValueState<TItem>;
	renderItem: (item: TItem) => ReactNode;
	itemLabel: (item: TItem) => string;
	labels: ValueStateLabels | undefined;
	/** Marks an unavailable value, beside its label. */
	icon?: ReactNode;
}>;

/**
 * One value as it shows in a tag or a trigger: its item, or the item muted and
 * marked unavailable, read as `valueStateName`.
 *
 * @example
 * <ValueStateView state={state} renderItem={renderItem} itemLabel={itemLabel} labels={labels} icon={<BlockIcon />} />
 */
export const ValueStateView = <TItem,>({
	state,
	renderItem,
	itemLabel,
	labels,
	icon,
}: ValueStateViewProps<TItem>): ReactNode =>
	state.status === "unavailable" && labels !== undefined ? (
		<span className={style.muted}>
			<span aria-hidden="true" className={style.item}>
				{renderItem(state.item)}
			</span>
			{icon === undefined ? null : (
				<span aria-hidden="true" className={style.icon}>
					{icon}
				</span>
			)}
			<span aria-hidden="true">
				{labels.valueUnavailableLabel}
			</span>
			<span className={style.name}>
				{valueStateName(state, itemLabel, labels)}
			</span>
		</span>
	) : (
		renderItem(state.item)
	);

/**
 * The polite status that sums up a field's values that are no longer
 * available. Mount it once per field, outside any popup.
 *
 * @example
 * <ValueStatesStatus states={states} labels={labels} />
 */
export const ValueStatesStatus = <TItem,>({
	states,
	labels,
}: Readonly<{
	states: readonly ValueState<TItem>[];
	labels: ValueStateLabels;
}>): ReactNode => {
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
				: labels.valuesUnavailableLabel(unavailable)}
		</div>
	);
};
