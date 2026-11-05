import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	NumberField,
	type NumberFieldProps,
} from "./number-field.tsx";

export type TSFNumberFieldProps = Omit<
	NumberFieldProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
>;

/**
 * `NumberField` bound to the TanStack Form field it renders in, whose value is
 * a `number | null`. Registered as `field.NumberField`.
 *
 * @example
 * <form.AppField name="hours">
 * 	{field => <field.NumberField label="Hours" optionalLabel="optional" decrementLabel="Decrease" incrementLabel="Increase" roleDescription="Number field" />}
 * </form.AppField>
 */
export const TSFNumberField = (
	props: TSFNumberFieldProps,
): ReactNode => {
	const { field, props: connected } = useConnectedField<
		number | null
	>();
	return (
		<NumberField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={field.handleChange}
		/>
	);
};
