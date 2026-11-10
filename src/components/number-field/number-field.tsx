import type { ReactNode } from "react";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
} from "../field/index.ts";
import {
	NumberInput,
	type NumberInputInputProps,
	type NumberInputRootProps,
} from "./number-input.tsx";

export type NumberFieldProps = FieldProps &
	Omit<
		NumberInputRootProps,
		keyof FieldProps | "children"
	> &
	Pick<
		NumberInputInputProps,
		| "placeholder"
		| "autoComplete"
		| "enterKeyHint"
		| "onFocus"
	> &
	Readonly<{
		onBlur?: FieldBlurHandler;
		/** Static leading text, such as a currency sign. */
		prefix?: ReactNode;
		/** Static trailing text, such as a unit. */
		suffix?: ReactNode;
		/** The decrement button's accessible name and tooltip, such as "Decrease". */
		decrementLabel: string;
		/** The increment button's accessible name and tooltip, such as "Increase". */
		incrementLabel: string;
		/** The decrement button's icon. */
		decrementIcon: ReactNode;
		/** The increment button's icon. */
		incrementIcon: ReactNode;
		/** What the control announces itself as, such as "Number field". */
		roleDescription: string;
	}>;

/**
 * A labelled numeric field: label, a bordered group holding the control between
 * its stepper buttons, then the description and error. Assembled from
 * `NumberInput`'s parts.
 *
 * @example
 * <NumberField
 * 	label="VAT rate"
 * 	optionalLabel="optional"
 * 	decrementLabel="Decrease"
 * 	incrementLabel="Increase"
 * 	decrementIcon={<RemoveIcon />}
 * 	incrementIcon={<AddIcon />}
 * 	roleDescription="Number field"
 * 	format={percentFormat()}
 * 	value={rate}
 * 	onValueChange={setRate}
 * />
 */
export const NumberField = ({
	label,
	description,
	prefix,
	suffix,
	decrementLabel,
	incrementLabel,
	decrementIcon,
	incrementIcon,
	roleDescription,
	placeholder,
	autoComplete,
	enterKeyHint,
	onBlur,
	onFocus,
	optionalLabel,
	...rootProps
}: NumberFieldProps): ReactNode => (
	<NumberInput.Root {...rootProps}>
		<NumberInput.Label>
			{label}{" "}
			<Field.Requiredness optionalLabel={optionalLabel} />
		</NumberInput.Label>
		<NumberInput.Group>
			<NumberInput.Decrement label={decrementLabel}>
				{decrementIcon}
			</NumberInput.Decrement>
			{prefix !== undefined && (
				<NumberInput.Affix>{prefix}</NumberInput.Affix>
			)}
			<NumberInput.Input
				aria-roledescription={roleDescription}
				placeholder={placeholder}
				autoComplete={autoComplete}
				enterKeyHint={enterKeyHint}
				onBlur={onBlur}
				onFocus={onFocus}
			/>
			{suffix !== undefined && (
				<NumberInput.Affix>{suffix}</NumberInput.Affix>
			)}
			<NumberInput.Pending />
			<NumberInput.Increment label={incrementLabel}>
				{incrementIcon}
			</NumberInput.Increment>
		</NumberInput.Group>
		<NumberInput.Description>
			{description}
		</NumberInput.Description>
		<NumberInput.Error />
	</NumberInput.Root>
);
