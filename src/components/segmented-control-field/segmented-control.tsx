import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Field,
	fieldStateAttributes,
	useFieldFocus,
	type ChoiceOption,
} from "../field/index.ts";
import {
	FieldsetLegend,
	FieldsetRoot,
	type FieldsetRootProps,
} from "../field/fieldset.tsx";
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
	onValueChange,
	children,
	...props
}: SegmentedControlGroupProps): ReactNode => (
	<BaseToggleGroup
		className={clsx(style.group, className)}
		onValueChange={
			readOnly === true ? undefined : onValueChange
		}
		{...fieldStateAttributes({
			readonly: readOnly,
			invalid,
		})}
		{...props}>
		{children}
	</BaseToggleGroup>
);

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

export type SegmentedControlIndicatorProps = Readonly<{
	/** The choices, in the order the group renders them. */
	options: readonly ChoiceOption[];
}>;

/**
 * The pill that slides to the pressed option. It holds a second copy of every
 * label, offset so that only the pressed one falls inside the pill, so the ink
 * changes colour as the pill arrives rather than the instant the value does.
 * Arriving from an empty group it lands in place and pops.
 *
 * @example
 * <SegmentedControl.Indicator options={options} />
 */
const SegmentedControlIndicator = ({
	options,
}: SegmentedControlIndicatorProps): ReactNode => {
	const ref = useSlidingIndicator<HTMLSpanElement>({
		active: "[data-pressed]",
	});

	return (
		<span
			ref={ref}
			aria-hidden="true"
			className={style.indicator}>
			<span className={style.indicatorLabels}>
				{options.map(option => (
					<span key={option.value} className={style.option}>
						{option.label}
					</span>
				))}
			</span>
		</span>
	);
};

/** The parts of a segmented control. */
export type SegmentedControlParts = Readonly<{
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Group: typeof SegmentedControlGroup;
	Option: typeof SegmentedControlOption;
	Indicator: typeof SegmentedControlIndicator;
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
 * <SegmentedControl.Root filled={view !== null}>
 * 	<SegmentedControl.Legend optionalLabel="optional">View</SegmentedControl.Legend>
 * 	<SegmentedControl.Group value={view === null ? [] : [view]} onValueChange={next => setView(next[0] ?? null)}>
 * 		<SegmentedControl.Option value="list">List</SegmentedControl.Option>
 * 		<SegmentedControl.Option value="board">Board</SegmentedControl.Option>
 * 		<SegmentedControl.Indicator options={views} />
 * 	</SegmentedControl.Group>
 * </SegmentedControl.Root>
 */
export const SegmentedControl: SegmentedControlParts = {
	Root: FieldsetRoot,
	Legend: FieldsetLegend,
	Group: SegmentedControlGroup,
	Option: SegmentedControlOption,
	Indicator: SegmentedControlIndicator,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
