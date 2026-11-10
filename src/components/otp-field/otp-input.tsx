import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Field,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
	useFieldState,
} from "../field/index.ts";
import {
	InputError,
	type InputErrorProps,
	InputLabel,
	type InputLabelProps,
	InputPartsContext,
	InputPending,
	type InputPendingProps,
} from "../field/input-parts.tsx";
import { withFieldFocus } from "../field/use-field-focus.ts";
import {
	type OtpInputBaseProps,
	OtpInputContext,
	useOtpInputContext,
} from "./otp-input-context.ts";
import style from "./otp-field.module.scss";

const DEFAULT_LENGTH = 6;

export type { OtpInputBaseProps };

export type OtpInputRootProps = Omit<
	FieldProps,
	"label" | "description" | "optionalLabel"
> &
	OtpInputBaseProps &
	Readonly<{
		value: string;
		onValueChange: (value: string) => void;
		/** Number of character slots. @default 6 */
		length?: number;
		/** States no prop here owns, projected over the ones that do. */
		state?: FieldState;
		className?: string;
		children?: ReactNode;
	}>;

/**
 * The field frame around an OTP input, holding its value and length and
 * projecting its state onto every part.
 *
 * @example
 * <OtpInput.Root value={code} onValueChange={setCode}>…</OtpInput.Root>
 */
const OtpInputRoot = ({
	length = DEFAULT_LENGTH,
	requiredness,
	errors,
	dirty,
	touched,
	pending = false,
	state,
	className,
	children,
	...base
}: OtpInputRootProps): ReactNode => {
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled: base.disabled,
		readOnly: base.readOnly,
		filled: base.value !== "",
		state,
	});

	return (
		<InputPartsContext
			value={{
				state: field.state,
				errors,
				phase: field.phase,
			}}>
			<OtpInputContext
				value={{
					state: field.state,
					length,
					base: {
						...base,
						disabled: field.disabled,
						length,
					},
				}}>
				<Field.Root
					disabled={field.disabled}
					invalid={field.invalid}
					requiredness={field.state.requiredness}
					dirty={dirty}
					touched={touched}
					className={clsx(style.root, className)}
					{...fieldStateAttributes(field.state)}>
					{children}
				</Field.Root>
			</OtpInputContext>
		</InputPartsContext>
	);
};

export type OtpInputLabelProps = InputLabelProps;

export type OtpInputGroupProps = Omit<
	BaseOTPField.Root.Props,
	| keyof OtpInputBaseProps
	| "className"
	| "value"
	| "defaultValue"
	| "onValueChange"
	| "length"
> &
	Readonly<{ className?: string }>;

/**
 * The row of character slots, bound to `Root`'s value.
 *
 * @example
 * <OtpInput.Group><OtpInput.Slots slotLabel={slotLabel} /></OtpInput.Group>
 */
const OtpInputGroup = ({
	className,
	...props
}: OtpInputGroupProps): ReactNode => {
	const { state, base } = useOtpInputContext();
	return (
		<BaseOTPField.Root
			{...base}
			className={clsx(style.group, className)}
			{...fieldStateAttributes(state)}
			{...props}
		/>
	);
};

export type OtpInputInputProps = Omit<
	BaseOTPField.Input.Props,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * One character slot.
 *
 * @example
 * <OtpInput.Input aria-label="character 2 of 6" />
 */
const OtpInputInput = ({
	className,
	...props
}: OtpInputInputProps): ReactNode => {
	const { state } = useOtpInputContext();
	const focus = useFieldFocus(props);
	return (
		<BaseOTPField.Input
			className={clsx(style.slot, className)}
			{...fieldStateAttributes(
				withFieldFocus(state, focus),
			)}
			{...props}
			{...focus.props}
		/>
	);
};

export type OtpInputSeparatorProps = Omit<
	BaseOTPField.Separator.Props,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * A divider between groups of slots.
 *
 * @example
 * <OtpInput.Separator />
 */
const OtpInputSeparator = ({
	className,
	...props
}: OtpInputSeparatorProps): ReactNode => (
	<BaseOTPField.Separator
		className={clsx(style.separator, className)}
		{...props}
	/>
);

/** Names a slot past the first by its 1-based position, such as "character 2 of 6". */
export type OtpSlotLabel = (
	index: number,
	total: number,
) => string;

export type OtpInputSlotsProps = Readonly<{
	/** Names a slot past the first by its 1-based position, such as "character 2 of 6". */
	slotLabel: OtpSlotLabel;
}>;

/**
 * Every slot of the input: the first takes its name from the field's label, the
 * rest are named by `slotLabel`.
 *
 * @example
 * <OtpInput.Slots slotLabel={(index, total) => `character ${index} of ${total}`} />
 */
const OtpInputSlots = ({
	slotLabel,
}: OtpInputSlotsProps): ReactNode => {
	const { length } = useOtpInputContext();
	return Array.from({ length }, (_, index) => (
		<OtpInputInput
			key={index}
			aria-label={
				index === 0
					? undefined
					: slotLabel(index + 1, length)
			}
		/>
	));
};

export type OtpInputPendingProps = InputPendingProps;

export type OtpInputErrorProps = InputErrorProps;

/** The parts of an OTP input. */
export type OtpInputParts = Readonly<{
	Root: typeof OtpInputRoot;
	Label: typeof InputLabel;
	Group: typeof OtpInputGroup;
	Slots: typeof OtpInputSlots;
	Input: typeof OtpInputInput;
	Separator: typeof OtpInputSeparator;
	Pending: typeof InputPending;
	Description: typeof Field.Description;
	Error: typeof InputError;
}>;

/**
 * The parts of a one-time-code input: the field frame, a group of character
 * slots, and the slots themselves. For the ordinary case, use the `OtpField`
 * shorthand, which is assembled from exactly these parts. `Pending` shows once
 * the `Root`'s wait is worth showing, and `Error` renders the errors `Root` was
 * given.
 *
 * @example
 * <OtpInput.Root value={code} onValueChange={setCode} requiredness="optional">
 * 	<OtpInput.Label>Verification code <Field.Requiredness optionalLabel="optional" /></OtpInput.Label>
 * 	<OtpInput.Group>
 * 		<OtpInput.Slots slotLabel={(index, total) => `character ${index} of ${total}`} />
 * 		<OtpInput.Pending />
 * 	</OtpInput.Group>
 * 	<OtpInput.Error />
 * </OtpInput.Root>
 */
export const OtpInput: OtpInputParts = {
	Root: OtpInputRoot,
	Label: InputLabel,
	Group: OtpInputGroup,
	Slots: OtpInputSlots,
	Input: OtpInputInput,
	Separator: OtpInputSeparator,
	Pending: InputPending,
	Description: Field.Description,
	Error: InputError,
};
