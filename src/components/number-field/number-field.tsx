import type { ReactNode } from "react";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
} from "../field/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import {
	NumberInput,
	type NumberInputInputProps,
	type NumberInputRootProps,
} from "./number-input.tsx";
import { Spinner } from "../spinner/index.ts";

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
	}>;

/**
 * A labelled numeric field: label, a bordered group holding the control between
 * its stepper buttons, then the description and error. Assembled from
 * `NumberInput`'s parts.
 *
 * @example
 * <NumberField
 * 	label="VAT rate"
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
	placeholder,
	autoComplete,
	enterKeyHint,
	onBlur,
	onFocus,
	...rootProps
}: NumberFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	return (
		<NumberInput.Root {...rootProps}>
			<NumberInput.Label>
				{label} <Field.Requiredness />
			</NumberInput.Label>
			<NumberInput.Group>
				<NumberInput.Decrement
					render={
						<IconButton
							label={copy.number.decrement}
							variant="tertiary"
							size="sm">
							{icons.decrement}
						</IconButton>
					}
				/>
				{prefix !== undefined && (
					<NumberInput.Affix>{prefix}</NumberInput.Affix>
				)}
				<NumberInput.Input
					placeholder={placeholder}
					autoComplete={autoComplete}
					enterKeyHint={enterKeyHint}
					onBlur={onBlur}
					onFocus={onFocus}
				/>
				{suffix !== undefined && (
					<NumberInput.Affix>{suffix}</NumberInput.Affix>
				)}
				<NumberInput.Pending>
					<Spinner size={1} />
				</NumberInput.Pending>
				<NumberInput.Increment
					render={
						<IconButton
							label={copy.number.increment}
							variant="tertiary"
							size="sm">
							{icons.increment}
						</IconButton>
					}
				/>
			</NumberInput.Group>
			<NumberInput.Description>
				{description}
			</NumberInput.Description>
			<NumberInput.Error />
		</NumberInput.Root>
	);
};
