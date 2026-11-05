import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	TimeField,
	type TimeFieldProps,
} from "./time-field.tsx";

export type TSFTimeFieldProps = Omit<
	TimeFieldProps,
	| keyof ConnectedFieldProps
	| "value"
	| "defaultValue"
	| "onValueChange"
>;

/**
 * `TimeField` bound to the TanStack Form field it renders in, reached as
 * `field.TimeField`. The field's value is a `"HH:mm"` string, or `null`.
 *
 * @example
 * <form.AppField name="startTime">
 * 	{field => <field.TimeField label="Start time" optionalLabel="optional" />}
 * </form.AppField>
 */
export const TSFTimeField = (
	props: TSFTimeFieldProps,
): ReactNode => {
	const { field, props: connected } = useConnectedField<
		string | null
	>();

	return (
		<TimeField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={next => field.handleChange(next)}
		/>
	);
};
