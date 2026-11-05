import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
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
import { useFormDisabled } from "../form/form-context.ts";
import style from "./toggle-group.module.scss";

export type ToggleGroupRootProps = FieldsetRootProps;

export type ToggleGroupGroupProps = Omit<
	BaseToggleGroup.Props,
	"multiple"
> &
	Readonly<{
		/** Read-only groups still read, but no longer answer a press. */
		readOnly?: boolean;
		/** Paints every chip with the error treatment. */
		invalid?: boolean;
	}>;

const ToggleGroupGroup = ({
	className,
	readOnly,
	invalid,
	disabled = false,
	onValueChange,
	children,
	...props
}: ToggleGroupGroupProps): ReactNode => {
	const formDisabled = useFormDisabled();
	return (
		<BaseToggleGroup
			multiple
			className={clsx(style.group, className)}
			onValueChange={
				readOnly === true ? undefined : onValueChange
			}
			disabled={disabled || formDisabled}
			{...fieldStateAttributes({
				validity: invalid === true ? "invalid" : undefined,
			})}
			{...props}>
			{children}
		</BaseToggleGroup>
	);
};

export type ToggleGroupOptionProps = BaseToggle.Props &
	Readonly<{
		/** Carries the read-only rim. */
		readOnly?: boolean;
	}>;

const ToggleGroupOption = ({
	className,
	readOnly,
	children,
	...props
}: ToggleGroupOptionProps): ReactNode => {
	const focus = useFieldFocus(props);
	return (
		<BaseToggle
			className={clsx(style.option, className)}
			{...fieldStateAttributes({
				readonly: readOnly,
				...focus,
			})}
			{...props}
			{...focus.props}>
			{children}
		</BaseToggle>
	);
};

/** The parts of a toggle group. */
export type ToggleGroupParts = Readonly<{
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Group: typeof ToggleGroupGroup;
	Option: typeof ToggleGroupOption;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a multiple-choice base-ui ToggleGroup: a wrapping row of
 * chips, any number of them pressed. The `Root` is a fieldset named by its
 * `Legend`. For the ordinary case, use `ToggleGroupField`.
 *
 * @example
 * <ToggleGroup.Root filled={days.length > 0}>
 * 	<ToggleGroup.Legend optionalLabel="optional">Days</ToggleGroup.Legend>
 * 	<ToggleGroup.Group value={days} onValueChange={setDays}>
 * 		<ToggleGroup.Option value="mon">Monday</ToggleGroup.Option>
 * 		<ToggleGroup.Option value="tue">Tuesday</ToggleGroup.Option>
 * 	</ToggleGroup.Group>
 * </ToggleGroup.Root>
 */
export const ToggleGroup: ToggleGroupParts = {
	Root: FieldsetRoot,
	Legend: FieldsetLegend,
	Group: ToggleGroupGroup,
	Option: ToggleGroupOption,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
