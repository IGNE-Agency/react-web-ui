import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	TextareaField,
	type TextareaFieldProps,
} from "./textarea-field.tsx";

export type TSFTextareaFieldProps = Omit<
	TextareaFieldProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
>;

/**
 * `TextareaField` bound to the TanStack Form field it renders in. Registered as
 * `field.TextareaField`.
 *
 * @example
 * <form.AppField name="note">
 * 	{field => <field.TextareaField label="Note" optionalLabel="optional" maxLength={2000} />}
 * </form.AppField>
 */
export const TSFTextareaField = (
	props: TSFTextareaFieldProps,
): ReactNode => {
	const { field, props: connected } =
		useConnectedField<string>(props.label);
	return (
		<TextareaField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={field.handleChange}
		/>
	);
};
