import type { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	type ChoiceOption,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import { RadioGroup } from "./radio-group.tsx";

export type RadioGroupFieldProps = FieldProps &
	Pick<
		BaseRadioGroup.Props<string | null>,
		| "value"
		| "defaultValue"
		| "onValueChange"
		| "disabled"
		| "readOnly"
	> &
	Readonly<{
		/** The mutually exclusive choices, in the order they read. */
		options: readonly ChoiceOption[];
		onBlur?: FieldBlurHandler;
		/** The form field's name. */
		name?: string;
		/** Applied to the fieldset, so callers can size the group. */
		className?: string;
	}>;

/**
 * The assembled radio group: a fieldset named by its label, holding one radio
 * per option, then the description and the error.
 *
 * @example
 * <RadioGroupField
 * 	label="Kind"
 * 	optionalLabel="optional"
 * 	options={[{ label: "Direct", value: "direct" }]}
 * 	value={kind}
 * 	onValueChange={setKind}
 * />
 */
export const RadioGroupField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending,
	options,
	className,
	value,
	defaultValue,
	onValueChange,
	onBlur,
	name,
	disabled,
	readOnly,
}: RadioGroupFieldProps): ReactNode => {
	const ids = RadioGroup.useIds();

	return (
		<RadioGroup.Root
			name={name}
			className={className}
			disabled={disabled}
			readOnly={readOnly}
			errors={errors}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			pending={pending}
			filled={
				value !== undefined &&
				value !== null &&
				value !== ""
			}>
			<RadioGroup.Legend>
				{label}{" "}
				<Field.Requiredness optionalLabel={optionalLabel} />
			</RadioGroup.Legend>

			<RadioGroup.Group<string | null>
				value={value}
				defaultValue={defaultValue}
				onValueChange={onValueChange}
				onBlur={onBlur}
				name={name ?? ids.controlId}
				inputRef={detachHiddenInput}
				id={ids.controlId}
				disabled={disabled}
				readOnly={readOnly}
				required={requiredness === "required"}>
				{options.map(option => (
					<RadioGroup.Item
						key={option.value}
						disabled={option.disabled}>
						<RadioGroup.Radio value={option.value}>
							<RadioGroup.Indicator />
						</RadioGroup.Radio>
						{option.label}
					</RadioGroup.Item>
				))}
			</RadioGroup.Group>

			<RadioGroup.Description>
				{description}
			</RadioGroup.Description>
			<RadioGroup.Error>{errors}</RadioGroup.Error>
		</RadioGroup.Root>
	);
};
