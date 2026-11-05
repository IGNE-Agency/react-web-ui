import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	RadioGroupField,
	type RadioGroupFieldProps,
} from "./radio-group-field.tsx";

export type TSFRadioGroupFieldProps = Omit<
	RadioGroupFieldProps,
	| keyof ConnectedFieldProps
	| "value"
	| "defaultValue"
	| "onValueChange"
>;

/**
 * `RadioGroupField` bound to the TanStack Form field it renders in, whose value
 * is the chosen option's value or `null`. Reach it as `field.RadioGroupField`
 * inside `form.AppField`.
 *
 * @example
 * <form.AppField name="kind">
 * 	{field => <field.RadioGroupField label="Kind" options={kinds} optionalLabel="optional" />}
 * </form.AppField>
 */
export const TSFRadioGroupField = (
	props: TSFRadioGroupFieldProps,
): ReactNode => {
	const { field, props: connected } = useConnectedField<
		string | null
	>(props.label);

	return (
		<RadioGroupField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={next => field.handleChange(next)}
		/>
	);
};
