import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	ToggleGroupField,
	type ToggleGroupFieldProps,
} from "./toggle-group-field.tsx";

export type TSFToggleGroupFieldProps = Omit<
	ToggleGroupFieldProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
>;

/**
 * `ToggleGroupField` bound to the TanStack Form field it renders in, whose value
 * is the list of chosen values. Reach it as `field.ToggleGroupField` inside
 * `form.AppField`.
 *
 * @example
 * <form.AppField name="days">
 * 	{field => <field.ToggleGroupField label="Days" optionalLabel="optional" options={days} />}
 * </form.AppField>
 */
export const TSFToggleGroupField = (
	props: TSFToggleGroupFieldProps,
): ReactNode => {
	const { field, props: connected } = useConnectedField<
		readonly string[]
	>(props.label);

	return (
		<ToggleGroupField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={value => field.handleChange(value)}
		/>
	);
};
