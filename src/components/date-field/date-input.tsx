import { TemporalCalendar } from "../../lib/calendar/calendar-prefab.tsx";
import type { CalendarDate } from "@internationalized/date";
import { type ReactNode, useId } from "react";
import {
	DatePicker as AriaDatePicker,
	type DatePickerProps as AriaDatePickerProps,
} from "react-aria-components";
import {
	CalendarMonthPicker,
	CalendarPickers,
	CalendarYearPicker,
} from "../../lib/calendar/calendar-navigation.tsx";
import {
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeader,
	CalendarHeaderCell,
	CalendarHeading,
	CalendarNext,
	CalendarPrevious,
	CalendarRoot,
} from "../../lib/calendar/calendar-parts.tsx";
import { todayIn } from "../../lib/calendar/temporal-value.ts";
import {
	TemporalDialog,
	TemporalGroup,
	TemporalInput,
	TemporalLabel,
	TemporalPopover,
	TemporalPopup,
	TemporalSegment,
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

/** The parts of a date input. */
export type DateInputParts = Readonly<{
	Root: typeof DateInputRoot;
	Label: typeof TemporalLabel;
	Group: typeof TemporalGroup;
	Input: typeof TemporalInput;
	Segment: typeof TemporalSegment;
	Trigger: typeof TemporalTrigger;
	Pending: typeof Field.Pending;
	Popup: typeof TemporalPopup;
	Popover: typeof TemporalPopover;
	Dialog: typeof TemporalDialog;
	Calendar: typeof CalendarRoot;
	StandardCalendar: typeof TemporalCalendar;
	CalendarHeader: typeof CalendarHeader;
	Heading: typeof CalendarHeading;
	Previous: typeof CalendarPrevious;
	Next: typeof CalendarNext;
	Pickers: typeof CalendarPickers;
	MonthPicker: typeof CalendarMonthPicker;
	YearPicker: typeof CalendarYearPicker;
	Grid: typeof CalendarGrid;
	GridHeader: typeof CalendarGridHeader;
	HeaderCell: typeof CalendarHeaderCell;
	GridBody: typeof CalendarGridBody;
	Cell: typeof CalendarCell;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a react-aria `DatePicker`, a date entry plus a calendar
 * popover, following react-aria's own anatomy. It sits in a `Field.Root` and
 * names itself through `Label`'s id. For the ordinary case, use `DateField`,
 * which is assembled from exactly these parts. `StandardCalendar` is the whole
 * calendar, its header, pickers and grid, assembled from them.
 *
 * @example
 * const ids = DateInput.useIds();
 *
 * <Field.Root>
 * 	<DateInput.Label id={ids.labelId}>Service date</DateInput.Label>
 * 	<DateInput.Root aria-labelledby={ids.labelId}>
 * 		{({ isFocusWithin }) => (
 * 			<>
 * 				<DateInput.Group state={{ focused: isFocusWithin }}>
 * 					<DateInput.Input>
 * 						{segment => <DateInput.Segment segment={segment} />}
 * 					</DateInput.Input>
 * 					<DateInput.Trigger
 * 						ref={triggerRef}
 * 						render={
 * 							<IconButton label="Open calendar" variant="tertiary" size="sm">
 * 								<CalendarTodayIcon />
 * 							</IconButton>
 * 						}
 * 					/>
 * 				</DateInput.Group>
 * 				<DateInput.Popup triggerRef={triggerRef}>
 * 					<DateInput.Calendar>
 * 						<DateInput.CalendarHeader>
 * 							<DateInput.Previous render={<IconButton label="Previous month"><ChevronLeftIcon /></IconButton>} />
 * 							<DateInput.Heading />
 * 							<DateInput.Next render={<IconButton label="Next month"><ChevronRightIcon /></IconButton>} />
 * 						</DateInput.CalendarHeader>
 * 						<DateInput.Grid>
 * 							<DateInput.GridHeader>
 * 								{day => <DateInput.HeaderCell>{day}</DateInput.HeaderCell>}
 * 							</DateInput.GridHeader>
 * 							<DateInput.GridBody>
 * 								{date => <DateInput.Cell date={date} />}
 * 							</DateInput.GridBody>
 * 						</DateInput.Grid>
 * 					</DateInput.Calendar>
 * 				</DateInput.Popup>
 * 			</>
 * 		)}
 * 	</DateInput.Root>
 * </Field.Root>
 */
export const DateInput: DateInputParts = {
	Root: DateInputRoot,
	Label: TemporalLabel,
	Group: TemporalGroup,
	Input: TemporalInput,
	Segment: TemporalSegment,
	Trigger: TemporalTrigger,
	Pending: Field.Pending,
	Popup: TemporalPopup,
	Popover: TemporalPopover,
	Dialog: TemporalDialog,
	Calendar: CalendarRoot,
	StandardCalendar: TemporalCalendar,
	CalendarHeader,
	Heading: CalendarHeading,
	Previous: CalendarPrevious,
	Next: CalendarNext,
	Pickers: CalendarPickers,
	MonthPicker: CalendarMonthPicker,
	YearPicker: CalendarYearPicker,
	Grid: CalendarGrid,
	GridHeader: CalendarGridHeader,
	HeaderCell: CalendarHeaderCell,
	GridBody: CalendarGridBody,
	Cell: CalendarCell,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
