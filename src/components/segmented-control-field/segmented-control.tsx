import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
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

export type SegmentedControlGroupProps = Omit<
	BaseToggleGroup.Props,
	"multiple"
> &
	Readonly<{
		/** Read-only groups still read, but no longer answer a press. */
		readOnly?: boolean;
		/** Paints the track with the error treatment. */
		invalid?: boolean;
	}>;

const SegmentedControlGroup = ({
	className,
	readOnly,
	invalid,
	disabled = false,
	onValueChange,
	children,
	...props
}: SegmentedControlGroupProps): ReactNode => {
	const formDisabled = useFormDisabled();
	return (
		<BaseToggleGroup
			className={clsx(style.group, className)}
			onValueChange={
				readOnly === true ? undefined : onValueChange
			}
			disabled={disabled || formDisabled}
			{...fieldStateAttributes({
				readonly: readOnly,
				validity: invalid === true ? "invalid" : undefined,
			})}
			{...props}>
			{children}
		</BaseToggleGroup>
	);
};

export type SegmentedControlOptionProps = BaseToggle.Props;

const SegmentedControlOption = ({
	className,
	children,
	...props
}: SegmentedControlOptionProps): ReactNode => {
	const focus = useFieldFocus(props);
	return (
		<BaseToggle
			className={clsx(style.option, className)}
			{...fieldStateAttributes(focus)}
			{...props}
			{...focus.props}>
			{children}
		</BaseToggle>
	);
};

export type SegmentedControlIndicatorProps = Omit<
	ComponentProps<"span">,
	"ref"
>;

/**
 * The pill that slides to the pressed option, after the options in the group.
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
		active: "[data-pressed]",
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
 * the pressed one falls inside it. Holds one `IndicatorLabel` per option, in
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
 * The styled parts of a single-choice base-ui ToggleGroup: a track of options,
 * one pressed at a time, with a pill that slides to it. The `Root` is a
 * fieldset named by its `Legend`. For the ordinary case, use
 * `SegmentedControlField`.
 *
 * @example
 * <SegmentedControl.Root filled={view !== null} requiredness="optional">
 * 	<SegmentedControl.Legend>View <Field.Requiredness optionalLabel="optional" /></SegmentedControl.Legend>
 * 	<SegmentedControl.Group value={view === null ? [] : [view]} onValueChange={next => setView(next[0] ?? null)}>
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
