import { type ReactNode, useRef } from "react";
import { TemporalCalendar } from "../../lib/calendar/calendar-prefab.tsx";
import { Spinner } from "../spinner/index.ts";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
} from "../field/index.ts";
import { useIcons } from "../icon-provider/index.ts";
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

		/** Called once focus has left the control. */
		onBlur?: FieldBlurHandler;

		/** Earliest selectable ISO plain date. */
		minValue?: string;

		/** Latest selectable ISO plain date. */
		maxValue?: string;

		/** Submits the date under this name. */
		name?: string;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Shows the value without letting it be changed. */
		readOnly?: boolean;

		/** Applied to the field wrapper, so callers can size the control. */
		className?: string;
	}>;

/**
 * A labelled date entry whose segments are typed or picked from a calendar
 * popover. Its value is an ISO plain-date string. Assembled from `DateInput`'s
 * parts.
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
	...rootProps
}: DateFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const triggerRef = useRef<HTMLButtonElement>(null);

	return (
		<DateInput.Root {...rootProps}>
			<DateInput.Label>
				{label} <Field.Requiredness />
			</DateInput.Label>
			<DateInput.Group>
				<DateInput.Input>
					{segment => (
						<DateInput.Segment segment={segment} />
					)}
				</DateInput.Input>
				<DateInput.Pending>
					<Spinner size={1} />
				</DateInput.Pending>
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
			<DateInput.Description>
				{description}
			</DateInput.Description>
			<DateInput.Error />
		</DateInput.Root>
	);
};
