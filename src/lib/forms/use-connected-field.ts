import { useContext, useLayoutEffect } from "react";
import type { FieldBlurHandler } from "../../components/field/field.tsx";
import { FieldGroupContext } from "../../components/field/field-group-context.ts";
import { useFieldContext } from "./context.tsx";

/** The field props a bridge passes at the top level, read off its field. */
export type ConnectedFieldProps = Readonly<{
	name: string;
	errors: unknown;
	dirty: boolean;
	touched: boolean;
	pending: boolean;
	onBlur: FieldBlurHandler;
}>;

/** What `useConnectedField` reads off its field. */
export type ConnectedField<TValue> = Readonly<{
	field: ReturnType<typeof useFieldContext<TValue>>;
	props: ConnectedFieldProps;
}>;

/**
 * The TanStack Form field a control renders in, and the props every field
 * takes from it: its name, its errors as the validators returned them,
 * `dirty`, `touched`, `pending` while it validates, and the blur handler. The
 * value and its change handler are the control's own. Given the field's
 * label, it tells an enclosing field group, whose `formatError` receives it.
 *
 * @example
 * const { field, props: { name, onBlur, ...state } } = useConnectedField<string>(label);
 * <TextInput.Root {...state} value={field.state.value} onValueChange={field.handleChange}>
 * 	<TextInput.Input name={name} onBlur={onBlur} />
 * </TextInput.Root>
 */
export const useConnectedField = <TValue>(
	label?: string,
): ConnectedField<TValue> => {
	const field = useFieldContext<TValue>();
	const registerLabel = useContext(
		FieldGroupContext,
	)?.registerLabel;
	const { name } = field;
	const { meta } = field.state;
	useLayoutEffect(
		() =>
			registerLabel === undefined || label === undefined
				? undefined
				: registerLabel(name, label),
		[registerLabel, name, label],
	);
	return {
		field,
		props: {
			name,
			errors: meta.errors,
			dirty: meta.isDirty,
			touched: meta.isTouched,
			pending: meta.isValidating,
			onBlur: field.handleBlur,
		},
	};
};
