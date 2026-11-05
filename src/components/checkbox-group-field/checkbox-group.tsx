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

const CheckboxGroupGroup = ({
	className,
	...props
}: BaseCheckboxGroup.Props): ReactNode => (
	<BaseCheckboxGroup
		className={clsx(style.group, className)}
		{...props}
	/>
);

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
	Checkbox: typeof Checkbox;
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
 * <CheckboxGroup.Root filled={values.length > 0}>
 * 	<CheckboxGroup.Legend optionalLabel="optional">Statuses</CheckboxGroup.Legend>
 * 	<CheckboxGroup.Group value={values} onValueChange={setValues}>
 * 		<CheckboxGroup.Item>
 * 			<CheckboxGroup.Checkbox value="open" />
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
	Checkbox,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
