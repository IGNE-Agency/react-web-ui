import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	fieldStateAttributes,
	useFieldState,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import {
	Checkbox,
	type CheckboxProps,
} from "./checkbox.tsx";
import style from "./checkbox.module.scss";

export type CheckboxFieldProps = FieldProps &
	Omit<CheckboxProps, "className" | "onBlur"> &
	Readonly<{
		onBlur?: FieldBlurHandler;
		/** Applied to the field wrapper, so callers can place the row. */
		className?: string;
	}>;

/**
 * The assembled checkbox: the label beside the box, which also toggles it, then
 * the description and the error.
 *
 * @example
 * <CheckboxField
 * 	label="I agree to the terms"
 * 	optionalLabel="optional"
 * 	checked={agreed}
 * 	onCheckedChange={setAgreed}
 * />
 */
export const CheckboxField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending,
	name,
	className,
	...props
}: CheckboxFieldProps): ReactNode => {
	const ids = Field.useIds();
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled: props.disabled,
		readOnly: props.readOnly,
		filled: props.checked === true,
	});

	return (
		<Field.Root
			name={name}
			className={clsx(style.root, className)}
			disabled={field.disabled}
			invalid={field.invalid}
			dirty={dirty}
			touched={touched}
			{...fieldStateAttributes(field.state)}>
			<BaseField.Label className={style.label}>
				<Checkbox
					name={ids.controlId}
					inputRef={detachHiddenInput}
					required={requiredness === "required"}
					{...props}
				/>
				<Field.InlineLabelText
					label={label}
					requiredness={requiredness}
					optionalLabel={optionalLabel}
				/>
			</BaseField.Label>
			<Field.Description>{description}</Field.Description>
			<Field.Error>{errors}</Field.Error>
		</Field.Root>
	);
};
