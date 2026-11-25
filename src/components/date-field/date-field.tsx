import { type ReactNode, useRef } from "react";
import { TemporalCalendar } from "../../lib/calendar/calendar-prefab.tsx";
import {
	dayToIso,
	isoToDay,
} from "../../lib/calendar/temporal-value.ts";
import { Spinner } from "../spinner/index.ts";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	useFieldState,
} from "../field/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import { useTimeZone } from "../time-zone-provider/index.ts";
import { DateInput } from "./date-input.tsx";

export type DateFieldProps = FieldProps &
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
 * 	value={date}
 * 	onValueChange={setDate}
 * />
 */
export const DateField = ({
	label,
	description,
	errors,
	requiredness,
	dirty,
	touched,
	pending,
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
	const copy = useCopy();
	const icons = useIcons();
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
				{label} <Field.Requiredness />
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
							{phase !== "fresh" && (
								<DateInput.Pending>
									<Spinner size={1} />
								</DateInput.Pending>
							)}
							<DateInput.Trigger
								ref={triggerRef}
								render={
									<IconButton
										label={copy.calendar.open}
										variant="tertiary"
										size="sm">
										{icons.calendar}
									</IconButton>
								}
							/>
						</DateInput.Group>
						<DateInput.Popup triggerRef={triggerRef}>
							<TemporalCalendar />
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
