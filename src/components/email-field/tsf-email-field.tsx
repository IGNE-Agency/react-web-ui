import type { ReactNode } from "react";
import {
	connectTextPreset,
	type TextFieldClearProps,
	type TSFTextPresetProps,
} from "../text-field/index.ts";
import { EmailField } from "./email-field.tsx";

export type TSFEmailFieldProps =
	TSFTextPresetProps<TextFieldClearProps>;

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
	connectTextPreset<TextFieldClearProps>(EmailField);
