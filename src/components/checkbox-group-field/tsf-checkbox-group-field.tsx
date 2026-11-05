import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	CheckboxGroupField,
	type CheckboxGroupFieldProps,
} from "./checkbox-group-field.tsx";

export type TSFCheckboxGroupFieldProps = Omit<
	CheckboxGroupFieldProps,
	| keyof ConnectedFieldProps
	| "value"
	| "defaultValue"
	| "onValueChange"
>;

/**
 * `CheckboxGroupField` bound to the TanStack Form field it renders in, whose
 * value is the array of ticked values. Reach it as `field.CheckboxGroupField`
 * inside `form.AppField`.
 *
 * @example
 * <form.AppField name="statuses">
 * 	{field => <field.CheckboxGroupField label="Statuses" items={statuses} optionalLabel="optional" />}
 * </form.AppField>
 */
export const TSFCheckboxGroupField = (
	props: TSFCheckboxGroupFieldProps,
): ReactNode => {
	const { field, props: connected } = useConnectedField<
		string[]
	>(props.label);

	return (
		<CheckboxGroupField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={value => field.handleChange(value)}
		/>
	);
};
