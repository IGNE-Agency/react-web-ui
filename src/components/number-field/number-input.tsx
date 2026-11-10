import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type {
	ComponentProps,
	ComponentPropsWithRef,
	ReactElement,
	ReactNode,
} from "react";
import {
	Field,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
	useFieldState,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import { focusControlOnRim } from "../field/rim-focus.ts";
import { withFieldFocus } from "../field/use-field-focus.ts";
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
import { renderAs } from "../../lib/render-as.tsx";
import { useLocale } from "../locale-provider/index.ts";
import style from "./number-field.module.scss";

export type NumberInputRootProps = Omit<
	FieldProps,
	"label" | "description" | "optionalLabel"
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

/**
 * The field frame around a number input, holding its value, format and bounds
 * and projecting its state onto every part.
 *
 * @example
 * <NumberInput.Root value={hours} onValueChange={setHours}>…</NumberInput.Root>
 */
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
				phase: field.phase,
			}}>
			<Field.Root
				disabled={field.disabled}
				invalid={field.invalid}
				requiredness={field.state.requiredness}
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

/**
 * The bordered box holding the control, its stepper buttons and its inlays.
 *
 * @example
 * <NumberInput.Group><NumberInput.Input /></NumberInput.Group>
 */
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

/**
 * A slot beside the control inside the group, such as an icon.
 *
 * @example
 * <NumberInput.Inlay aria-hidden="true"><EuroIcon /></NumberInput.Inlay>
 */
const NumberInputInlay = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.inlay, className)}
		{...props}
	/>
);

/**
 * Static text beside the control, such as a unit. Decoration only.
 *
 * @example
 * <NumberInput.Affix>kg</NumberInput.Affix>
 */
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

/**
 * The bare control, formatting and parsing `Root`'s value.
 *
 * @example
 * <NumberInput.Input aria-roledescription="Number field" />
 */
const NumberInputInput = ({
	className,
	...props
}: NumberInputInputProps): ReactNode => (
	<BaseNumberField.Input
		className={clsx(style.input, className)}
		{...props}
	/>
);

export type NumberInputStepProps = Omit<
	BaseNumberField.Decrement.Props,
	"render" | "children"
> &
	Readonly<{
		/** The button to render, such as `<IconButton label="Increase" variant="tertiary" size="sm"><AddIcon /></IconButton>`. */
		render: useRender.RenderProp;
	}>;

/**
 * Hands a stepper's props to the button it renders, without the name the
 * stepper gives itself when the caller gave none, so the button names itself.
 *
 * @example
 * <BaseNumberField.Decrement render={stepRender(render, props["aria-label"])} />
 */
const stepRender =
	(
		render: useRender.RenderProp,
		ownLabel: string | undefined,
	) =>
	({
		"aria-label": stepperLabel,
		...props
	}: ComponentPropsWithRef<"button">): ReactElement =>
		renderAs(render)(
			ownLabel === undefined
				? props
				: { ...props, "aria-label": stepperLabel },
		);

/**
 * The button that steps the value down. It renders whichever button it is
 * given.
 *
 * @example
 * <NumberInput.Decrement
 * 	render={
 * 		<IconButton label="Decrease" variant="tertiary" size="sm">
 * 			<RemoveIcon />
 * 		</IconButton>
 * 	}
 * />
 */
const NumberInputDecrement = ({
	render,
	className,
	...props
}: NumberInputStepProps): ReactNode => (
	<BaseNumberField.Decrement
		className={clsx(style.action, className)}
		{...props}
		render={stepRender(render, props["aria-label"])}
	/>
);

/**
 * The button that steps the value up. It renders whichever button it is
 * given.
 *
 * @example
 * <NumberInput.Increment
 * 	render={
 * 		<IconButton label="Increase" variant="tertiary" size="sm">
 * 			<AddIcon />
 * 		</IconButton>
 * 	}
 * />
 */
const NumberInputIncrement = ({
	render,
	className,
	...props
}: NumberInputStepProps): ReactNode => (
	<BaseNumberField.Increment
		className={clsx(style.action, className)}
		{...props}
		render={stepRender(render, props["aria-label"])}
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
 * <NumberInput.Root value={hours} onValueChange={setHours} requiredness="optional">
 * 	<NumberInput.Label>Hours <Field.Requiredness optionalLabel="optional" /></NumberInput.Label>
 * 	<NumberInput.Group>
 * 		<NumberInput.Decrement
 * 			render={
 * 				<IconButton label="Decrease" variant="tertiary" size="sm">
 * 					<RemoveIcon />
 * 				</IconButton>
 * 			}
 * 		/>
 * 		<NumberInput.Input aria-roledescription="Number field" />
 * 		<NumberInput.Increment
 * 			render={
 * 				<IconButton label="Increase" variant="tertiary" size="sm">
 * 					<AddIcon />
 * 				</IconButton>
 * 			}
 * 		/>
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
