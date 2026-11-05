import type { ReactNode } from "react";
import {
	TextField,
	type TextFieldBaseProps,
	type TextFieldClearProps,
	type TextPresetProps,
} from "../text-field/index.ts";

/** What an email field takes beside the preset props: its leading icon, and the clear button. */
export type EmailFieldExtraProps = Pick<
	TextFieldBaseProps,
	"icon"
> &
	TextFieldClearProps;

export type EmailFieldProps = TextPresetProps &
	EmailFieldExtraProps;

/**
 * An email address field, with the keyboard that carries an `@` and the
 * platform's own address autofill.
 *
 * @example
 * <EmailField label="Email address" optionalLabel="optional" icon={<MailIcon />} value={email} onValueChange={setEmail} />
 */
export const EmailField = ({
	enterKeyHint = "next",
	...props
}: EmailFieldProps): ReactNode => (
	<TextField
		{...props}
		enterKeyHint={enterKeyHint}
		type="email"
		inputMode="email"
		autoComplete="email"
		autoCapitalize="none"
		spellCheck={false}
	/>
);
