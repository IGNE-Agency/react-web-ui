import type { ReactNode } from "react";
import {
	isoToTimeOfDay,
	timeOfDayToIso,
} from "../../lib/calendar/temporal-value.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	useFieldState,
} from "../field/index.ts";
import { TimeInput } from "./time-input.tsx";

export type TimeFieldProps = FieldProps &
	Readonly<{
		/** A time of day as `"HH:mm"`, such as `"09:30"`. */
		value?: string | null;

		/** The same, for an uncontrolled control. */
		defaultValue?: string | null;

		/** Called with the `"HH:mm"` typed, or `null` once cleared. */
		onValueChange?: (value: string | null) => void;

		onBlur?: FieldBlurHandler;

		name?: string;
		disabled?: boolean;
		readOnly?: boolean;

		/** Applied to the field wrapper, so callers can size the control. */
		className?: string;
	}>;

/**
 * A labelled time entry whose hour and minute segments follow the
 * `LocaleProvider`'s locale, so Dutch reads as 24-hour. Its value is a
 * `"HH:mm"` string.
 *
 * @example
 * <TimeField label="Start time" optionalLabel="optional" value={startTime} onValueChange={setStartTime} />
 */
export const TimeField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending,
	value,
	defaultValue,
	onValueChange,
	onBlur,
	name,
	disabled,
	readOnly,
	className,
}: TimeFieldProps): ReactNode => {
	const time = isoToTimeOfDay(value);
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled: time !== null,
	});
	const { phase } = field;
	const fieldState = field.state;

	const ids = TimeInput.useIds();

	return (
		<Field.Root
			className={className}
			invalid={field.invalid}
			disabled={field.disabled}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}>
			<TimeInput.Label id={ids.labelId}>
				{label}{" "}
				<Field.Requiredness optionalLabel={optionalLabel} />
			</TimeInput.Label>
			<TimeInput.Root
				state={fieldState}
				aria-labelledby={ids.labelId}
				aria-describedby={ids.describedBy(
					description !== undefined,
					field.invalid,
				)}
				value={value === undefined ? undefined : time}
				defaultValue={
					isoToTimeOfDay(defaultValue) ?? undefined
				}
				onChange={next =>
					onValueChange?.(timeOfDayToIso(next))
				}
				onBlur={onBlur}
				name={name ?? ids.controlId}
				isDisabled={field.disabled}
				isReadOnly={readOnly}
				isRequired={requiredness === "required"}
				isInvalid={field.invalid}>
				<TimeInput.Group
					role="presentation"
					state={fieldState}>
					<TimeInput.Input>
						{segment => (
							<TimeInput.Segment segment={segment} />
						)}
					</TimeInput.Input>
					{phase !== "fresh" && <TimeInput.Pending />}
				</TimeInput.Group>
			</TimeInput.Root>
			<TimeInput.Description id={ids.descriptionId}>
				{description}
			</TimeInput.Description>
			<TimeInput.Error id={ids.errorId}>
				{errors}
			</TimeInput.Error>
		</Field.Root>
	);
};
