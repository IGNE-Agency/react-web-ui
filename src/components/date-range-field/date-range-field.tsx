import { type ReactNode, useRef } from "react";
import {
	type CalendarIcons,
	type CalendarLabels,
	TemporalRangeCalendar,
} from "../../lib/calendar/calendar-prefab.tsx";
import {
	dayRangeToIso,
	type IsoDateRange,
	isoToDay,
	isoToDayRange,
} from "../../lib/calendar/temporal-value.ts";
import { IconButton } from "../button/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	useFieldState,
} from "../field/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";
import { DateRangeInput } from "./date-range-input.tsx";

export type DateRangeFieldProps = FieldProps &
	CalendarLabels &
	CalendarIcons &
	Readonly<{
		/** Accessible name of the button that opens the calendar, such as "Open calendar". */
		openCalendarLabel: string;

		/** The icon of the button that opens the calendar. */
		openCalendarIcon: ReactNode;

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

		onBlur?: FieldBlurHandler;

		/** Earliest selectable ISO plain date. */
		minValue?: string;

		/** Latest selectable ISO plain date. */
		maxValue?: string;

		/**
		 * Months the calendar shows side by side. The caller decides, for
		 * instance one on a narrow viewport. @default 1
		 */
		visibleMonths?: number;

		/** Form field name for the start date. */
		startName?: string;

		/** Form field name for the end date. */
		endName?: string;

		disabled?: boolean;
		readOnly?: boolean;

		/** Applied to the field wrapper, so callers can size the control. */
		className?: string;
	}>;

/**
 * A labelled start and end date, typed or picked from one range calendar. Its
 * value is a pair of inclusive ISO plain-date strings;
 * `isoDateRangeToInstants` turns it into query bounds.
 *
 * @example
 * <DateRangeField
 * 	label="Invoice period"
 * 	optionalLabel="optional"
 * 	openCalendarLabel="Open calendar"
 * 	openCalendarIcon={<DateRangeIcon />}
 * 	{...calendarLabels}
 * 	{...calendarIcons}
 * 	visibleMonths={narrow ? 1 : 2}
 * 	value={period}
 * 	onValueChange={setPeriod}
 * />
 */
export const DateRangeField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending,
	openCalendarLabel,
	previousMonthLabel,
	nextMonthLabel,
	monthLabel,
	yearLabel,
	noMatchingYearLabel,
	openCalendarIcon,
	previousIcon,
	nextIcon,
	checkIcon,
	expandIcon,
	value,
	defaultValue,
	onValueChange,
	onBlur,
	minValue,
	maxValue,
	visibleMonths,
	startName,
	endName,
	disabled,
	readOnly,
	className,
}: DateRangeFieldProps): ReactNode => {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const timeZone = useTimeZone();
	const range = isoToDayRange(value, timeZone);
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled: range !== null,
	});
	const { phase } = field;
	const fieldState = field.state;

	const ids = DateRangeInput.useIds();

	return (
		<Field.Root
			className={className}
			invalid={field.invalid}
			disabled={field.disabled}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}>
			<DateRangeInput.Label id={ids.labelId}>
				{label}{" "}
				<Field.Requiredness optionalLabel={optionalLabel} />
			</DateRangeInput.Label>
			<DateRangeInput.Root
				state={fieldState}
				aria-labelledby={ids.labelId}
				aria-describedby={ids.describedBy(
					description !== undefined,
					field.invalid,
				)}
				value={value === undefined ? undefined : range}
				defaultValue={
					isoToDayRange(defaultValue, timeZone) ?? undefined
				}
				onChange={next =>
					onValueChange?.(dayRangeToIso(next))
				}
				onBlur={onBlur}
				minValue={isoToDay(minValue, timeZone) ?? undefined}
				maxValue={isoToDay(maxValue, timeZone) ?? undefined}
				startName={startName ?? `${ids.controlId}-start`}
				endName={endName ?? `${ids.controlId}-end`}
				isDisabled={field.disabled}
				isReadOnly={readOnly}
				isRequired={requiredness === "required"}
				isInvalid={field.invalid}>
				{({ isFocusWithin }) => (
					<>
						<DateRangeInput.Group
							state={{
								...fieldState,
								focused: isFocusWithin,
							}}>
							<DateRangeInput.Input slot="start">
								{segment => (
									<DateRangeInput.Segment
										segment={segment}
									/>
								)}
							</DateRangeInput.Input>
							<DateRangeInput.Separator>
								–
							</DateRangeInput.Separator>
							<DateRangeInput.Input slot="end">
								{segment => (
									<DateRangeInput.Segment
										segment={segment}
									/>
								)}
							</DateRangeInput.Input>
							<DateRangeInput.Spacer />
							{phase !== "fresh" && (
								<DateRangeInput.Pending />
							)}
							<DateRangeInput.Trigger
								ref={triggerRef}
								render={
									<IconButton
										label={openCalendarLabel}
										variant="tertiary"
										size="sm">
										{openCalendarIcon}
									</IconButton>
								}
							/>
						</DateRangeInput.Group>
						<DateRangeInput.Popup triggerRef={triggerRef}>
							<TemporalRangeCalendar
								visibleMonths={visibleMonths}
								previousMonthLabel={previousMonthLabel}
								nextMonthLabel={nextMonthLabel}
								monthLabel={monthLabel}
								yearLabel={yearLabel}
								noMatchingYearLabel={noMatchingYearLabel}
								previousIcon={previousIcon}
								nextIcon={nextIcon}
								checkIcon={checkIcon}
								expandIcon={expandIcon}
							/>
						</DateRangeInput.Popup>
					</>
				)}
			</DateRangeInput.Root>
			<DateRangeInput.Description id={ids.descriptionId}>
				{description}
			</DateRangeInput.Description>
			<DateRangeInput.Error id={ids.errorId}>
				{errors}
			</DateRangeInput.Error>
		</Field.Root>
	);
};
