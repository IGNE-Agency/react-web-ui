import AddIcon from "@material-design-icons/svg/outlined/add.svg?react";
import RemoveIcon from "@material-design-icons/svg/outlined/remove.svg?react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "../button/index.ts";
import {
	detachHiddenInput,
	Field,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	focusControlOnRim,
	useFieldFocus,
	useFieldState,
	withFieldFocus,
} from "../field/index.ts";
import {
	InputError,
	type InputErrorProps,
	InputLabel,
	type InputLabelProps,
	InputPartsContext,
	InputPending,
	type InputPendingProps,
	useInputPartsContext,
} from "../field/input-parts.tsx";
import { useLocale } from "../locale-provider/index.ts";
import style from "./number-field.module.scss";

export type NumberInputRootProps = Omit<
	FieldProps,
	"label" | "description"
> &
	Readonly<{
		value: number | null;
		onValueChange: (value: number | null) => void;
		/** How the amount is rendered and parsed inside the control. */
		format?: Intl.NumberFormatOptions;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		readOnly?: boolean;
		/** States no prop here owns, projected over the ones that do. */
		state?: FieldState;
		name?: string;
		id?: string;
		className?: string;
		children?: ReactNode;
	}>;

const NumberInputRoot = ({
	value,
	onValueChange,
	format,
	min,
	max,
	step,
	disabled,
	readOnly,
	requiredness,
	optionalLabel,
	errors,
	dirty,
	touched,
	pending = false,
	state,
	name,
	id,
	className,
	children,
}: NumberInputRootProps): ReactNode => {
	const ids = Field.useIds();
	const locale = useLocale();
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled: value !== null,
		state,
	});

	return (
		<InputPartsContext
			value={{
				state: field.state,
				errors,
				optionalLabel,
				phase: field.phase,
			}}>
			<Field.Root
				disabled={field.disabled}
				invalid={field.invalid}
				dirty={dirty}
				touched={touched}
				className={clsx(style.root, className)}
				{...fieldStateAttributes(field.state)}>
				<BaseNumberField.Root
					value={value}
					onValueChange={onValueChange}
					locale={locale}
					format={format}
					min={min}
					max={max}
					step={step}
					disabled={field.disabled}
					readOnly={readOnly}
					required={requiredness === "required"}
					name={name ?? ids.controlId}
					inputRef={detachHiddenInput}
					id={id}
					className={style.wrapper}>
					{children}
				</BaseNumberField.Root>
			</Field.Root>
		</InputPartsContext>
	);
};

export type NumberInputLabelProps = InputLabelProps;

export type NumberInputGroupProps = Omit<
	BaseNumberField.Group.Props,
	"className"
> &
	Readonly<{ className?: string }>;

const NumberInputGroup = ({
	className,
	children,
	...props
}: NumberInputGroupProps): ReactNode => {
	const { state } = useInputPartsContext();
	const focus = useFieldFocus(props);
	return (
		<BaseNumberField.Group
			className={clsx(style.group, className)}
			onMouseDown={focusControlOnRim}
			{...fieldStateAttributes(
				withFieldFocus(state, focus),
			)}
			{...props}
			{...focus.props}>
			{children}
		</BaseNumberField.Group>
	);
};

const NumberInputInlay = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.inlay, className)}
		{...props}
	/>
);

const NumberInputAffix = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		aria-hidden="true"
		className={clsx(style.inlay, className)}
		{...props}
	/>
);

export type NumberInputInputProps = Omit<
	BaseNumberField.Input.Props,
	"className"
> &
	Readonly<{ className?: string }>;

const NumberInputInput = ({
	className,
	...props
}: NumberInputInputProps): ReactNode => (
	<BaseNumberField.Input
		className={clsx(style.input, className)}
		{...props}
	/>
);

export type NumberInputStepProps = Readonly<{
	/** Accessible name and tooltip hint, such as "Increase". */
	label: string;
	className?: string;
}>;

const NumberInputDecrement = ({
	label,
	className,
}: NumberInputStepProps): ReactNode => (
	<Button
		iconOnly
		icon={RemoveIcon}
		label={label}
		variant="tertiary"
		size="sm"
		className={clsx(style.action, className)}
		render={<BaseNumberField.Decrement />}
	/>
);

const NumberInputIncrement = ({
	label,
	className,
}: NumberInputStepProps): ReactNode => (
	<Button
		iconOnly
		icon={AddIcon}
		label={label}
		variant="tertiary"
		size="sm"
		className={clsx(style.action, className)}
		render={<BaseNumberField.Increment />}
	/>
);

export type NumberInputPendingProps = InputPendingProps;

export type NumberInputErrorProps = InputErrorProps;

/** The parts of a number input. */
export type NumberInputParts = Readonly<{
	Root: typeof NumberInputRoot;
	Label: typeof InputLabel;
	Group: typeof NumberInputGroup;
	Inlay: typeof NumberInputInlay;
	Affix: typeof NumberInputAffix;
	Input: typeof NumberInputInput;
	Decrement: typeof NumberInputDecrement;
	Increment: typeof NumberInputIncrement;
	Pending: typeof InputPending;
	Description: typeof Field.Description;
	Error: typeof InputError;
}>;

/**
 * The parts of a number input: the field frame, a group carrying the border
 * with the stepper buttons and the bare control between them. For the ordinary
 * case, use the `NumberField` shorthand, which is assembled from exactly these
 * parts. An `Affix` is decoration, so its meaning belongs in the label or
 * description too. `Error` renders the errors `Root` was given.
 *
 * @example
 * <NumberInput.Root value={hours} onValueChange={setHours} optionalLabel="optional">
 * 	<NumberInput.Label>Hours</NumberInput.Label>
 * 	<NumberInput.Group>
 * 		<NumberInput.Decrement label="Decrease" />
 * 		<NumberInput.Input aria-roledescription="Number field" />
 * 		<NumberInput.Increment label="Increase" />
 * 	</NumberInput.Group>
 * 	<NumberInput.Error />
 * </NumberInput.Root>
 */
export const NumberInput: NumberInputParts = {
	Root: NumberInputRoot,
	Label: InputLabel,
	Group: NumberInputGroup,
	Inlay: NumberInputInlay,
	Affix: NumberInputAffix,
	Input: NumberInputInput,
	Decrement: NumberInputDecrement,
	Increment: NumberInputIncrement,
	Pending: InputPending,
	Description: Field.Description,
	Error: InputError,
};
