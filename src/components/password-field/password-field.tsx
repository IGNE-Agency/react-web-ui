import { type ReactNode, useState } from "react";
import type { ZxcvbnLanguages } from "../../lib/password-strength/password-strength.ts";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import { Field } from "../field/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import {
	TextInput,
	type TextFieldBaseProps,
} from "../text-field/index.ts";
import { PasswordStrength } from "./password-strength.tsx";
import { Spinner } from "../spinner/index.ts";

/** The strength meter. */
export type PasswordFieldStrengthProps = Readonly<{
	/** Shows the strength meter under the field. */
	strengthMeter?: boolean;
	/** zxcvbn language packs beside the kit's English and Dutch ones. */
	languages?: ZxcvbnLanguages;
}>;

/** Every `PasswordField` prop but the optional strength meter. */
export type PasswordFieldBaseProps = Omit<
	TextFieldBaseProps,
	| "type"
	| "icon"
	| "prefix"
	| "suffix"
	| "inputMode"
	| "maxLength"
	| "labelHidden"
>;

export type PasswordFieldProps = PasswordFieldBaseProps &
	PasswordFieldStrengthProps;

/**
 * A password field with a reveal toggle, and optionally a strength meter fed by
 * zxcvbn that suspends while the locale's dictionaries load.
 *
 * @example
 * <PasswordField
 * 	label="Password"
 * 	value={password}
 * 	onValueChange={setPassword}
 * 	autoComplete="current-password"
 * />
 */
export const PasswordField = ({
	label,
	description,
	errors,
	requiredness,
	strengthMeter = false,
	languages,
	value,
	onValueChange,
	disabled,
	readOnly,
	dirty,
	touched,
	pending,
	state,
	className,
	...inputProps
}: PasswordFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const [revealed, setRevealed] = useState(false);

	return (
		<TextInput.Root
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
			readOnly={readOnly}
			requiredness={requiredness}
			errors={errors}
			dirty={dirty}
			touched={touched}
			pending={pending}
			state={state}
			className={className}>
			<TextInput.Label>
				{label} <Field.Requiredness />
			</TextInput.Label>
			<TextInput.Group>
				<TextInput.Input
					{...inputProps}
					type={revealed ? "text" : "password"}
				/>
				<TextInput.Pending>
					<Spinner size={1} />
				</TextInput.Pending>
				<TextInput.Reveal
					revealed={revealed}
					onRevealedChange={setRevealed}
					render={
						<IconButton
							label={
								revealed
									? copy.password.hide
									: copy.password.show
							}
							variant="tertiary"
							size="sm">
							{revealed
								? icons.hidePassword
								: icons.showPassword}
						</IconButton>
					}
				/>
			</TextInput.Group>
			{strengthMeter && (
				<PasswordStrength
					password={value}
					languages={languages}
				/>
			)}
			<TextInput.Description>
				{description}
			</TextInput.Description>
			<TextInput.Error />
		</TextInput.Root>
	);
};
