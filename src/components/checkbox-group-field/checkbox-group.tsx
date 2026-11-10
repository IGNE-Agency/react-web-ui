import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Checkbox } from "../checkbox-field/index.ts";
import { Field } from "../field/index.ts";
import {
	FieldsetLegend,
	FieldsetRoot,
	type FieldsetRootProps,
} from "../fieldset/fieldset-root.tsx";
import style from "./checkbox-group.module.scss";

export type CheckboxGroupRootProps = FieldsetRootProps;

/** The group of boxes, which holds the array of ticked values. */
const CheckboxGroupGroup = ({
	className,
	...props
}: BaseCheckboxGroup.Props): ReactNode => (
	<BaseCheckboxGroup
		className={clsx(style.group, className)}
		{...props}
	/>
);

/** One box's row: a label wrapping its `Control` and its text. */
const CheckboxGroupItem = ({
	className,
	...props
}: BaseField.Item.Props): ReactNode => (
	<BaseField.Item
		render={itemProps => (
			<BaseField.Label
				className={clsx(style.label, className)}
				{...itemProps}
			/>
		)}
		{...props}
	/>
);

/** The parts of a checkbox group. */
export type CheckboxGroupParts = Readonly<{
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Group: typeof CheckboxGroupGroup;
	Item: typeof CheckboxGroupItem;
	Control: typeof Checkbox.Control;
	Indicator: typeof Checkbox.Indicator;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a base-ui CheckboxGroup: one labelled box per value. The
 * `Root` is a fieldset named by its `Legend`. For the ordinary case, use
 * `CheckboxGroupField`.
 *
 * @example
 * <CheckboxGroup.Root filled={values.length > 0} requiredness="optional">
 * 	<CheckboxGroup.Legend>Statuses <Field.Requiredness optionalLabel="optional" /></CheckboxGroup.Legend>
 * 	<CheckboxGroup.Group value={values} onValueChange={setValues}>
 * 		<CheckboxGroup.Item>
 * 			<CheckboxGroup.Control value="open">
 * 				<CheckboxGroup.Indicator><CheckIcon /></CheckboxGroup.Indicator>
 * 			</CheckboxGroup.Control>
 * 			Open
 * 		</CheckboxGroup.Item>
 * 	</CheckboxGroup.Group>
 * </CheckboxGroup.Root>
 */
export const CheckboxGroup: CheckboxGroupParts = {
	Root: FieldsetRoot,
	Legend: FieldsetLegend,
	Group: CheckboxGroupGroup,
	Item: CheckboxGroupItem,
	Control: Checkbox.Control,
	Indicator: Checkbox.Indicator,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
