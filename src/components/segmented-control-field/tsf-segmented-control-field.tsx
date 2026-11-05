import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	SegmentedControlField,
	type SegmentedControlFieldProps,
} from "./segmented-control-field.tsx";

export type TSFSegmentedControlFieldProps = Omit<
	SegmentedControlFieldProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
>;

/**
 * `SegmentedControlField` bound to the TanStack Form field it renders in, whose
 * value is the chosen option's value or `null`. Reach it as
 * `field.SegmentedControlField` inside `form.AppField`.
 *
 * @example
 * <form.AppField name="view">
 * 	{field => <field.SegmentedControlField label="View" optionalLabel="optional" options={views} />}
 * </form.AppField>
 */
export const TSFSegmentedControlField = (
	props: TSFSegmentedControlFieldProps,
): ReactNode => {
	const { field, props: connected } = useConnectedField<
		string | null
	>();

	return (
		<SegmentedControlField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={value => field.handleChange(value)}
		/>
	);
};
