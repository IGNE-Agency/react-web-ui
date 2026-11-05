import type { ReactNode } from "react";
import {
	connectTextPreset,
	type TSFTextPresetProps,
} from "../text-field/index.ts";
import {
	EmailField,
	type EmailFieldExtraProps,
} from "./email-field.tsx";

export type TSFEmailFieldProps =
	TSFTextPresetProps<EmailFieldExtraProps>;

/**
 * `EmailField` bound to the TanStack Form field it renders in. Registered as
 * `field.EmailField`.
 *
 * @example
 * <form.AppField name="email">
 * 	{field => <field.EmailField label="Email address" optionalLabel="optional" />}
 * </form.AppField>
 */
export const TSFEmailField: (
	props: TSFEmailFieldProps,
) => ReactNode =
	connectTextPreset<EmailFieldExtraProps>(EmailField);
