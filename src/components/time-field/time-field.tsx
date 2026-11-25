import type { ReactNode } from "react";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
} from "../field/index.ts";
import { Spinner } from "../spinner/index.ts";
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
 * `"HH:mm"` string. Assembled from `TimeInput`'s parts.
 *
 * @example
 * <TimeField label="Start time" value={startTime} onValueChange={setStartTime} />
 */
export const TimeField = ({
	label,
	description,
	...rootProps
}: TimeFieldProps): ReactNode => (
	<TimeInput.Root {...rootProps}>
		<TimeInput.Label>
			{label} <Field.Requiredness />
		</TimeInput.Label>
		<TimeInput.Group>
			<TimeInput.Input>
				{segment => <TimeInput.Segment segment={segment} />}
			</TimeInput.Input>
			<TimeInput.Pending>
				<Spinner size={1} />
			</TimeInput.Pending>
		</TimeInput.Group>
		<TimeInput.Description>
			{description}
		</TimeInput.Description>
		<TimeInput.Error />
	</TimeInput.Root>
);
