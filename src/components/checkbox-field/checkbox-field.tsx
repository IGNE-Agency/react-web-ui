import type { ReactNode } from "react";
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
		onBlur?: FieldBlurHandler;
		/** The mark the box shows while checked, such as a tick. */
		checkIcon: ReactNode;
		/** Applied to the field wrapper, so callers can place the row. */
		className?: string;
	}>;

/** The indeterminate state, with the mark it needs only when it is used. */
export type CheckboxFieldIndeterminateProps =
	| Readonly<{
			/** The box shows neither checked nor unchecked, for a parent over a mixed set. */
			indeterminate: boolean;
			/** The mark the box shows while indeterminate, such as a dash. */
			indeterminateIcon: ReactNode;
	  }>
	| Readonly<{
			indeterminate?: undefined;
			indeterminateIcon?: undefined;
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
 * 	optionalLabel="optional"
 * 	checkIcon={<CheckIcon />}
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
	checkIcon,
	indeterminateIcon,
	...props
}: CheckboxFieldProps): ReactNode => {
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
							? indeterminateIcon
							: checkIcon}
					</Checkbox.Indicator>
				</Checkbox.Control>
				<Field.InlineLabelText
					label={label}
					requiredness={requiredness}
					optionalLabel={optionalLabel}
				/>
			</Checkbox.Label>
			<Checkbox.Description>
				{description}
			</Checkbox.Description>
			<Checkbox.Error>{errors}</Checkbox.Error>
		</Checkbox.Root>
	);
};
