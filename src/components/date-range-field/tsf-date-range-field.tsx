import type { ReactNode } from "react";
import type { IsoDateRange } from "../../lib/calendar/temporal-value.ts";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	DateRangeField,
	type DateRangeFieldProps,
} from "./date-range-field.tsx";

export type TSFDateRangeFieldProps = Omit<
	DateRangeFieldProps,
	| keyof ConnectedFieldProps
	| "value"
	| "defaultValue"
	| "onValueChange"
	| "startName"
	| "endName"
>;

/**
 * `DateRangeField` bound to the TanStack Form field it renders in, reached as
 * `field.DateRangeField`. The field's value is a pair of inclusive ISO plain
 * dates, or `null`.
 *
 * @example
 * <form.AppField name="period">
 * 	{field => <field.DateRangeField label="Period" optionalLabel="optional" openCalendarLabel="Open calendar" {...calendarLabels} />}
 * </form.AppField>
 */
export const TSFDateRangeField = (
	props: TSFDateRangeFieldProps,
): ReactNode => {
	const {
		field,
		props: { name, ...connected },
	} = useConnectedField<IsoDateRange | null>(props.label);

	return (
		<DateRangeField
			{...props}
			{...connected}
			startName={`${name}.start`}
			endName={`${name}.end`}
			value={field.state.value}
			onValueChange={next => field.handleChange(next)}
		/>
	);
};
