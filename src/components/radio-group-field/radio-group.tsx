import { Field as BaseField } from "@base-ui/react/field";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Field,
	fieldStateAttributes,
	useFieldFocus,
} from "../field/index.ts";
import {
	FieldsetLegend,
	FieldsetRoot,
	type FieldsetRootProps,
} from "../fieldset/fieldset-root.tsx";
import style from "./radio-group.module.scss";

export type RadioGroupRootProps = FieldsetRootProps;

const RadioGroupGroup = <TValue,>({
	className,
	...props
}: BaseRadioGroup.Props<TValue>): ReactNode => (
	<BaseRadioGroup
		className={clsx(style.group, className)}
		{...props}
	/>
);

const RadioGroupItem = ({
	className,
	...props
}: BaseField.Item.Props): ReactNode => (
	<BaseField.Item
		className={clsx(style.item, className)}
		render={<BaseField.Label />}
		{...props}
	/>
);

/**
 * One radio, which takes a `RadioGroup.Indicator` as its child.
 *
 * @example
 * <RadioGroup.Radio value="direct"><RadioGroup.Indicator /></RadioGroup.Radio>
 */
const RadioGroupRadio = ({
	className,
	...props
}: BaseRadio.Root.Props): ReactNode => {
	const focus = useFieldFocus(props);
	return (
		<BaseRadio.Root
			className={clsx(style.radio, className)}
			aria-readonly={undefined}
			{...fieldStateAttributes(focus)}
			{...props}
			{...focus.props}
		/>
	);
};

/**
 * The dot inside a radio, which pops in while it is chosen.
 *
 * @example
 * <RadioGroup.Indicator />
 */
const RadioGroupIndicator = ({
	className,
	keepMounted = true,
	...props
}: BaseRadio.Indicator.Props): ReactNode => (
	<BaseRadio.Indicator
		keepMounted={keepMounted}
		className={clsx(style.indicator, className)}
		{...props}
	/>
);

/** The parts of a radio group. */
export type RadioGroupParts = Readonly<{
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Group: typeof RadioGroupGroup;
	Item: typeof RadioGroupItem;
	Radio: typeof RadioGroupRadio;
	Indicator: typeof RadioGroupIndicator;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a base-ui radio group. The `Root` is a fieldset named by
 * its `Legend`. For the ordinary case, use `RadioGroupField`.
 *
 * @example
 * <RadioGroup.Root filled={kind !== null} requiredness="optional">
 * 	<RadioGroup.Legend>Kind <Field.Requiredness optionalLabel="optional" /></RadioGroup.Legend>
 * 	<RadioGroup.Group value={kind} onValueChange={setKind}>
 * 		<RadioGroup.Item>
 * 			<RadioGroup.Radio value="direct">
 * 				<RadioGroup.Indicator />
 * 			</RadioGroup.Radio>
 * 			Direct
 * 		</RadioGroup.Item>
 * 	</RadioGroup.Group>
 * </RadioGroup.Root>
 */
export const RadioGroup: RadioGroupParts = {
	Root: FieldsetRoot,
	Legend: FieldsetLegend,
	Group: RadioGroupGroup,
	Item: RadioGroupItem,
	Radio: RadioGroupRadio,
	Indicator: RadioGroupIndicator,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
