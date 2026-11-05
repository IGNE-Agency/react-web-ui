import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	TextField,
	type TextFieldBaseProps,
	type TextFieldClearProps,
	type TextFieldCopyProps,
} from "./text-field.tsx";

export type TSFTextFieldProps = Omit<
	TextFieldBaseProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
> &
	TextFieldClearProps &
	TextFieldCopyProps;

/**
 * `TextField` bound to the TanStack Form field it renders in. Registered as
 * `field.TextField`.
 *
 * @example
 * <form.AppField name="name">
 * 	{field => <field.TextField label="Name" optionalLabel="optional" />}
 * </form.AppField>
 */
export const TSFTextField = (
	props: TSFTextFieldProps,
): ReactNode => {
	const { field, props: connected } =
		useConnectedField<string>();
	return (
		<TextField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={field.handleChange}
		/>
	);
};
