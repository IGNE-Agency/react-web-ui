import type { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ReactNode } from "react";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	detachHiddenInput,
} from "../field/index.ts";
import { Switch } from "./switch.tsx";

export type SwitchFieldProps = FieldProps &
	Pick<
		BaseSwitch.Root.Props,
		| "checked"
		| "defaultChecked"
		| "onCheckedChange"
		| "id"
		| "value"
		| "disabled"
		| "readOnly"
	> &
	Readonly<{
		onBlur?: FieldBlurHandler;
		/** The form field's name. */
		name?: string;
		/** Applied to the field wrapper, so callers can place the row. */
		className?: string;
	}>;

/**
 * The assembled switch: the label beside the track, which also toggles it, then
 * the description and the error.
 *
 * @example
 * <SwitchField
 * 	label="Email me about new messages"
 * 	optionalLabel="optional"
 * 	checked={enabled}
 * 	onCheckedChange={setEnabled}
 * />
 */
export const SwitchField = ({
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
}: SwitchFieldProps): ReactNode => {
	const ids = Field.useIds();

	return (
		<Switch.Root
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
			<Switch.Label>
				<Switch.Control
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
			</Switch.Label>
			<Switch.Description>{description}</Switch.Description>
			<Switch.Error>{errors}</Switch.Error>
		</Switch.Root>
	);
};
