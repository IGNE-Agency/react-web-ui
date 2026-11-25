import { TemporalCalendar } from "../../lib/calendar/calendar-prefab.tsx";
import type { CalendarDate } from "@internationalized/date";
import type { ReactNode } from "react";
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
import {
	dayToIso,
	isoToDay,
	todayIn,
} from "../../lib/calendar/temporal-value.ts";
import {
	TemporalDialog,
	TemporalFocusContext,
	TemporalFrame,
	TemporalGroup,
	TemporalInput,
	type TemporalOwnedProps,
	TemporalPopover,
	TemporalPopup,
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

export type DateInputRootProps = TemporalRootBaseProps &
	Omit<
		AriaDatePickerProps<CalendarDate>,
		TemporalOwnedProps
	> &
	Readonly<{
		/**
		 * An ISO plain date, such as `"2026-07-24"`. A date-time or an instant is
		 * read as the day it falls on in the `TimeZoneProvider`'s zone.
		 */
		value?: string | null;
		/** The same, for an uncontrolled control. */
		defaultValue?: string | null;
		/** Called with the ISO plain date picked or typed, or `null` once cleared. */
		onValueChange?: (value: string | null) => void;
		/** Earliest selectable ISO plain date. */
		minValue?: string;
		/** Latest selectable ISO plain date. */
		maxValue?: string;
		/** Submits the date under this name. */
		name?: string;
	}>;

/**
 * The field frame around a react-aria `DatePicker`, holding its value as an ISO
 * plain date and projecting its state onto every part. Today, in the
 * `TimeZoneProvider`'s zone, is the placeholder.
 *
 * @example
 * <DateInput.Root value={date} onValueChange={setDate}>…</DateInput.Root>
 */
const DateInputRoot = ({
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
	name,
	children,
	...props
}: DateInputRootProps): ReactNode => {
	const timeZone = useTimeZone();
	const day = isoToDay(value, timeZone);
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
			filled={day !== null}
			render={(picker, controlId) => (
				<AriaDatePicker<CalendarDate>
					placeholderValue={todayIn(timeZone)}
					{...props}
					{...picker}
					value={value === undefined ? undefined : day}
					defaultValue={
						isoToDay(defaultValue, timeZone) ?? undefined
					}
					onChange={next => onValueChange?.(dayToIso(next))}
					onBlur={onBlur}
					minValue={
						isoToDay(minValue, timeZone) ?? undefined
					}
					maxValue={
						isoToDay(maxValue, timeZone) ?? undefined
					}
					name={name ?? controlId}>
					{({ isFocusWithin }) => (
						<TemporalFocusContext value={isFocusWithin}>
							{children}
						</TemporalFocusContext>
					)}
				</AriaDatePicker>
			)}
		/>
	);
};

/** The parts of a date input. */
export type DateInputParts = Readonly<{
	Root: typeof DateInputRoot;
	Label: typeof WiredLabel;
	Group: typeof TemporalGroup;
	Input: typeof TemporalInput;
	Segment: typeof TemporalSegment;
	Trigger: typeof TemporalTrigger;
	Pending: typeof InputPending;
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
	Description: typeof WiredDescription;
	Error: typeof WiredError;
}>;

/**
 * The styled parts of a react-aria `DatePicker`, a date entry plus a calendar
 * popover, following react-aria's own anatomy. `Root` draws the field frame and
 * holds the value and the field's states, and names and describes the picker
 * by its `Label`, `Description` and `Error`, so no part below it takes either
 * again. For the ordinary case, use `DateField`, which is assembled from
 * exactly these parts. `StandardCalendar` is the whole calendar, its header,
 * pickers and grid, assembled from them.
 *
 * @example
 * <DateInput.Root value={date} onValueChange={setDate} errors={errors} requiredness="required">
 * 	<DateInput.Label>Service date <Field.Requiredness /></DateInput.Label>
 * 	<DateInput.Group>
 * 		<DateInput.Input>
 * 			{segment => <DateInput.Segment segment={segment} />}
 * 		</DateInput.Input>
 * 		<DateInput.Pending><Spinner size={1} /></DateInput.Pending>
 * 		<DateInput.Trigger
 * 			ref={triggerRef}
 * 			render={
 * 				<IconButton label="Open calendar" variant="tertiary" size="sm">
 * 					<CalendarTodayIcon />
 * 				</IconButton>
 * 			}
 * 		/>
 * 	</DateInput.Group>
 * 	<DateInput.Popup triggerRef={triggerRef}>
 * 		<DateInput.Calendar>
 * 			<DateInput.CalendarHeader>
 * 				<DateInput.Previous render={<IconButton label="Previous month"><ChevronLeftIcon /></IconButton>} />
 * 				<DateInput.Heading />
 * 				<DateInput.Next render={<IconButton label="Next month"><ChevronRightIcon /></IconButton>} />
 * 			</DateInput.CalendarHeader>
 * 			<DateInput.Grid>
 * 				<DateInput.GridHeader>
 * 					{day => <DateInput.HeaderCell>{day}</DateInput.HeaderCell>}
 * 				</DateInput.GridHeader>
 * 				<DateInput.GridBody>
 * 					{date => <DateInput.Cell date={date} />}
 * 				</DateInput.GridBody>
 * 			</DateInput.Grid>
 * 		</DateInput.Calendar>
 * 	</DateInput.Popup>
 * 	<DateInput.Description>The day the work was done.</DateInput.Description>
 * 	<DateInput.Error />
 * </DateInput.Root>
 */
export const DateInput: DateInputParts = {
	Root: DateInputRoot,
	Label: WiredLabel,
	Group: TemporalGroup,
	Input: TemporalInput,
	Segment: TemporalSegment,
	Trigger: TemporalTrigger,
	Pending: InputPending,
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
	Description: WiredDescription,
	Error: WiredError,
};
