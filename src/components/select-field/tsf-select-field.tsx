import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	SelectField,
	type SelectFieldProps,
} from "./select-field.tsx";

export type TSFSelectFieldProps<T extends string> = Omit<
	SelectFieldProps<T>,
	| keyof ConnectedFieldProps
	| "value"
	| "defaultValue"
	| "onValueChange"
>;

/**
 * `SelectField` bound to the TanStack Form field it renders in, whose value is
 * the selected option's value. Leaving the field, popup included, blurs it.
 * Reach it as `field.SelectField` inside `form.AppField`.
 *
 * @example
 * <form.AppField name="status">
 * 	{field => <field.SelectField label="Status" optionalLabel="optional" options={statusOptions} {...selectLabels} />}
 * </form.AppField>
 */
export const TSFSelectField = <T extends string>(
	props: TSFSelectFieldProps<T>,
): ReactNode => {
	const { field, props: connected } = useConnectedField<T>(
		props.label,
	);

	return (
		<SelectField<T>
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={next => field.handleChange(next)}
		/>
	);
};
