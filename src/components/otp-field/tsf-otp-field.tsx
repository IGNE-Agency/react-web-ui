import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	OtpField,
	type OtpFieldProps,
} from "./otp-field.tsx";

export type TSFOtpFieldProps = Omit<
	OtpFieldProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
>;

/**
 * `OtpField` bound to the TanStack Form field it renders in. Registered as
 * `field.OtpField`.
 *
 * @example
 * <form.AppField name="code">
 * 	{field => <field.OtpField label="Verification code" optionalLabel="optional" slotLabel={(index, total) => `character ${index} of ${total}`} />}
 * </form.AppField>
 */
export const TSFOtpField = (
	props: TSFOtpFieldProps,
): ReactNode => {
	const { field, props: connected } =
		useConnectedField<string>();
	return (
		<OtpField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={field.handleChange}
		/>
	);
};
