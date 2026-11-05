import type { CalendarDate } from "@internationalized/date";
import { type ReactNode, type Ref, useId } from "react";
import {
	DatePicker as AriaDatePicker,
	type DatePickerProps as AriaDatePickerProps,
} from "react-aria-components";
import { todayIn } from "../../lib/calendar/temporal-value.ts";
import {
	TemporalCalendar,
	TemporalFrame,
	TemporalGroup,
	TemporalInput,
	TemporalPopup,
	type TemporalStateProps,
	TemporalTrigger,
} from "../../lib/calendar/temporal.tsx";
import {
	Field,
	fieldStateAttributes,
} from "../field/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";

export type DateInputRootProps =
	AriaDatePickerProps<CalendarDate> & TemporalStateProps;

/**
 * A react-aria `DatePicker` holding the value, with today as the placeholder
 * in the `TimeZoneProvider`'s zone.
 *
 * @example
 * <DateInput.Root aria-labelledby={labelId}>…</DateInput.Root>
 */
const DateInputRoot = ({
	state,
	...props
}: DateInputRootProps): ReactNode => {
	const id = useId();
	return (
		<AriaDatePicker<CalendarDate>
			validationBehavior="aria"
			placeholderValue={todayIn(useTimeZone())}
			{...fieldStateAttributes(state ?? {})}
			{...props}
			name={props.name ?? id}
		/>
	);
};

export type DateInputTriggerProps = Readonly<{
	/** Accessible name, such as "Open calendar". */
	label: string;
	ref?: Ref<HTMLButtonElement>;
	/** The icon the button shows. */
	children: ReactNode;
}>;

/**
 * The icon-only button that opens the calendar.
 *
 * @example
 * <DateInput.Trigger label="Open calendar"><CalendarTodayIcon /></DateInput.Trigger>
 */
const DateInputTrigger = ({
	label,
	ref,
	children,
}: DateInputTriggerProps): ReactNode => (
	<TemporalTrigger label={label} ref={ref}>
		{children}
	</TemporalTrigger>
);

/** The parts of a date input. */
export type DateInputParts = Readonly<{
	Frame: typeof TemporalFrame;
	Root: typeof DateInputRoot;
	Group: typeof TemporalGroup;
	Input: typeof TemporalInput;
	Trigger: typeof DateInputTrigger;
	Popup: typeof TemporalPopup;
	Calendar: typeof TemporalCalendar;
	Pending: typeof Field.Pending;
}>;

/**
 * The styled parts of a react-aria `DatePicker`, a date entry plus a calendar
 * popover, carrying the field frame's ids rather than a label of their own.
 * For the ordinary case, use `DateField`.
 *
 * @example
 * <DateInput.Root aria-labelledby={labelId}>
 * 	{({ isFocusWithin }) => (
 * 		<>
 * 			<DateInput.Group state={{ focused: isFocusWithin }}>
 * 				<DateInput.Input />
 * 				<DateInput.Trigger label="Open calendar">
 * 					<CalendarTodayIcon />
 * 				</DateInput.Trigger>
 * 			</DateInput.Group>
 * 			<DateInput.Popup>
 * 				<DateInput.Calendar {...calendarLabels} {...calendarIcons} />
 * 			</DateInput.Popup>
 * 		</>
 * 	)}
 * </DateInput.Root>
 */
export const DateInput: DateInputParts = {
	Frame: TemporalFrame,
	Root: DateInputRoot,
	Group: TemporalGroup,
	Input: TemporalInput,
	Trigger: DateInputTrigger,
	Popup: TemporalPopup,
	Calendar: TemporalCalendar,
	Pending: Field.Pending,
};
