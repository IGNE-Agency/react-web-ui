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
import {
	dayRangeToIso,
	type IsoDateRange,
	isoToDay,
	isoToDayRange,
	todayIn,
} from "../../lib/calendar/temporal-value.ts";
import {
	TemporalDialog,
	TemporalFocusContext,
	TemporalFrame,
	TemporalGroup,
	type TemporalOwnedProps,
	TemporalPopover,
	TemporalPopup,
	TemporalRangeInput,
	TemporalRangeSeparator,
	TemporalRangeSpacer,
	type TemporalRootBaseProps,
	TemporalSegment,
	TemporalTrigger,
} from "../../lib/calendar/temporal.tsx";
import {
	WiredDescription,
	WiredError,
	WiredLabel,
} from "../field/field-wiring.tsx";
import { InputPending } from "../field/input-parts.tsx";
import { useTimeZone } from "../time-zone-provider/index.ts";

export type DateRangeInputRootProps =
	TemporalRootBaseProps &
		Omit<
			AriaDateRangePickerProps<CalendarDate>,
			TemporalOwnedProps
		> &
		Readonly<{
			/**
			 * Inclusive ISO plain dates, such as `{ start: "2026-07-01", end: "2026-07-31" }`.
			 * A date-time or an instant is read as the day it falls on in the
			 * `TimeZoneProvider`'s zone.
			 */
			value?: IsoDateRange | null;
			/** The same, for an uncontrolled control. */
			defaultValue?: IsoDateRange | null;
			/** Called with the inclusive ISO plain dates picked or typed, or `null` once cleared. */
			onValueChange?: (value: IsoDateRange | null) => void;
			/** Earliest selectable ISO plain date. */
			minValue?: string;
			/** Latest selectable ISO plain date. */
			maxValue?: string;
			/** Submits the start date under this name. */
			startName?: string;
			/** Submits the end date under this name. */
			endName?: string;
		}>;

/**
 * The field frame around a react-aria `DateRangePicker`, holding its value as
 * inclusive ISO plain dates and projecting its state onto every part. Today,
 * in the `TimeZoneProvider`'s zone, is the placeholder.
 *
 * @example
 * <DateRangeInput.Root value={period} onValueChange={setPeriod}>…</DateRangeInput.Root>
 */
const DateRangeInputRoot = ({
	errors,
	requiredness,
	dirty,
	touched,
	pending,
	disabled,
	readOnly,
	state,
	className,
	value,
	defaultValue,
	onValueChange,
	onBlur,
	minValue,
	maxValue,
	startName,
	endName,
	children,
	...props
}: DateRangeInputRootProps): ReactNode => {
	const timeZone = useTimeZone();
	const range = isoToDayRange(value, timeZone);
	return (
		<TemporalFrame
			errors={errors}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			pending={pending}
			disabled={disabled}
			readOnly={readOnly}
			state={state}
			className={className}
			filled={range !== null}
			render={(picker, controlId) => (
				<AriaDateRangePicker<CalendarDate>
					placeholderValue={todayIn(timeZone)}
					{...props}
					{...picker}
					value={value === undefined ? undefined : range}
					defaultValue={
						isoToDayRange(defaultValue, timeZone) ??
						undefined
					}
					onChange={next =>
						onValueChange?.(dayRangeToIso(next))
					}
					onBlur={onBlur}
					minValue={
						isoToDay(minValue, timeZone) ?? undefined
					}
					maxValue={
						isoToDay(maxValue, timeZone) ?? undefined
					}
					startName={startName ?? `${controlId}-start`}
					endName={endName ?? `${controlId}-end`}>
					{({ isFocusWithin }) => (
						<TemporalFocusContext value={isFocusWithin}>
							{children}
						</TemporalFocusContext>
					)}
				</AriaDateRangePicker>
			)}
		/>
	);
};

/** The parts of a date range input. */
export type DateRangeInputParts = Readonly<{
	Root: typeof DateRangeInputRoot;
	Label: typeof WiredLabel;
	Group: typeof TemporalGroup;
	Input: typeof TemporalRangeInput;
	Segment: typeof TemporalSegment;
	Separator: typeof TemporalRangeSeparator;
	Spacer: typeof TemporalRangeSpacer;
	Trigger: typeof TemporalTrigger;
	Pending: typeof InputPending;
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
	Description: typeof WiredDescription;
	Error: typeof WiredError;
}>;

/**
 * The styled parts of a react-aria `DateRangePicker`, a start and an end date
 * entry plus a range calendar popover, following react-aria's own anatomy.
 * `Root` draws the field frame and holds the value and the field's states,
 * and names and describes the picker by its `Label`, `Description` and
 * `Error`, so no part below it takes either again. For the ordinary case, use
 * `DateRangeField`, which is assembled from exactly these parts.
 * `StandardCalendar` is the whole range calendar, its header, pickers and
 * grids, assembled from them.
 *
 * @example
 * <DateRangeInput.Root value={period} onValueChange={setPeriod} errors={errors} requiredness="required">
 * 	<DateRangeInput.Label>Invoice period <Field.Requiredness /></DateRangeInput.Label>
 * 	<DateRangeInput.Group>
 * 		<DateRangeInput.Input slot="start">
 * 			{segment => <DateRangeInput.Segment segment={segment} />}
 * 		</DateRangeInput.Input>
 * 		<DateRangeInput.Separator>to</DateRangeInput.Separator>
 * 		<DateRangeInput.Input slot="end">
 * 			{segment => <DateRangeInput.Segment segment={segment} />}
 * 		</DateRangeInput.Input>
 * 		<DateRangeInput.Spacer />
 * 		<DateRangeInput.Trigger
 * 			ref={triggerRef}
 * 			render={
 * 				<IconButton label="Open calendar" variant="tertiary" size="sm">
 * 					<DateRangeIcon />
 * 				</IconButton>
 * 			}
 * 		/>
 * 	</DateRangeInput.Group>
 * 	<DateRangeInput.Popup triggerRef={triggerRef}>
 * 		<DateRangeInput.Calendar visibleMonths={2}>
 * 			<DateRangeInput.CalendarHeader>
 * 				<DateRangeInput.Previous render={<IconButton label="Previous month"><ChevronLeftIcon /></IconButton>} />
 * 				<DateRangeInput.Heading />
 * 				<DateRangeInput.Next render={<IconButton label="Next month"><ChevronRightIcon /></IconButton>} />
 * 			</DateRangeInput.CalendarHeader>
 * 			<DateRangeInput.Months>
 * 				{[0, 1].map(month => (
 * 					<DateRangeInput.Grid key={month} offset={{ months: month }}>
 * 						<DateRangeInput.GridHeader>
 * 							{day => <DateRangeInput.HeaderCell>{day}</DateRangeInput.HeaderCell>}
 * 						</DateRangeInput.GridHeader>
 * 						<DateRangeInput.GridBody>
 * 							{date => <DateRangeInput.Cell date={date} />}
 * 						</DateRangeInput.GridBody>
 * 					</DateRangeInput.Grid>
 * 				))}
 * 			</DateRangeInput.Months>
 * 		</DateRangeInput.Calendar>
 * 	</DateRangeInput.Popup>
 * 	<DateRangeInput.Description>From the first through the last day of work.</DateRangeInput.Description>
 * 	<DateRangeInput.Error />
 * </DateRangeInput.Root>
 */
export const DateRangeInput: DateRangeInputParts = {
	Root: DateRangeInputRoot,
	Label: WiredLabel,
	Group: TemporalGroup,
	Input: TemporalRangeInput,
	Segment: TemporalSegment,
	Separator: TemporalRangeSeparator,
	Spacer: TemporalRangeSpacer,
	Trigger: TemporalTrigger,
	Pending: InputPending,
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
	Description: WiredDescription,
	Error: WiredError,
};
