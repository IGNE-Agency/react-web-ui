import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import type { ReactNode } from "react";
import {
	TextField,
	type TextFieldClearProps,
	type TextPresetProps,
} from "../text-field/index.ts";

export type EmailFieldProps = TextPresetProps &
	TextFieldClearProps;

/**
 * An email address field, with the keyboard that carries an `@` and the
 * platform's own address autofill.
 *
 * @example
 * <EmailField label="Email address" optionalLabel="optional" value={email} onValueChange={setEmail} />
 */
export const EmailField = ({
	enterKeyHint = "next",
	...props
}: EmailFieldProps): ReactNode => (
	<TextField
		{...props}
		enterKeyHint={enterKeyHint}
		icon={MailIcon}
		type="email"
		inputMode="email"
		autoComplete="email"
		autoCapitalize="none"
		spellCheck={false}
	/>
);
