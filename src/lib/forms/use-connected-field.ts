import { useFieldContext } from "./context.tsx";

/** The field props a bridge passes at the top level, read off its field. */
export type ConnectedFieldProps = Readonly<{
	name: string;
	errors: unknown;
	dirty: boolean;
	touched: boolean;
	pending: boolean;
	onBlur: () => void;
}>;

/** What `useConnectedField` reads off its field. */
export type ConnectedField<TValue> = Readonly<{
	field: ReturnType<typeof useFieldContext<TValue>>;
	props: ConnectedFieldProps;
}>;

/**
 * The field a bridge renders for, and the props every field takes from it:
 * its name, its errors as the validators returned them, `dirty`, `touched`,
 * `pending` while it validates, and the blur handler. The value and its change
 * handler are the control's own.
 *
 * @example
 * const { field, props } = useConnectedField<string>();
 * <TextField {...props} value={field.state.value} onValueChange={field.handleChange} label={label} optionalLabel={optionalLabel} />
 */
export const useConnectedField = <
	TValue,
>(): ConnectedField<TValue> => {
	const field = useFieldContext<TValue>();
	const { meta } = field.state;
	return {
		field,
		props: {
			name: field.name,
			errors: meta.errors,
			dirty: meta.isDirty,
			touched: meta.isTouched,
			pending: meta.isValidating,
			onBlur: field.handleBlur,
		},
	};
};
