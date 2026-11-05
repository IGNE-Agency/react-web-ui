import type { ReactNode } from "react";
import type { FieldProps } from "../field/index.ts";
import { Icon, type SvgComponent } from "../icon/index.ts";
import {
	TextInput,
	type TextInputInputProps,
	type TextInputRootProps,
} from "./text-input.tsx";
import style from "./text-field.module.scss";

/** The clear button: off, or on with its accessible name. */
export type TextFieldClearProps =
	| Readonly<{
			clearable?: false;
			clearLabel?: undefined;
	  }>
	| Readonly<{
			/** Adds the clear button once the field holds a value. */
			clearable: true;
			/** The clear button's accessible name and tooltip, such as "Clear". */
			clearLabel: string;
	  }>;

/** The copy-to-clipboard button: off, or on with the copy it shows. */
export type TextFieldCopyProps =
	| Readonly<{
			copyable?: false;
			copyLabel?: undefined;
			copiedLabel?: undefined;
			copyFailedLabel?: undefined;
	  }>
	| Readonly<{
			/** Adds a copy-to-clipboard button once the field holds a value. */
			copyable: true;
			/** The copy button's accessible name and tooltip, such as "Copy". */
			copyLabel: string;
			/** Announced once the value is on the clipboard, such as "Copied". */
			copiedLabel: string;
			/** Announced when copying failed and the text is selected instead. */
			copyFailedLabel: string;
	  }>;

/** Every `TextField` prop but the optional clear and copy buttons. */
export type TextFieldBaseProps = FieldProps &
	Omit<TextInputRootProps, keyof FieldProps | "children"> &
	Pick<
		TextInputInputProps,
		| "type"
		| "placeholder"
		| "name"
		| "id"
		| "autoComplete"
		| "autoCapitalize"
		| "inputMode"
		| "enterKeyHint"
		| "spellCheck"
		| "onBlur"
		| "onFocus"
	> &
	Readonly<{
		/** Keeps the label in the accessibility tree but out of view. */
		labelHidden?: boolean;
		/** Decorative leading icon inside the group. */
		icon?: SvgComponent;
		/** Static leading text, such as a currency sign. */
		prefix?: ReactNode;
		/** Static trailing text, such as a unit. */
		suffix?: ReactNode;
	}>;

export type TextFieldProps = TextFieldBaseProps &
	TextFieldClearProps &
	TextFieldCopyProps;

/**
 * A labelled text field: label, a bordered group holding the control with its
 * optional icon, affixes, pending spinner, clear and copy buttons, then the
 * counter, description and error. Assembled from `TextInput`'s parts.
 *
 * @example
 * <TextField
 * 	label="Name"
 * 	optionalLabel="optional"
 * 	value={name}
 * 	onValueChange={setName}
 * />
 */
export const TextField = ({
	label,
	labelHidden = false,
	description,
	errors,
	requiredness,
	optionalLabel,
	icon,
	prefix,
	suffix,
	clearable,
	clearLabel,
	copyable,
	copyLabel,
	copiedLabel,
	copyFailedLabel,
	value,
	onValueChange,
	disabled,
	readOnly,
	dirty,
	touched,
	pending,
	maxLength,
	state,
	className,
	...inputProps
}: TextFieldProps): ReactNode => (
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
		maxLength={maxLength}
		state={state}
		className={className}>
		<TextInput.Label
			className={
				labelHidden ? style.visuallyHidden : undefined
			}>
			{label}
		</TextInput.Label>
		<TextInput.Group>
			{icon !== undefined && (
				<TextInput.Inlay>
					<Icon svg={icon} label="" />
				</TextInput.Inlay>
			)}
			{prefix !== undefined && (
				<TextInput.Affix>{prefix}</TextInput.Affix>
			)}
			<TextInput.Input {...inputProps} />
			{suffix !== undefined && (
				<TextInput.Affix>{suffix}</TextInput.Affix>
			)}
			<TextInput.Pending />
			{clearable === true && (
				<TextInput.Clear label={clearLabel} />
			)}
			{copyable === true && (
				<TextInput.Copy
					label={copyLabel}
					copiedLabel={copiedLabel}
					failedLabel={copyFailedLabel}
				/>
			)}
		</TextInput.Group>
		<TextInput.Counter />
		<TextInput.Description>
			{description}
		</TextInput.Description>
		<TextInput.Error />
	</TextInput.Root>
);
