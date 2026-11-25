import { Field as BaseField } from "@base-ui/react/field";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
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
import { useFormDisabled } from "../form/form-context.ts";
import { useSlidingIndicator } from "../../lib/sliding-indicator/index.ts";
import style from "./segmented-control.module.scss";

export type SegmentedControlRootProps = FieldsetRootProps;

export type SegmentedControlGroupProps<
	TValue = string | null,
> = BaseRadioGroup.Props<TValue> &
	Readonly<{
		/** Lays the options out in a row or a column. */
		orientation?: "horizontal" | "vertical";
		/** Paints the track with the error treatment. */
		invalid?: boolean;
	}>;

const SegmentedControlGroup = <TValue,>({
	className,
	readOnly,
	invalid,
	orientation = "horizontal",
	disabled = false,
	...props
}: SegmentedControlGroupProps<TValue>): ReactNode => {
	const formDisabled = useFormDisabled();
	return (
		<BaseRadioGroup
			className={clsx(style.group, className)}
			readOnly={readOnly}
			disabled={disabled || formDisabled}
			data-orientation={orientation}
			{...fieldStateAttributes({
				readonly: readOnly,
				validity: invalid === true ? "invalid" : undefined,
			})}
			{...props}
		/>
	);
};

export type SegmentedControlOptionProps =
	BaseRadio.Root.Props;

/**
 * One option, a radio that carries its own label.
 *
 * @example
 * <SegmentedControl.Option value="list">List</SegmentedControl.Option>
 */
const SegmentedControlOption = ({
	className,
	children,
	...props
}: SegmentedControlOptionProps): ReactNode => {
	const focus = useFieldFocus(props);
	return (
		<BaseField.Item
			render={
				<BaseRadio.Root
					className={clsx(style.option, className)}
					{...fieldStateAttributes(focus)}
					{...props}
					{...focus.props}>
					{children}
				</BaseRadio.Root>
			}
		/>
	);
};

export type SegmentedControlIndicatorProps = Omit<
	ComponentProps<"span">,
	"ref"
>;

/**
 * The pill that slides to the chosen option, after the options in the group.
 * Arriving from an empty group it lands in place and pops. Give it
 * `IndicatorLabels` for ink that changes colour as the pill arrives.
 *
 * @example
 * <SegmentedControl.Indicator>
 * 	<SegmentedControl.IndicatorLabels>…</SegmentedControl.IndicatorLabels>
 * </SegmentedControl.Indicator>
 */
const SegmentedControlIndicator = ({
	className,
	...props
}: SegmentedControlIndicatorProps): ReactNode => {
	const ref = useSlidingIndicator<HTMLSpanElement>({
		active: "[data-checked]",
	});

	return (
		<span
			ref={ref}
			aria-hidden="true"
			className={clsx(style.indicator, className)}
			{...props}
		/>
	);
};

/**
 * A second copy of every option's label inside the pill, offset so that only
 * the chosen one falls inside it. Holds one `IndicatorLabel` per option, in
 * the order the group renders them.
 *
 * @example
 * <SegmentedControl.IndicatorLabels>
 * 	<SegmentedControl.IndicatorLabel>List</SegmentedControl.IndicatorLabel>
 * 	<SegmentedControl.IndicatorLabel>Board</SegmentedControl.IndicatorLabel>
 * </SegmentedControl.IndicatorLabels>
 */
const SegmentedControlIndicatorLabels = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.indicatorLabels, className)}
		{...props}
	/>
);

/**
 * One option's label as the pill shows it, matching that option's content.
 *
 * @example
 * <SegmentedControl.IndicatorLabel>List</SegmentedControl.IndicatorLabel>
 */
const SegmentedControlIndicatorLabel = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.option, className)}
		{...props}
	/>
);

/** The parts of a segmented control. */
export type SegmentedControlParts = Readonly<{
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Group: typeof SegmentedControlGroup;
	Option: typeof SegmentedControlOption;
	Indicator: typeof SegmentedControlIndicator;
	IndicatorLabels: typeof SegmentedControlIndicatorLabels;
	IndicatorLabel: typeof SegmentedControlIndicatorLabel;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a base-ui radio group drawn as a track of options, one
 * chosen at a time, with a pill that slides to it. The `Root` is a fieldset
 * named by its `Legend`. For the ordinary case, use `SegmentedControlField`.
 *
 * @example
 * <SegmentedControl.Root filled={view !== null} requiredness="optional">
 * 	<SegmentedControl.Legend>View <Field.Requiredness /></SegmentedControl.Legend>
 * 	<SegmentedControl.Group value={view} onValueChange={setView}>
 * 		<SegmentedControl.Option value="list">List</SegmentedControl.Option>
 * 		<SegmentedControl.Option value="board">Board</SegmentedControl.Option>
 * 		<SegmentedControl.Indicator>
 * 			<SegmentedControl.IndicatorLabels>
 * 				<SegmentedControl.IndicatorLabel>List</SegmentedControl.IndicatorLabel>
 * 				<SegmentedControl.IndicatorLabel>Board</SegmentedControl.IndicatorLabel>
 * 			</SegmentedControl.IndicatorLabels>
 * 		</SegmentedControl.Indicator>
 * 	</SegmentedControl.Group>
 * </SegmentedControl.Root>
 */
export const SegmentedControl: SegmentedControlParts = {
	Root: FieldsetRoot,
	Legend: FieldsetLegend,
	Group: SegmentedControlGroup,
	Option: SegmentedControlOption,
	Indicator: SegmentedControlIndicator,
	IndicatorLabels: SegmentedControlIndicatorLabels,
	IndicatorLabel: SegmentedControlIndicatorLabel,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
