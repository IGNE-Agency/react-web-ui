import { TemporalRangeCalendar } from "../../lib/calendar/calendar-prefab.tsx";
import type { CalendarDate } from "@internationalized/date";
import type { ReactNode } from "react";
import {
	DateRangePicker as AriaDateRangePicker,
	type DateRangePickerProps as AriaDateRangePickerProps,
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
	CalendarMonths,
	CalendarNext,
	CalendarPrevious,
	RangeCalendarRoot,
} from "../../lib/calendar/calendar-parts.tsx";
import { todayIn } from "../../lib/calendar/temporal-value.ts";
import {
	TemporalDialog,
	TemporalGroup,
	TemporalLabel,
	TemporalPopover,
	TemporalPopup,
	TemporalRangeInput,
	TemporalRangeSeparator,
	TemporalRangeSpacer,
	TemporalSegment,
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

/** The parts of a date range input. */
export type DateRangeInputParts = Readonly<{
	Root: typeof DateRangeInputRoot;
	Label: typeof TemporalLabel;
	Group: typeof TemporalGroup;
	Input: typeof TemporalRangeInput;
	Segment: typeof TemporalSegment;
	Separator: typeof TemporalRangeSeparator;
	Spacer: typeof TemporalRangeSpacer;
	Trigger: typeof TemporalTrigger;
	Pending: typeof Field.Pending;
	Popup: typeof TemporalPopup;
	Popover: typeof TemporalPopover;
	Dialog: typeof TemporalDialog;
	Calendar: typeof RangeCalendarRoot;
	StandardCalendar: typeof TemporalRangeCalendar;
	CalendarHeader: typeof CalendarHeader;
	Heading: typeof CalendarHeading;
	Previous: typeof CalendarPrevious;
	Next: typeof CalendarNext;
	Pickers: typeof CalendarPickers;
	MonthPicker: typeof CalendarMonthPicker;
	YearPicker: typeof CalendarYearPicker;
	Months: typeof CalendarMonths;
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
 * The styled parts of a react-aria `DateRangePicker`, a start and an end date
 * entry plus a range calendar popover, following react-aria's own anatomy. It
 * sits in a `Field.Root` and names itself through `Label`'s id. For the
 * ordinary case, use `DateRangeField`, which is assembled from exactly these
 * parts. `StandardCalendar` is the whole range calendar, its header, pickers
 * and grids, assembled from them.
 *
 * @example
 * const ids = DateRangeInput.useIds();
 *
 * <Field.Root>
 * 	<DateRangeInput.Label id={ids.labelId}>Invoice period</DateRangeInput.Label>
 * 	<DateRangeInput.Root aria-labelledby={ids.labelId}>
 * 		{({ isFocusWithin }) => (
 * 			<>
 * 				<DateRangeInput.Group state={{ focused: isFocusWithin }}>
 * 					<DateRangeInput.Input slot="start">
 * 						{segment => <DateRangeInput.Segment segment={segment} />}
 * 					</DateRangeInput.Input>
 * 					<DateRangeInput.Separator>to</DateRangeInput.Separator>
 * 					<DateRangeInput.Input slot="end">
 * 						{segment => <DateRangeInput.Segment segment={segment} />}
 * 					</DateRangeInput.Input>
 * 					<DateRangeInput.Spacer />
 * 					<DateRangeInput.Trigger
 * 						ref={triggerRef}
 * 						render={
 * 							<IconButton label="Open calendar" variant="tertiary" size="sm">
 * 								<DateRangeIcon />
 * 							</IconButton>
 * 						}
 * 					/>
 * 				</DateRangeInput.Group>
 * 				<DateRangeInput.Popup triggerRef={triggerRef}>
 * 					<DateRangeInput.Calendar visibleMonths={2}>
 * 						<DateRangeInput.CalendarHeader>
 * 							<DateRangeInput.Previous render={<IconButton label="Previous month"><ChevronLeftIcon /></IconButton>} />
 * 							<DateRangeInput.Heading />
 * 							<DateRangeInput.Next render={<IconButton label="Next month"><ChevronRightIcon /></IconButton>} />
 * 						</DateRangeInput.CalendarHeader>
 * 						<DateRangeInput.Months>
 * 							{[0, 1].map(month => (
 * 								<DateRangeInput.Grid key={month} offset={{ months: month }}>
 * 									<DateRangeInput.GridHeader>
 * 										{day => <DateRangeInput.HeaderCell>{day}</DateRangeInput.HeaderCell>}
 * 									</DateRangeInput.GridHeader>
 * 									<DateRangeInput.GridBody>
 * 										{date => <DateRangeInput.Cell date={date} />}
 * 									</DateRangeInput.GridBody>
 * 								</DateRangeInput.Grid>
 * 							))}
 * 						</DateRangeInput.Months>
 * 					</DateRangeInput.Calendar>
 * 				</DateRangeInput.Popup>
 * 			</>
 * 		)}
 * 	</DateRangeInput.Root>
 * </Field.Root>
 */
export const DateRangeInput: DateRangeInputParts = {
	Root: DateRangeInputRoot,
	Label: TemporalLabel,
	Group: TemporalGroup,
	Input: TemporalRangeInput,
	Segment: TemporalSegment,
	Separator: TemporalRangeSeparator,
	Spacer: TemporalRangeSpacer,
	Trigger: TemporalTrigger,
	Pending: Field.Pending,
	Popup: TemporalPopup,
	Popover: TemporalPopover,
	Dialog: TemporalDialog,
	Calendar: RangeCalendarRoot,
	StandardCalendar: TemporalRangeCalendar,
	CalendarHeader,
	Heading: CalendarHeading,
	Previous: CalendarPrevious,
	Next: CalendarNext,
	Pickers: CalendarPickers,
	MonthPicker: CalendarMonthPicker,
	YearPicker: CalendarYearPicker,
	Months: CalendarMonths,
	Grid: CalendarGrid,
	GridHeader: CalendarGridHeader,
	HeaderCell: CalendarHeaderCell,
	GridBody: CalendarGridBody,
	Cell: CalendarCell,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
