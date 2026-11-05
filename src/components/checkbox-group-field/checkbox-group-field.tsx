import type { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import type { ReactNode } from "react";
import {
	type FieldBlurHandler,
	type FieldProps,
	detachHiddenInput,
} from "../field/index.ts";
import { CheckboxGroup } from "./checkbox-group.tsx";

/** One box of a checkbox group. */
export type CheckboxGroupItem = Readonly<{
	label: string;
	value: string;
}>;

export type CheckboxGroupFieldProps = FieldProps &
	Pick<
		BaseCheckboxGroup.Props,
		"value" | "defaultValue" | "onValueChange" | "disabled"
	> &
	Readonly<{
		/** The boxes, in the order they read. */
		items: readonly CheckboxGroupItem[];
		readOnly?: boolean;
		/** Prefixes each box's id, so ids stay stable across renders. */
		name?: string;
		onBlur?: FieldBlurHandler;
		/** Applied to the fieldset, so callers can place the group. */
		className?: string;
	}>;

/**
 * The assembled checkbox group: a fieldset named by its label, holding one box
 * per item, whose value is the array of ticked values; then the description
 * and the error.
 *
 * @example
 * <CheckboxGroupField
 * 	label="Statuses"
 * 	optionalLabel="optional"
 * 	items={[{ label: "Open", value: "open" }]}
 * 	value={statuses}
 * 	onValueChange={setStatuses}
 * />
 */
export const CheckboxGroupField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending,
	items,
	readOnly,
	name,
	onBlur,
	className,
	value,
	defaultValue,
	onValueChange,
	disabled,
}: CheckboxGroupFieldProps): ReactNode => {
	const { controlId } = CheckboxGroup.useIds();
	const prefix = name ?? controlId;

	return (
		<CheckboxGroup.Root
			name={name}
			className={className}
			disabled={disabled}
			readOnly={readOnly}
			errors={errors}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			pending={pending}
			filled={value !== undefined && value.length > 0}>
			<CheckboxGroup.Legend
				requiredness={requiredness}
				optionalLabel={optionalLabel}>
				{label}
			</CheckboxGroup.Legend>

			<CheckboxGroup.Group
				value={value}
				defaultValue={defaultValue}
				onValueChange={onValueChange}
				disabled={disabled}>
				{items.map(item => (
					<CheckboxGroup.Item key={item.value}>
						<CheckboxGroup.Checkbox
							id={`${prefix}-${item.value}`}
							name={prefix}
							inputRef={detachHiddenInput}
							value={item.value}
							onBlur={onBlur}
							readOnly={readOnly}
						/>
						{item.label}
					</CheckboxGroup.Item>
				))}
			</CheckboxGroup.Group>

			<CheckboxGroup.Description>
				{description}
			</CheckboxGroup.Description>
			<CheckboxGroup.Error>{errors}</CheckboxGroup.Error>
		</CheckboxGroup.Root>
	);
};
