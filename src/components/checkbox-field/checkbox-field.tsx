import type { ReactNode } from "react";
import { useIcons } from "../icon-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import {
	Checkbox,
	type CheckboxControlProps,
} from "./checkbox.tsx";

export type CheckboxFieldBaseProps = FieldProps &
	Omit<
		CheckboxControlProps,
		"className" | "onBlur" | "children" | "indeterminate"
	> &
	Readonly<{
		/** Called once focus has left the control. */
		onBlur?: FieldBlurHandler;
		/** Applied to the field wrapper, so callers can place the row. */
		className?: string;
	}>;

/** The indeterminate state. */
export type CheckboxFieldIndeterminateProps = Readonly<{
	/** The box shows neither checked nor unchecked, for a parent over a mixed set. */
	indeterminate?: boolean;
}>;

export type CheckboxFieldProps = CheckboxFieldBaseProps &
	CheckboxFieldIndeterminateProps;

/**
 * The assembled checkbox: the label beside the box, which also toggles it, then
 * the description and the error.
 *
 * @example
 * <CheckboxField
 * 	label="I agree to the terms"
 * 	checked={agreed}
 * 	onCheckedChange={setAgreed}
 * />
 */
export const CheckboxField = ({
	label,
	description,
	errors,
	requiredness,
	dirty,
	touched,
	pending,
	name,
	className,
	...props
}: CheckboxFieldProps): ReactNode => {
	const icons = useIcons();
	const ids = Field.useIds();

	return (
		<Checkbox.Root
			name={name}
			className={className}
			disabled={props.disabled}
			readOnly={props.readOnly}
			errors={errors}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			pending={pending}
			filled={props.checked === true}>
			<Checkbox.Label>
				<Checkbox.Control
					name={ids.controlId}
					inputRef={detachHiddenInput}
					required={requiredness === "required"}
					{...props}>
					<Checkbox.Indicator>
						{props.indeterminate === true
							? icons.indeterminate
							: icons.check}
					</Checkbox.Indicator>
				</Checkbox.Control>
				<Field.InlineLabelText>
					{label} <Field.RequiredMark />
				</Field.InlineLabelText>
				<Field.InlineOptional />
			</Checkbox.Label>
			<Checkbox.Description>
				{description}
			</Checkbox.Description>
			<Checkbox.Error>{errors}</Checkbox.Error>
		</Checkbox.Root>
	);
};
