import type { Time } from "@internationalized/date";
import type { ReactNode } from "react";
import {
	TimeField as AriaTimeField,
	type TimeFieldProps as AriaTimeFieldProps,
} from "react-aria-components";
import {
	TemporalFrame,
	TemporalGroup,
	TemporalInput,
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
	Frame: typeof TemporalFrame;
	Root: typeof TimeInputRoot;
	Group: typeof TemporalGroup;
	Input: typeof TemporalInput;
	Segment: typeof TemporalSegment;
	Pending: typeof Field.Pending;
}>;

/**
 * The styled parts of a react-aria `TimeField`, carrying the field frame's ids
 * rather than a label of their own. Its `Group` is the bordered box the
 * segments and any inlay share. For the ordinary case, use `TimeField`.
 *
 * @example
 * <TimeInput.Root aria-labelledby={labelId}>
 * 	<TimeInput.Group state={{ requiredness: "optional" }}>
 * 		<TimeInput.Input />
 * 	</TimeInput.Group>
 * </TimeInput.Root>
 */
export const TimeInput: TimeInputParts = {
	Frame: TemporalFrame,
	Root: TimeInputRoot,
	Group: TemporalGroup,
	Input: TemporalInput,
	Segment: TemporalSegment,
	Pending: Field.Pending,
};
