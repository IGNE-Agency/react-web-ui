import { Field as BaseField } from "@base-ui/react/field";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Field,
	type FieldProps,
	type FieldRootProps,
	fieldStateAttributes,
	useFieldFocus,
} from "../field/index.ts";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import style from "./switch.module.scss";

export type SwitchRootProps = FieldRootProps &
	Pick<
		FieldProps,
		| "errors"
		| "requiredness"
		| "dirty"
		| "touched"
		| "pending"
	> &
	Readonly<{
		/** The switch is on. */
		filled?: boolean;
		readOnly?: boolean;
	}>;

const SwitchRoot = ({
	errors,
	requiredness,
	dirty,
	touched,
	pending,
	filled,
	readOnly,
	disabled,
	className,
	...props
}: SwitchRootProps): ReactNode => {
	const invalid = normalizeFieldErrors(errors).length > 0;
	return (
		<Field.Root
			className={clsx(style.root, className)}
			disabled={disabled}
			invalid={invalid}
			dirty={dirty}
			touched={touched}
			{...fieldStateAttributes({
				disabled,
				readonly: readOnly,
				requiredness,
				invalid,
				dirty,
				touched,
				pending,
				filled,
			})}
			{...props}
		/>
	);
};

const SwitchLabel = ({
	className,
	...props
}: BaseField.Label.Props): ReactNode => (
	<BaseField.Label
		className={clsx(style.label, className)}
		{...props}
	/>
);

const SwitchControl = ({
	className,
	...props
}: BaseSwitch.Root.Props): ReactNode => {
	const focus = useFieldFocus(props);
	return (
		<BaseSwitch.Root
			className={clsx(style.control, className)}
			{...fieldStateAttributes(focus)}
			{...props}
			{...focus.props}>
			<BaseSwitch.Thumb className={style.thumb} />
		</BaseSwitch.Root>
	);
};

/** The parts of a switch. */
export type SwitchParts = Readonly<{
	Root: typeof SwitchRoot;
	Label: typeof SwitchLabel;
	Control: typeof SwitchControl;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
}>;

/**
 * The styled parts of a base-ui Switch: a track with a sliding thumb that
 * announces as a switch. `Label` wraps the control and its text, so the two
 * share one hit area. For the ordinary case, use `SwitchField`.
 *
 * @example
 * <Switch.Root filled={enabled}>
 * 	<Switch.Label>
 * 		<Switch.Control checked={enabled} onCheckedChange={setEnabled} />
 * 		Email me about new messages
 * 	</Switch.Label>
 * </Switch.Root>
 */
export const Switch: SwitchParts = {
	Root: SwitchRoot,
	Label: SwitchLabel,
	Control: SwitchControl,
	Description: Field.Description,
	Error: Field.Error,
};
