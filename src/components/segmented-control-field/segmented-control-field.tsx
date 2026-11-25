import type { ReactNode } from "react";
import {
	Field,
	type FieldBlurHandler,
	type ChoiceOption,
	type FieldProps,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import {
	SegmentedControl,
	type SegmentedControlGroupProps,
} from "./segmented-control.tsx";

export type SegmentedControlFieldProps = FieldProps &
	Readonly<{
		/** The choices, in the order they read. */
		options: readonly ChoiceOption[];
		/** The chosen value, or `null` while nothing is chosen. */
		value: string | null;
		/** Called with the chosen value. A radio cannot be unchosen, so it is never `null`. */
		onValueChange: (value: string) => void;
		onBlur?: FieldBlurHandler;
		/** The form field's name. */
		name?: string;
		disabled?: boolean;
		readOnly?: boolean;
		orientation?: SegmentedControlGroupProps["orientation"];
		/** Applied to the field wrapper, so callers can place the group. */
		className?: string;
	}>;

/**
 * The assembled segmented control: a labelled radio group drawn as a track of
 * options, one chosen at a time, with a pill that slides to it, then the
 * description and the error.
 *
 * @example
 * <SegmentedControlField
 * 	label="View"
 * 	options={[{ label: "List", value: "list" }, { label: "Board", value: "board" }]}
 * 	value={view}
 * 	onValueChange={setView}
 * />
 */
export const SegmentedControlField = ({
	label,
	description,
	errors,
	requiredness,
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
}: SegmentedControlFieldProps): ReactNode => {
	const { descriptionId, errorId, controlId, describedBy } =
		SegmentedControl.useIds();
	const invalid = normalizeFieldErrors(errors).length > 0;

	return (
		<SegmentedControl.Root
			name={name}
			className={className}
			disabled={disabled}
			readOnly={readOnly}
			errors={errors}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			pending={pending}
			filled={value !== null}>
			<SegmentedControl.Legend>
				{label} <Field.Requiredness />
			</SegmentedControl.Legend>

			<SegmentedControl.Group<string | null>
				aria-describedby={describedBy(
					description !== undefined,
					invalid,
				)}
				readOnly={readOnly}
				invalid={invalid}
				orientation={orientation}
				disabled={disabled}
				required={requiredness === "required"}
				name={name ?? controlId}
				inputRef={detachHiddenInput}
				id={controlId}
				value={value}
				onValueChange={next => {
					if (next !== null) {
						onValueChange(next);
					}
				}}
				onBlur={onBlur}>
				{options.map(option => (
					<SegmentedControl.Option
						key={option.value}
						value={option.value}
						disabled={option.disabled}>
						{option.label}
					</SegmentedControl.Option>
				))}
				<SegmentedControl.Indicator>
					<SegmentedControl.IndicatorLabels>
						{options.map(option => (
							<SegmentedControl.IndicatorLabel
								key={option.value}>
								{option.label}
							</SegmentedControl.IndicatorLabel>
						))}
					</SegmentedControl.IndicatorLabels>
				</SegmentedControl.Indicator>
			</SegmentedControl.Group>

			<SegmentedControl.Description id={descriptionId}>
				{description}
			</SegmentedControl.Description>
			<SegmentedControl.Error id={errorId}>
				{errors}
			</SegmentedControl.Error>
		</SegmentedControl.Root>
	);
};
