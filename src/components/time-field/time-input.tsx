import type { Time } from "@internationalized/date";
import type { ReactNode } from "react";
import {
	TimeField as AriaTimeField,
	type TimeFieldProps as AriaTimeFieldProps,
} from "react-aria-components";
import {
	isoToTimeOfDay,
	timeOfDayToIso,
} from "../../lib/calendar/temporal-value.ts";
import {
	TemporalFrame,
	TemporalGroup,
	type TemporalGroupProps,
	TemporalInput,
	type TemporalOwnedProps,
	type TemporalRootBaseProps,
	TemporalSegment,
} from "../../lib/calendar/temporal.tsx";
import {
	WiredDescription,
	WiredError,
	WiredLabel,
} from "../field/field-wiring.tsx";
import { InputPending } from "../field/input-parts.tsx";

export type TimeInputRootProps = TemporalRootBaseProps &
	Omit<AriaTimeFieldProps<Time>, TemporalOwnedProps> &
	Readonly<{
		/** A time of day as `"HH:mm"`, such as `"09:30"`. */
		value?: string | null;
		/** The same, for an uncontrolled control. */
		defaultValue?: string | null;
		/** Called with the `"HH:mm"` typed, or `null` once cleared. */
		onValueChange?: (value: string | null) => void;
		/** Submits the time under this name. */
		name?: string;
	}>;

/**
 * The field frame around a react-aria `TimeField`, holding its value as
 * `"HH:mm"` and projecting its state onto every part.
 *
 * @example
 * <TimeInput.Root value={startTime} onValueChange={setStartTime}>…</TimeInput.Root>
 */
const TimeInputRoot = ({
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
	name,
	children,
	...props
}: TimeInputRootProps): ReactNode => {
	const time = isoToTimeOfDay(value);
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
			filled={time !== null}
			render={(picker, controlId) => (
				<AriaTimeField<Time>
					{...props}
					{...picker}
					value={value === undefined ? undefined : time}
					defaultValue={
						isoToTimeOfDay(defaultValue) ?? undefined
					}
					onChange={next =>
						onValueChange?.(timeOfDayToIso(next))
					}
					onBlur={onBlur}
					name={name ?? controlId}>
					{children}
				</AriaTimeField>
			)}
		/>
	);
};

/**
 * The bordered box the segments and any inlay share. The segments are the
 * named group, so the box itself is presentational.
 *
 * @example
 * <TimeInput.Group><TimeInput.Input>…</TimeInput.Input></TimeInput.Group>
 */
const TimeInputGroup = (
	props: TemporalGroupProps,
): ReactNode => (
	<TemporalGroup role="presentation" {...props} />
);

/** The parts of a time input. */
export type TimeInputParts = Readonly<{
	Root: typeof TimeInputRoot;
	Label: typeof WiredLabel;
	Group: typeof TimeInputGroup;
	Input: typeof TemporalInput;
	Segment: typeof TemporalSegment;
	Pending: typeof InputPending;
	Description: typeof WiredDescription;
	Error: typeof WiredError;
}>;

/**
 * The styled parts of a react-aria `TimeField`, following react-aria's own
 * anatomy. `Root` draws the field frame and holds the value and the field's
 * states, and names and describes the segments by its `Label`, `Description`
 * and `Error`, so no part below it takes either again. Its `Group` is the
 * bordered box the segments and any inlay share. For the ordinary case, use
 * `TimeField`, which is assembled from exactly these parts.
 *
 * @example
 * <TimeInput.Root value={startTime} onValueChange={setStartTime} errors={errors} requiredness="required">
 * 	<TimeInput.Label>Start time <Field.Requiredness /></TimeInput.Label>
 * 	<TimeInput.Group>
 * 		<TimeInput.Input>
 * 			{segment => <TimeInput.Segment segment={segment} />}
 * 		</TimeInput.Input>
 * 		<TimeInput.Pending><Spinner size={1} /></TimeInput.Pending>
 * 	</TimeInput.Group>
 * 	<TimeInput.Description>The time the session started.</TimeInput.Description>
 * 	<TimeInput.Error />
 * </TimeInput.Root>
 */
export const TimeInput: TimeInputParts = {
	Root: TimeInputRoot,
	Label: WiredLabel,
	Group: TimeInputGroup,
	Input: TemporalInput,
	Segment: TemporalSegment,
	Pending: InputPending,
	Description: WiredDescription,
	Error: WiredError,
};
