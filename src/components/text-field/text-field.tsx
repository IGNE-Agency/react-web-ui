import type { ReactNode } from "react";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
} from "../field/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import {
	TextInput,
	type TextInputInputProps,
	type TextInputRootProps,
} from "./text-input.tsx";
import style from "./text-field.module.scss";
import { Spinner } from "../spinner/index.ts";

/** The clear button. */
export type TextFieldClearProps = Readonly<{
	/** Adds the clear button once the field holds a value. */
	clearable?: boolean;
}>;

/** The copy-to-clipboard button. */
export type TextFieldCopyProps = Readonly<{
	/** Adds a copy-to-clipboard button once the field holds a value. */
	copyable?: boolean;
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
		| "onFocus"
	> &
	Readonly<{
		onBlur?: FieldBlurHandler;
		/** Keeps the label in the accessibility tree but out of view. */
		labelHidden?: boolean;
		/** Decorative leading icon inside the group. */
		icon?: ReactNode;
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
	icon,
	prefix,
	suffix,
	clearable,
	copyable,
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
}: TextFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const copyLabels = {
		idle: copy.clipboard.copy,
		copied: copy.clipboard.copied,
		failed: copy.clipboard.failed,
	};
	const copyGlyphs = {
		idle: icons.copy,
		copied: icons.copied ?? icons.copy,
		failed: icons.copyFailed ?? icons.copy,
	};
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
			maxLength={maxLength}
			state={state}
			className={className}>
			<TextInput.Label
				className={
					labelHidden ? style.visuallyHidden : undefined
				}>
				{label} <Field.Requiredness />
			</TextInput.Label>
			<TextInput.Group>
				{icon !== undefined && (
					<TextInput.Inlay aria-hidden="true">
						{icon}
					</TextInput.Inlay>
				)}
				{prefix !== undefined && (
					<TextInput.Affix>{prefix}</TextInput.Affix>
				)}
				<TextInput.Input {...inputProps} />
				{suffix !== undefined && (
					<TextInput.Affix>{suffix}</TextInput.Affix>
				)}
				<TextInput.Pending>
					<Spinner size={1} />
				</TextInput.Pending>
				{clearable === true && (
					<TextInput.Clear
						render={
							<IconButton
								label={copy.clear}
								variant="tertiary"
								size="sm">
								{icons.clear}
							</IconButton>
						}
					/>
				)}
				{copyable === true && (
					<TextInput.Copy
						render={(props, { outcome }) => (
							<IconButton
								{...props}
								label={copyLabels[outcome]}
								tone={
									outcome === "failed" ? "danger" : "brand"
								}
								variant="tertiary"
								size="sm">
								{copyGlyphs[outcome]}
							</IconButton>
						)}
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
};
