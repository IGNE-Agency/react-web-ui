import { type ReactNode, useRef } from "react";
import { TemporalRangeCalendar } from "../../lib/calendar/calendar-prefab.tsx";
import type { IsoDateRange } from "../../lib/calendar/temporal-value.ts";
import { Spinner } from "../spinner/index.ts";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
} from "../field/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import { DateRangeInput } from "./date-range-input.tsx";

export type DateRangeFieldProps = FieldProps &
	Readonly<{
		/**
		 * Inclusive ISO plain dates, such as `{ start: "2026-07-01", end: "2026-07-31" }`.
		 * A date-time or an instant is read as the day it falls on in the
		 * `TimeZoneProvider`'s zone.
		 */
		value?: IsoDateRange | null;

		/** The same, for an uncontrolled control. */
		defaultValue?: IsoDateRange | null;

		/** Called with the inclusive ISO plain dates picked or typed, or `null` once cleared. */
		onValueChange?: (value: IsoDateRange | null) => void;

		onBlur?: FieldBlurHandler;

		/** Earliest selectable ISO plain date. */
		minValue?: string;

		/** Latest selectable ISO plain date. */
		maxValue?: string;

		/**
		 * Months the calendar shows side by side. The caller decides, for
		 * instance one on a narrow viewport. @default 1
		 */
		visibleMonths?: number;

		/** Form field name for the start date. */
		startName?: string;

		/** Form field name for the end date. */
		endName?: string;

		disabled?: boolean;
		readOnly?: boolean;

		/** Applied to the field wrapper, so callers can size the control. */
		className?: string;
	}>;

/**
 * A labelled start and end date, typed or picked from one range calendar. Its
 * value is a pair of inclusive ISO plain-date strings;
 * `isoDateRangeToInstants` turns it into query bounds. Assembled from
 * `DateRangeInput`'s parts.
 *
 * @example
 * <DateRangeField
 * 	label="Invoice period"
 * 	visibleMonths={narrow ? 1 : 2}
 * 	value={period}
 * 	onValueChange={setPeriod}
 * />
 */
export const DateRangeField = ({
	label,
	description,
	visibleMonths,
	...rootProps
}: DateRangeFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const triggerRef = useRef<HTMLButtonElement>(null);

	return (
		<DateRangeInput.Root {...rootProps}>
			<DateRangeInput.Label>
				{label} <Field.Requiredness />
			</DateRangeInput.Label>
			<DateRangeInput.Group>
				<DateRangeInput.Input slot="start">
					{segment => (
						<DateRangeInput.Segment segment={segment} />
					)}
				</DateRangeInput.Input>
				<DateRangeInput.Separator>
					–
				</DateRangeInput.Separator>
				<DateRangeInput.Input slot="end">
					{segment => (
						<DateRangeInput.Segment segment={segment} />
					)}
				</DateRangeInput.Input>
				<DateRangeInput.Spacer />
				<DateRangeInput.Pending>
					<Spinner size={1} />
				</DateRangeInput.Pending>
				<DateRangeInput.Trigger
					ref={triggerRef}
					render={
						<IconButton
							label={copy.calendar.open}
							variant="tertiary"
							size="sm">
							{icons.dateRange}
						</IconButton>
					}
				/>
			</DateRangeInput.Group>
			<DateRangeInput.Popup triggerRef={triggerRef}>
				<TemporalRangeCalendar
					visibleMonths={visibleMonths}
				/>
			</DateRangeInput.Popup>
			<DateRangeInput.Description>
				{description}
			</DateRangeInput.Description>
			<DateRangeInput.Error />
		</DateRangeInput.Root>
	);
};
