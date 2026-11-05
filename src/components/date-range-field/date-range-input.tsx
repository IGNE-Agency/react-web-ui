import type { CalendarDate } from "@internationalized/date";
import type { ReactNode, Ref } from "react";
import {
	DateRangePicker as AriaDateRangePicker,
	type DateRangePickerProps as AriaDateRangePickerProps,
} from "react-aria-components";
import { todayIn } from "../../lib/calendar/temporal-value.ts";
import {
	TemporalFrame,
	TemporalGroup,
	TemporalPopup,
	TemporalRangeCalendar,
	TemporalRangeInput,
	TemporalRangeSeparator,
	TemporalRangeSpacer,
	type TemporalStateProps,
	TemporalTrigger,
} from "../../lib/calendar/temporal.tsx";
import {
	Field,
	fieldStateAttributes,
} from "../field/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";

export type DateRangeInputRootProps =
	AriaDateRangePickerProps<CalendarDate> &
		TemporalStateProps;

/**
 * A react-aria `DateRangePicker` holding the value, with today as the
 * placeholder in the `TimeZoneProvider`'s zone.
 *
 * @example
 * <DateRangeInput.Root aria-labelledby={labelId}>…</DateRangeInput.Root>
 */
const DateRangeInputRoot = ({
	state,
	...props
}: DateRangeInputRootProps): ReactNode => (
	<AriaDateRangePicker<CalendarDate>
		validationBehavior="aria"
		placeholderValue={todayIn(useTimeZone())}
		{...fieldStateAttributes(state ?? {})}
		{...props}
	/>
);

export type DateRangeInputTriggerProps = Readonly<{
	/** Accessible name, such as "Open calendar". */
	label: string;
	ref?: Ref<HTMLButtonElement>;
	/** The icon the button shows. */
	children: ReactNode;
}>;

/**
 * The icon-only button that opens the range calendar.
 *
 * @example
 * <DateRangeInput.Trigger label="Open calendar"><DateRangeIcon /></DateRangeInput.Trigger>
 */
const DateRangeInputTrigger = ({
	label,
	ref,
	children,
}: DateRangeInputTriggerProps): ReactNode => (
	<TemporalTrigger label={label} ref={ref}>
		{children}
	</TemporalTrigger>
);

/** The parts of a date range input. */
export type DateRangeInputParts = Readonly<{
	Frame: typeof TemporalFrame;
	Root: typeof DateRangeInputRoot;
	Group: typeof TemporalGroup;
	Input: typeof TemporalRangeInput;
	Separator: typeof TemporalRangeSeparator;
	Spacer: typeof TemporalRangeSpacer;
	Trigger: typeof DateRangeInputTrigger;
	Popup: typeof TemporalPopup;
	Calendar: typeof TemporalRangeCalendar;
	Pending: typeof Field.Pending;
}>;

/**
 * The styled parts of a react-aria `DateRangePicker`, a start and an end date
 * entry plus a range calendar popover, carrying the field frame's ids rather
 * than a label of their own. For the ordinary case, use `DateRangeField`.
 *
 * @example
 * <DateRangeInput.Root aria-labelledby={labelId}>
 * 	{({ isFocusWithin }) => (
 * 		<>
 * 			<DateRangeInput.Group state={{ focused: isFocusWithin }}>
 * 				<DateRangeInput.Input slot="start" />
 * 				<DateRangeInput.Separator />
 * 				<DateRangeInput.Input slot="end" />
 * 				<DateRangeInput.Spacer />
 * 				<DateRangeInput.Trigger label="Open calendar">
 * 					<DateRangeIcon />
 * 				</DateRangeInput.Trigger>
 * 			</DateRangeInput.Group>
 * 			<DateRangeInput.Popup>
 * 				<DateRangeInput.Calendar {...calendarLabels} {...calendarIcons} />
 * 			</DateRangeInput.Popup>
 * 		</>
 * 	)}
 * </DateRangeInput.Root>
 */
export const DateRangeInput: DateRangeInputParts = {
	Frame: TemporalFrame,
	Root: DateRangeInputRoot,
	Group: TemporalGroup,
	Input: TemporalRangeInput,
	Separator: TemporalRangeSeparator,
	Spacer: TemporalRangeSpacer,
	Trigger: DateRangeInputTrigger,
	Popup: TemporalPopup,
	Calendar: TemporalRangeCalendar,
	Pending: Field.Pending,
};
