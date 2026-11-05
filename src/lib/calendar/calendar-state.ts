import {
	toCalendar,
	toCalendarDate,
} from "@internationalized/date";
import { type ContextType, useContext } from "react";
import {
	CalendarStateContext,
	RangeCalendarStateContext,
} from "react-aria-components";

export type CalendarNavigationState = NonNullable<
	| ContextType<typeof CalendarStateContext>
	| ContextType<typeof RangeCalendarStateContext>
>;

/**
 * Whichever calendar state is above this component, single or range, or `null`
 * outside both.
 *
 * @example
 * const state = useCalendarNavigationState();
 */
export const useCalendarNavigationState =
	(): CalendarNavigationState | null => {
		const single = useContext(CalendarStateContext);
		const range = useContext(RangeCalendarStateContext);
		return single ?? range;
	};

/**
 * Every year the focused date's era holds, narrowed by the field's own
 * `minValue` and `maxValue`.
 *
 * @example
 * eraYears(state); // [1, 2, …, 9999] for a Gregorian AD date
 */
export const eraYears = (
	state: CalendarNavigationState,
): readonly number[] => {
	const focused = state.focusedDate;
	const min = state.minValue ?? null;
	const max = state.maxValue ?? null;
	const first = Math.max(
		1,
		min === null
			? 1
			: toCalendar(toCalendarDate(min), focused.calendar)
					.year,
	);
	const inEra = focused.calendar.getYearsInEra(focused);
	const last =
		max === null
			? inEra
			: Math.min(
					inEra,
					toCalendar(toCalendarDate(max), focused.calendar)
						.year,
				);
	return Array.from(
		{ length: Math.max(0, last - first + 1) },
		(_, index) => first + index,
	);
};
