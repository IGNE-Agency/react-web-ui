import { type ReactNode, useRef } from "react";
import type { CalendarLabels } from "../../lib/calendar/temporal.tsx";
import {
	dayToIso,
	isoToDay,
} from "../../lib/calendar/temporal-value.ts";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import type {
	FieldProps,
	FieldState,
} from "../field/index.ts";
import { useFormDisabled } from "../form/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";
import { DateInput } from "./date-input.tsx";

export type DateFieldProps = FieldProps &
	CalendarLabels &
	Readonly<{
		/** Accessible name of the button that opens the calendar, such as "Open calendar". */
		openCalendarLabel: string;

		/**
		 * An ISO plain date, such as `"2026-07-24"`. A date-time or an instant is
		 * read as the day it falls on in the `TimeZoneProvider`'s zone.
		 */
		value?: string | null;

		/** The same, for an uncontrolled control. */
		defaultValue?: string | null;

		/** Called with the ISO plain date picked or typed, or `null` once cleared. */
		onValueChange?: (value: string | null) => void;

		onBlur?: () => void;

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
 * 	label="Treatment date"
 * 	optionalLabel="optional"
 * 	openCalendarLabel="Open calendar"
 * 	previousMonthLabel="Previous month"
 * 	nextMonthLabel="Next month"
 * 	monthLabel="Month"
 * 	yearLabel="Year"
 * 	noMatchingYearLabel="No matching year."
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
	const formDisabled = useFormDisabled();
	const phase = useBusyPhase({ busy: pending === true });
	const invalid = normalizeFieldErrors(errors).length > 0;

	const fieldState: FieldState = {
		disabled: disabled === true || formDisabled,
		readonly: readOnly,
		requiredness,
		invalid,
		valid: touched === true && !invalid,
		dirty,
		touched,
		pending: phase !== "fresh",
		filled: day !== null,
	};

	return (
		<DateInput.Frame
			label={label}
			description={description}
			errors={errors}
			requiredness={requiredness}
			optionalLabel={optionalLabel}
			dirty={dirty}
			touched={touched}
			className={className}>
			{({ labelId, describedBy, controlId }) => (
				<DateInput.Root
					state={fieldState}
					aria-labelledby={labelId}
					aria-describedby={describedBy}
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
					name={name ?? controlId}
					isDisabled={disabled}
					isReadOnly={readOnly}
					isRequired={requiredness === "required"}
					isInvalid={invalid}>
					{({ isFocusWithin }) => (
						<>
							<DateInput.Group
								state={{
									...fieldState,
									focused: isFocusWithin,
								}}>
								<DateInput.Input />
								{phase !== "fresh" && <DateInput.Pending />}
								<DateInput.Trigger
									label={openCalendarLabel}
									ref={triggerRef}
								/>
							</DateInput.Group>
							<DateInput.Popup triggerRef={triggerRef}>
								<DateInput.Calendar
									previousMonthLabel={previousMonthLabel}
									nextMonthLabel={nextMonthLabel}
									monthLabel={monthLabel}
									yearLabel={yearLabel}
									noMatchingYearLabel={noMatchingYearLabel}
								/>
							</DateInput.Popup>
						</>
					)}
				</DateInput.Root>
			)}
		</DateInput.Frame>
	);
};
