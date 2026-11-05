import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import {
	Field,
	type FieldProps,
	detachHiddenInput,
	fieldStateAttributes,
} from "../field/index.ts";
import {
	Checkbox,
	type CheckboxProps,
} from "./checkbox.tsx";
import style from "./checkbox.module.scss";

export type CheckboxFieldProps = FieldProps &
	Omit<CheckboxProps, "className"> &
	Readonly<{
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
	const invalid = normalizeFieldErrors(errors).length > 0;

	return (
		<Field.Root
			name={name}
			className={clsx(style.root, className)}
			disabled={props.disabled}
			invalid={invalid}
			dirty={dirty}
			touched={touched}
			{...fieldStateAttributes({
				disabled: props.disabled,
				readonly: props.readOnly,
				requiredness,
				invalid,
				dirty,
				touched,
				pending,
				filled: props.checked === true,
			})}>
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
