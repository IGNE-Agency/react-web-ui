import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { useBusyPhase } from "../../lib/hooks/index.ts";
import {
	Field,
	type FieldErrorProps,
	type FieldLabelProps,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
	withFieldFocus,
} from "../field/index.ts";
import { useFormDisabled } from "../form/form-context.ts";
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
	"label" | "description"
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

const OtpInputRoot = ({
	length = DEFAULT_LENGTH,
	requiredness,
	optionalLabel,
	errors,
	dirty,
	touched,
	pending = false,
	state,
	className,
	children,
	...base
}: OtpInputRootProps): ReactNode => {
	const formDisabled = useFormDisabled();
	const phase = useBusyPhase({ busy: pending });
	const invalid = normalizeFieldErrors(errors).length > 0;

	const fieldState: FieldState = {
		disabled: base.disabled === true || formDisabled,
		readonly: base.readOnly,
		requiredness,
		invalid,
		dirty,
		touched,
		filled: base.value !== "",
		pending: phase !== "fresh",
		...state,
	};

	return (
		<OtpInputContext
			value={{
				state: fieldState,
				errors,
				optionalLabel,
				length,
				base: { ...base, length },
			}}>
			<Field.Root
				disabled={base.disabled}
				invalid={invalid}
				dirty={dirty}
				touched={touched}
				className={clsx(style.root, className)}
				{...fieldStateAttributes(fieldState)}>
				{children}
			</Field.Root>
		</OtpInputContext>
	);
};

export type OtpInputLabelProps = Omit<
	FieldLabelProps,
	"requiredness" | "optionalLabel"
>;

const OtpInputLabel = ({
	children,
	...props
}: OtpInputLabelProps): ReactNode => {
	const { state, optionalLabel } = useOtpInputContext();
	return (
		<Field.Label
			requiredness={state.requiredness}
			optionalLabel={optionalLabel}
			{...props}>
			{children}
		</Field.Label>
	);
};

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

export type OtpInputErrorProps = Omit<
	FieldErrorProps,
	"children"
>;

const OtpInputError = (
	props: OtpInputErrorProps,
): ReactNode => {
	const { errors } = useOtpInputContext();
	return <Field.Error {...props}>{errors}</Field.Error>;
};

/** The parts of an OTP input. */
export type OtpInputParts = Readonly<{
	Root: typeof OtpInputRoot;
	Label: typeof OtpInputLabel;
	Group: typeof OtpInputGroup;
	Slots: typeof OtpInputSlots;
	Input: typeof OtpInputInput;
	Separator: typeof OtpInputSeparator;
	Description: typeof Field.Description;
	Error: typeof OtpInputError;
}>;

/**
 * The parts of a one-time-code input: the field frame, a group of character
 * slots, and the slots themselves. For the ordinary case, use the `OtpField`
 * shorthand, which is assembled from exactly these parts. `Error` renders the
 * errors `Root` was given.
 *
 * @example
 * <OtpInput.Root value={code} onValueChange={setCode} optionalLabel="optional">
 * 	<OtpInput.Label>Verification code</OtpInput.Label>
 * 	<OtpInput.Group>
 * 		<OtpInput.Slots slotLabel={(index, total) => `character ${index} of ${total}`} />
 * 	</OtpInput.Group>
 * 	<OtpInput.Error />
 * </OtpInput.Root>
 */
export const OtpInput: OtpInputParts = {
	Root: OtpInputRoot,
	Label: OtpInputLabel,
	Group: OtpInputGroup,
	Slots: OtpInputSlots,
	Input: OtpInputInput,
	Separator: OtpInputSeparator,
	Description: Field.Description,
	Error: OtpInputError,
};
