import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Field,
	type FieldProps,
	type FieldRootProps,
	fieldStateAttributes,
	useFieldFocus,
	useFieldState,
} from "../field/index.ts";
import { useFormDisabled } from "../form/form-context.ts";
import style from "./checkbox.module.scss";

export type CheckboxRootProps = FieldRootProps &
	Pick<
		FieldProps,
		| "errors"
		| "requiredness"
		| "dirty"
		| "touched"
		| "pending"
	> &
	Readonly<{
		/** The box is checked. */
		filled?: boolean;
		readOnly?: boolean;
	}>;

/** The field around one checkbox, which projects its state as `data-*` attributes. */
const CheckboxRoot = ({
	errors,
	requiredness,
	dirty,
	touched,
	pending,
	filled,
	readOnly,
	disabled,
	className,
	...props
}: CheckboxRootProps): ReactNode => {
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled,
	});
	return (
		<Field.Root
			className={clsx(style.root, className)}
			disabled={field.disabled}
			invalid={field.invalid}
			dirty={dirty}
			touched={touched}
			{...fieldStateAttributes(field.state)}
			{...props}
		/>
	);
};

/** The label beside the box, which wraps the control and its text so the two share one hit area. */
const CheckboxLabel = ({
	className,
	...props
}: BaseField.Label.Props): ReactNode => (
	<BaseField.Label
		className={clsx(style.label, className)}
		{...props}
	/>
);

export type CheckboxControlProps = Omit<
	BaseCheckbox.Root.Props,
	| "checked"
	| "defaultChecked"
	| "onCheckedChange"
	| "indeterminate"
	| "disabled"
> &
	Readonly<{
		/** Whether the box is checked, when controlled. */
		checked?: boolean;
		/** Whether the box starts checked, when uncontrolled. */
		defaultChecked?: boolean;
		/** Called with the new checked state when the box is toggled. */
		onCheckedChange?: BaseCheckbox.Root.Props["onCheckedChange"];
		/** The box shows neither checked nor unchecked, for a parent over a mixed set. */
		indeterminate?: boolean;
		/** Whether the box ignores input. A busy form disables it too. @default false */
		disabled?: boolean;
	}>;

/** The box itself, which takes a `Checkbox.Indicator` as its child. */
const CheckboxControl = ({
	className,
	disabled = false,
	...props
}: CheckboxControlProps): ReactNode => {
	const focus = useFieldFocus(props);
	const formDisabled = useFormDisabled();
	return (
		<BaseCheckbox.Root
			className={clsx(style.control, className)}
			disabled={disabled || formDisabled}
			{...fieldStateAttributes(focus)}
			{...props}
			{...focus.props}
		/>
	);
};

export type CheckboxIndicatorProps =
	BaseCheckbox.Indicator.Props;

/** The mark inside the box, which pops in while it is checked or indeterminate. Its children are the mark. */
const CheckboxIndicator = ({
	className,
	keepMounted = true,
	...props
}: CheckboxIndicatorProps): ReactNode => (
	<BaseCheckbox.Indicator
		keepMounted={keepMounted}
		className={clsx(style.indicator, className)}
		{...props}
	/>
);

/** The parts of a checkbox. */
export type CheckboxParts = Readonly<{
	Root: typeof CheckboxRoot;
	Label: typeof CheckboxLabel;
	Control: typeof CheckboxControl;
	Indicator: typeof CheckboxIndicator;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
}>;

/**
 * The styled parts of a base-ui Checkbox: a box that fills when checked, with
 * the mark the app passes to `Indicator`. `Label` wraps the control and its
 * text, so the two share one hit area. For the ordinary case, use
 * `CheckboxField`.
 *
 * @example
 * <Checkbox.Root filled={agreed}>
 * 	<Checkbox.Label>
 * 		<Checkbox.Control checked={agreed} onCheckedChange={setAgreed}>
 * 			<Checkbox.Indicator><CheckIcon /></Checkbox.Indicator>
 * 		</Checkbox.Control>
 * 		I agree to the terms
 * 	</Checkbox.Label>
 * </Checkbox.Root>
 */
export const Checkbox: CheckboxParts = {
	Root: CheckboxRoot,
	Label: CheckboxLabel,
	Control: CheckboxControl,
	Indicator: CheckboxIndicator,
	Description: Field.Description,
	Error: Field.Error,
};
