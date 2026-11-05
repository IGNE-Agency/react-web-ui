import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	DateField,
	type DateFieldProps,
} from "./date-field.tsx";

export type TSFDateFieldProps = Omit<
	DateFieldProps,
	| keyof ConnectedFieldProps
	| "value"
	| "defaultValue"
	| "onValueChange"
>;

/**
 * `DateField` bound to the TanStack Form field it renders in, reached as
 * `field.DateField`. The field's value is an ISO plain date, or `null`.
 *
 * @example
 * <form.AppField name="treatedOn">
 * 	{field => <field.DateField label="Treatment date" optionalLabel="optional" {...calendarLabels} />}
 * </form.AppField>
 */
export const TSFDateField = (
	props: TSFDateFieldProps,
): ReactNode => {
	const { field, props: connected } = useConnectedField<
		string | null
	>(props.label);

	return (
		<DateField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={next => field.handleChange(next)}
		/>
	);
};
