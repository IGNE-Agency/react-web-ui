import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	CheckboxField,
	type CheckboxFieldProps,
} from "./checkbox-field.tsx";

export type TSFCheckboxFieldProps = Omit<
	CheckboxFieldProps,
	| keyof ConnectedFieldProps
	| "checked"
	| "defaultChecked"
	| "onCheckedChange"
>;

/**
 * `CheckboxField` bound to the TanStack Form field it renders in, whose value
 * is a boolean. Reach it as `field.CheckboxField` inside `form.AppField`.
 *
 * @example
 * <form.AppField name="terms">
 * 	{field => <field.CheckboxField label="I agree to the terms" requiredness="required" optionalLabel="optional" />}
 * </form.AppField>
 */
export const TSFCheckboxField = (
	props: TSFCheckboxFieldProps,
): ReactNode => {
	const { field, props: connected } =
		useConnectedField<boolean>();

	return (
		<CheckboxField
			{...props}
			{...connected}
			checked={field.state.value}
			onCheckedChange={checked =>
				field.handleChange(checked)
			}
		/>
	);
};
