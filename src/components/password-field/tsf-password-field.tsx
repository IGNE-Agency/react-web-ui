import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	PasswordField,
	type PasswordFieldBaseProps,
	type PasswordFieldStrengthProps,
} from "./password-field.tsx";

export type TSFPasswordFieldProps = Omit<
	PasswordFieldBaseProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
> &
	PasswordFieldStrengthProps;

/**
 * `PasswordField` bound to the TanStack Form field it renders in. Registered as
 * `field.PasswordField`.
 *
 * @example
 * <form.AppField name="password">
 * 	{field => <field.PasswordField label="Password" optionalLabel="optional" showPasswordLabel="Show password" hidePasswordLabel="Hide password" />}
 * </form.AppField>
 */
export const TSFPasswordField = (
	props: TSFPasswordFieldProps,
): ReactNode => {
	const { field, props: connected } =
		useConnectedField<string>(props.label);
	return (
		<PasswordField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={field.handleChange}
		/>
	);
};
