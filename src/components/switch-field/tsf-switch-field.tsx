import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	SwitchField,
	type SwitchFieldProps,
} from "./switch-field.tsx";

export type TSFSwitchFieldProps = Omit<
	SwitchFieldProps,
	| keyof ConnectedFieldProps
	| "checked"
	| "defaultChecked"
	| "onCheckedChange"
>;

/**
 * `SwitchField` bound to the TanStack Form field it renders in, whose value is
 * a boolean. Reach it as `field.SwitchField` inside `form.AppField`.
 *
 * @example
 * <form.AppField name="notify">
 * 	{field => <field.SwitchField label="Email me about new messages" optionalLabel="optional" />}
 * </form.AppField>
 */
export const TSFSwitchField = (
	props: TSFSwitchFieldProps,
): ReactNode => {
	const { field, props: connected } =
		useConnectedField<boolean>();

	return (
		<SwitchField
			{...props}
			{...connected}
			checked={field.state.value}
			onCheckedChange={checked =>
				field.handleChange(checked)
			}
		/>
	);
};
