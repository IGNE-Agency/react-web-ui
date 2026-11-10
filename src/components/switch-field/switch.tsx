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
	useFieldState,
} from "../field/index.ts";
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
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled,
	});
	return (
		<Field.Root
			className={clsx(style.root, className)}
			disabled={field.disabled}
			invalid={field.invalid}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			{...fieldStateAttributes(field.state)}
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

/**
 * The track, which takes a `Switch.Thumb` as its child.
 *
 * @example
 * <Switch.Control checked={enabled} onCheckedChange={setEnabled}><Switch.Thumb /></Switch.Control>
 */
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
			{...focus.props}
		/>
	);
};

/**
 * The thumb that slides along the track.
 *
 * @example
 * <Switch.Thumb />
 */
const SwitchThumb = ({
	className,
	...props
}: BaseSwitch.Thumb.Props): ReactNode => (
	<BaseSwitch.Thumb
		className={clsx(style.thumb, className)}
		{...props}
	/>
);

/** The parts of a switch. */
export type SwitchParts = Readonly<{
	Root: typeof SwitchRoot;
	Label: typeof SwitchLabel;
	Control: typeof SwitchControl;
	Thumb: typeof SwitchThumb;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
}>;

/**
 * The styled parts of a base-ui Switch: a track with a sliding thumb that
 * announces as a switch. `Label` wraps the control and its text, so the two
 * share one hit area. For the ordinary case, use `SwitchField`.
 *
 * @example
 * <Switch.Root filled={enabled} requiredness="optional">
 * 	<Switch.Label>
 * 		<Switch.Control checked={enabled} onCheckedChange={setEnabled}>
 * 			<Switch.Thumb />
 * 		</Switch.Control>
 * 		<Field.InlineLabelText>Email me about new messages <Field.RequiredMark /></Field.InlineLabelText>
 * 		<Field.InlineOptional optionalLabel="optional" />
 * 	</Switch.Label>
 * </Switch.Root>
 */
export const Switch: SwitchParts = {
	Root: SwitchRoot,
	Label: SwitchLabel,
	Control: SwitchControl,
	Thumb: SwitchThumb,
	Description: Field.Description,
	Error: Field.Error,
};
