import VisibilityIcon from "@material-design-icons/svg/outlined/visibility.svg?react";
import VisibilityOffIcon from "@material-design-icons/svg/outlined/visibility_off.svg?react";
import { type ReactNode, useState } from "react";
import type { ZxcvbnLanguages } from "../../lib/password-strength/password-strength.ts";
import { Button } from "../button/index.ts";
import {
	TextInput,
	type TextFieldBaseProps,
} from "../text-field/index.ts";
import textInputStyle from "../text-field/text-field.module.scss";
import {
	PasswordStrength,
	type PasswordScoreLabels,
} from "./password-strength.tsx";

/** The strength meter: off, or on with the copy it shows. */
export type PasswordFieldStrengthProps =
	| Readonly<{
			strength?: false;
			strengthLabel?: undefined;
			scoreLabels?: undefined;
			languages?: undefined;
	  }>
	| Readonly<{
			/** Shows the strength meter and zxcvbn's own feedback. */
			strength: true;
			/** The meter's label, such as "Password strength". */
			strengthLabel: string;
			/** The name of each band, such as "Very weak" for 0. */
			scoreLabels: PasswordScoreLabels;
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
> &
	Readonly<{
		/** The reveal button's accessible name while the password is hidden, such as "Show password". */
		showPasswordLabel: string;
		/** The reveal button's accessible name while the password shows, such as "Hide password". */
		hidePasswordLabel: string;
	}>;

export type PasswordFieldProps = PasswordFieldBaseProps &
	PasswordFieldStrengthProps;

/**
 * A password field with a reveal toggle, and optionally a strength meter fed by
 * zxcvbn that suspends while the locale's dictionaries load.
 *
 * @example
 * <PasswordField
 * 	label="Password"
 * 	optionalLabel="optional"
 * 	showPasswordLabel="Show password"
 * 	hidePasswordLabel="Hide password"
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
	optionalLabel,
	showPasswordLabel,
	hidePasswordLabel,
	strength,
	strengthLabel,
	scoreLabels,
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
	const [revealed, setRevealed] = useState(false);

	return (
		<TextInput.Root
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
			readOnly={readOnly}
			requiredness={requiredness}
			optionalLabel={optionalLabel}
			errors={errors}
			dirty={dirty}
			touched={touched}
			pending={pending}
			state={state}
			className={className}>
			<TextInput.Label>{label}</TextInput.Label>
			<TextInput.Group>
				<TextInput.Input
					{...inputProps}
					type={revealed ? "text" : "password"}
				/>
				<TextInput.Pending />
				<Button
					iconOnly
					icon={
						revealed ? VisibilityOffIcon : VisibilityIcon
					}
					label={
						revealed ? hidePasswordLabel : showPasswordLabel
					}
					variant="tertiary"
					size="sm"
					aria-pressed={revealed}
					disabled={disabled}
					className={textInputStyle.action}
					onClick={() => setRevealed(!revealed)}
				/>
			</TextInput.Group>
			{strength === true && (
				<PasswordStrength
					password={value}
					label={strengthLabel}
					scoreLabels={scoreLabels}
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
