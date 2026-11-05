import type { ReactNode } from "react";
import {
	TextField,
	type TextFieldBaseProps,
	type TextFieldClearProps,
	type TextPresetProps,
} from "../text-field/index.ts";

/** What a phone field takes beside the preset props: its `autoComplete`, and the clear button. */
export type PhoneFieldExtraProps = Pick<
	TextFieldBaseProps,
	"autoComplete"
> &
	TextFieldClearProps;

export type PhoneFieldProps = TextPresetProps &
	PhoneFieldExtraProps;

/**
 * A telephone field, with the telephone keypad. It offers the user's own number
 * only when told to, with `autoComplete="tel"` on a form about the signed-in
 * user. The number's rule belongs to the form's schema.
 *
 * @example
 * <PhoneField label="Phone number" optionalLabel="optional" autoComplete="tel" value={phone} onValueChange={setPhone} />
 */
export const PhoneField = (
	props: PhoneFieldProps,
): ReactNode => (
	<TextField
		{...props}
		type="tel"
		inputMode="tel"
		autoCapitalize="none"
		spellCheck={false}
	/>
);
