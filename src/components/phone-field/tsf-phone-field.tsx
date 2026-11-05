import type { ReactNode } from "react";
import {
	connectTextPreset,
	type TSFTextPresetProps,
} from "../text-field/index.ts";
import {
	PhoneField,
	type PhoneFieldExtraProps,
} from "./phone-field.tsx";

export type TSFPhoneFieldProps =
	TSFTextPresetProps<PhoneFieldExtraProps>;

/**
 * `PhoneField` bound to the TanStack Form field it renders in. Registered as
 * `field.PhoneField`.
 *
 * @example
 * <form.AppField name="phone">
 * 	{field => <field.PhoneField label="Phone number" optionalLabel="optional" autoComplete="tel" />}
 * </form.AppField>
 */
export const TSFPhoneField: (
	props: TSFPhoneFieldProps,
) => ReactNode =
	connectTextPreset<PhoneFieldExtraProps>(PhoneField);
