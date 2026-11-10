import { type ReactNode, useRef } from "react";
import {
	type CalendarIcons,
	type CalendarLabels,
	TemporalCalendar,
} from "../../lib/calendar/calendar-prefab.tsx";
import {
	dayToIso,
	isoToDay,
} from "../../lib/calendar/temporal-value.ts";
import { IconButton } from "../button/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	useFieldState,
} from "../field/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";
import { DateInput } from "./date-input.tsx";

export type DateFieldProps = FieldProps &
	CalendarLabels &
	CalendarIcons &
	Readonly<{
		/** Accessible name of the button that opens the calendar, such as "Open calendar". */
		openCalendarLabel: string;

		/** The icon of the button that opens the calendar. */
		openCalendarIcon: ReactNode;

		/**
		 * An ISO plain date, such as `"2026-07-24"`. A date-time or an instant is
		 * read as the day it falls on in the `TimeZoneProvider`'s zone.
		 */
		value?: string | null;

		/** The same, for an uncontrolled control. */
		defaultValue?: string | null;

		/** Called with the ISO plain date picked or typed, or `null` once cleared. */
		onValueChange?: (value: string | null) => void;

		onBlur?: FieldBlurHandler;

		/** Earliest selectable ISO plain date. */
		minValue?: string;

		/** Latest selectable ISO plain date. */
		maxValue?: string;

		name?: string;
		disabled?: boolean;
		readOnly?: boolean;

		/** Applied to the field wrapper, so callers can size the control. */
		className?: string;
	}>;

/**
 * A labelled date entry whose segments are typed or picked from a calendar
 * popover. Its value is an ISO plain-date string.
 *
 * @example
 * <DateField
 * 	label="Service date"
 * 	optionalLabel="optional"
 * 	openCalendarLabel="Open calendar"
 * 	previousMonthLabel="Previous month"
 * 	nextMonthLabel="Next month"
 * 	monthLabel="Month"
 * 	yearLabel="Year"
 * 	noMatchingYearLabel="No matching year."
 * 	openCalendarIcon={<CalendarTodayIcon />}
 * 	previousIcon={<ChevronLeftIcon />}
 * 	nextIcon={<ChevronRightIcon />}
 * 	checkIcon={<CheckIcon />}
 * 	value={date}
 * 	onValueChange={setDate}
 * />
 */
export const DateField = ({
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
	name,
	disabled,
	readOnly,
	className,
}: DateFieldProps): ReactNode => {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const timeZone = useTimeZone();
	const day = isoToDay(value, timeZone);
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled: day !== null,
	});
	const { phase } = field;
	const fieldState = field.state;

	const ids = DateInput.useIds();

	return (
		<Field.Root
			className={className}
			invalid={field.invalid}
			disabled={field.disabled}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}>
			<DateInput.Label id={ids.labelId}>
				{label}{" "}
				<Field.Requiredness optionalLabel={optionalLabel} />
			</DateInput.Label>
			<DateInput.Root
				state={fieldState}
				aria-labelledby={ids.labelId}
				aria-describedby={ids.describedBy(
					description !== undefined,
					field.invalid,
				)}
				value={value === undefined ? undefined : day}
				defaultValue={
					isoToDay(defaultValue, timeZone) ?? undefined
				}
				onChange={next => onValueChange?.(dayToIso(next))}
				onBlur={onBlur}
				minValue={isoToDay(minValue, timeZone) ?? undefined}
				maxValue={isoToDay(maxValue, timeZone) ?? undefined}
				name={name ?? ids.controlId}
				isDisabled={field.disabled}
				isReadOnly={readOnly}
				isRequired={requiredness === "required"}
				isInvalid={field.invalid}>
				{({ isFocusWithin }) => (
					<>
						<DateInput.Group
							state={{
								...fieldState,
								focused: isFocusWithin,
							}}>
							<DateInput.Input>
								{segment => (
									<DateInput.Segment segment={segment} />
								)}
							</DateInput.Input>
							{phase !== "fresh" && <DateInput.Pending />}
							<DateInput.Trigger
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
						</DateInput.Group>
						<DateInput.Popup triggerRef={triggerRef}>
							<TemporalCalendar
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
						</DateInput.Popup>
					</>
				)}
			</DateInput.Root>
			<DateInput.Description id={ids.descriptionId}>
				{description}
			</DateInput.Description>
			<DateInput.Error id={ids.errorId}>
				{errors}
			</DateInput.Error>
		</Field.Root>
	);
};
