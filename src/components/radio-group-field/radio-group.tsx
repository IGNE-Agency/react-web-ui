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
} from "../field/fieldset.tsx";
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
			{...focus.props}>
			<BaseRadio.Indicator
				keepMounted
				className={style.indicator}
			/>
		</BaseRadio.Root>
	);
};

/** The parts of a radio group. */
export type RadioGroupParts = Readonly<{
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Group: typeof RadioGroupGroup;
	Item: typeof RadioGroupItem;
	Radio: typeof RadioGroupRadio;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a base-ui radio group. The `Root` is a fieldset named by
 * its `Legend`. For the ordinary case, use `RadioGroupField`.
 *
 * @example
 * <RadioGroup.Root filled={kind !== null}>
 * 	<RadioGroup.Legend optionalLabel="optional">Kind</RadioGroup.Legend>
 * 	<RadioGroup.Group value={kind} onValueChange={setKind}>
 * 		<RadioGroup.Item>
 * 			<RadioGroup.Radio value="direct" />
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
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
