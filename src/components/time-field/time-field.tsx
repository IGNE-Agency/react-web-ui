import type { ReactNode } from "react";
import {
	isoToTimeOfDay,
	timeOfDayToIso,
} from "../../lib/calendar/temporal-value.ts";
import {
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

	return (
		<TimeInput.Frame
			label={label}
			description={description}
			errors={errors}
			requiredness={requiredness}
			optionalLabel={optionalLabel}
			dirty={dirty}
			touched={touched}
			className={className}>
			{({ labelId, describedBy, controlId }) => (
				<TimeInput.Root
					state={fieldState}
					aria-labelledby={labelId}
					aria-describedby={describedBy}
					value={value === undefined ? undefined : time}
					defaultValue={
						isoToTimeOfDay(defaultValue) ?? undefined
					}
					onChange={next =>
						onValueChange?.(timeOfDayToIso(next))
					}
					onBlur={onBlur}
					name={name ?? controlId}
					isDisabled={field.disabled}
					isReadOnly={readOnly}
					isRequired={requiredness === "required"}
					isInvalid={field.invalid}>
					<TimeInput.Group
						role="presentation"
						state={fieldState}>
						<TimeInput.Input />
						{phase !== "fresh" && <TimeInput.Pending />}
					</TimeInput.Group>
				</TimeInput.Root>
			)}
		</TimeInput.Frame>
	);
};
