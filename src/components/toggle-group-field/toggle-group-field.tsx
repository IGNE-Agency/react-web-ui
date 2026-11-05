import type { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type { ReactNode } from "react";
import type {
	FieldBlurHandler,
	ChoiceOption,
	FieldProps,
} from "../field/index.ts";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { ToggleGroup } from "./toggle-group.tsx";

export type ToggleGroupFieldProps = FieldProps &
	Readonly<{
		/** The choices, in the order they read. */
		options: readonly ChoiceOption[];
		/** The chosen values. */
		value: readonly string[];
		onValueChange: (value: readonly string[]) => void;
		onBlur?: FieldBlurHandler;
		/** The form field's name. */
		name?: string;
		disabled?: boolean;
		readOnly?: boolean;
		orientation?: BaseToggleGroup.Props["orientation"];
		/** Applied to the field wrapper, so callers can place the group. */
		className?: string;
	}>;

/**
 * The assembled toggle group: a labelled row of chips, any number of them
 * pressed, then the description and the error.
 *
 * @example
 * <ToggleGroupField
 * 	label="Days"
 * 	optionalLabel="optional"
 * 	options={[{ label: "Monday", value: "mon" }, { label: "Tuesday", value: "tue" }]}
 * 	value={days}
 * 	onValueChange={setDays}
 * />
 */
export const ToggleGroupField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending,
	options,
	value,
	onValueChange,
	onBlur,
	name,
	disabled,
	readOnly,
	orientation,
	className,
}: ToggleGroupFieldProps): ReactNode => {
	const { descriptionId, errorId, describedBy } =
		ToggleGroup.useIds();
	const invalid = normalizeFieldErrors(errors).length > 0;

	return (
		<ToggleGroup.Root
			name={name}
			className={className}
			disabled={disabled}
			readOnly={readOnly}
			errors={errors}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			pending={pending}
			filled={value.length > 0}>
			<ToggleGroup.Legend
				requiredness={requiredness}
				optionalLabel={optionalLabel}>
				{label}
			</ToggleGroup.Legend>

			<ToggleGroup.Group
				aria-describedby={describedBy(
					description !== undefined,
					invalid,
				)}
				readOnly={readOnly}
				invalid={invalid}
				orientation={orientation}
				disabled={disabled}
				value={value}
				onValueChange={next => onValueChange(next)}
				onBlur={onBlur}>
				{options.map(option => (
					<ToggleGroup.Option
						key={option.value}
						value={option.value}
						readOnly={readOnly}
						disabled={option.disabled}>
						{option.label}
					</ToggleGroup.Option>
				))}
			</ToggleGroup.Group>

			<ToggleGroup.Description id={descriptionId}>
				{description}
			</ToggleGroup.Description>
			<ToggleGroup.Error id={errorId}>
				{errors}
			</ToggleGroup.Error>
		</ToggleGroup.Root>
	);
};
