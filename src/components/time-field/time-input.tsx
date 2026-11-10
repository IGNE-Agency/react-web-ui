import type { Time } from "@internationalized/date";
import type { ReactNode } from "react";
import {
	TimeField as AriaTimeField,
	type TimeFieldProps as AriaTimeFieldProps,
} from "react-aria-components";
import {
	TemporalGroup,
	TemporalInput,
	TemporalLabel,
	TemporalSegment,
	type TemporalStateProps,
} from "../../lib/calendar/temporal.tsx";
import {
	Field,
	fieldStateAttributes,
} from "../field/index.ts";

export type TimeInputRootProps = AriaTimeFieldProps<Time> &
	TemporalStateProps;

/**
 * A react-aria `TimeField` holding the value.
 *
 * @example
 * <TimeInput.Root aria-labelledby={labelId}>…</TimeInput.Root>
 */
const TimeInputRoot = ({
	state,
	...props
}: TimeInputRootProps): ReactNode => (
	<AriaTimeField<Time>
		validationBehavior="aria"
		{...fieldStateAttributes(state ?? {})}
		{...props}
	/>
);

/** The parts of a time input. */
export type TimeInputParts = Readonly<{
	Root: typeof TimeInputRoot;
	Label: typeof TemporalLabel;
	Group: typeof TemporalGroup;
	Input: typeof TemporalInput;
	Segment: typeof TemporalSegment;
	Pending: typeof Field.Pending;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a react-aria `TimeField`, following react-aria's own
 * anatomy. It sits in a `Field.Root` and names itself through `Label`'s id.
 * Its `Group` is the bordered box the segments and any inlay share. For the
 * ordinary case, use `TimeField`, which is assembled from exactly these parts.
 *
 * @example
 * const ids = TimeInput.useIds();
 *
 * <Field.Root>
 * 	<TimeInput.Label id={ids.labelId}>Start time</TimeInput.Label>
 * 	<TimeInput.Root aria-labelledby={ids.labelId}>
 * 		<TimeInput.Group role="presentation">
 * 			<TimeInput.Input>
 * 				{segment => <TimeInput.Segment segment={segment} />}
 * 			</TimeInput.Input>
 * 		</TimeInput.Group>
 * 	</TimeInput.Root>
 * </Field.Root>
 */
export const TimeInput: TimeInputParts = {
	Root: TimeInputRoot,
	Label: TemporalLabel,
	Group: TemporalGroup,
	Input: TemporalInput,
	Segment: TemporalSegment,
	Pending: Field.Pending,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
