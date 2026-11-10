import {
	type Context,
	createContext,
	type ReactNode,
} from "react";
import type { BusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import {
	Field,
	type FieldErrorProps,
	type FieldLabelProps,
	type FieldPendingProps,
} from "./field.tsx";
import type { FieldState } from "./field-state.ts";

/** What a raw input's `Root` hands its label, pending and error parts. */
export type InputPartsContextValue = Readonly<{
	/** Projected by `Root`; every part reads it, none of them own it. */
	state: FieldState;
	/** The errors `Root` was given, which `Error` renders. */
	errors: unknown;
	phase: BusyPhase;
}>;

/** The context a raw input's `Root` provides its shared parts. */
export const InputPartsContext: Context<InputPartsContextValue | null> =
	createContext<InputPartsContextValue | null>(null);

/**
 * The surrounding raw input's projected state, errors and busy phase.
 *
 * @example
 * const { state } = useInputPartsContext();
 */
export const useInputPartsContext =
	(): InputPartsContextValue =>
		useRequiredContext(
			InputPartsContext,
			"Input parts must be rendered within their input's <Root>.",
		);

export type InputLabelProps = FieldLabelProps;

/**
 * The label above a raw input. Add `Field.Requiredness` to trail the
 * requiredness its `Root` was given.
 *
 * @example
 * <TextInput.Label>Email <Field.Requiredness optionalLabel="optional" /></TextInput.Label>
 */
export const InputLabel = (
	props: InputLabelProps,
): ReactNode => <Field.Label {...props} />;

export type InputPendingProps = FieldPendingProps;

/**
 * The box a raw input's wait shows in, holding what it is given, such as a
 * spinner. It renders once its `Root`'s wait is worth showing.
 *
 * @example
 * <TextInput.Pending><Spinner size={1} /></TextInput.Pending>
 */
export const InputPending = (
	props: InputPendingProps,
): ReactNode => {
	const { phase } = useInputPartsContext();
	if (phase === "fresh") {
		return null;
	}
	return <Field.Pending {...props} />;
};

export type InputErrorProps = Omit<
	FieldErrorProps,
	"children"
>;

/**
 * The errors a raw input's `Root` was given.
 *
 * @example
 * <TextInput.Error />
 */
export const InputError = (
	props: InputErrorProps,
): ReactNode => {
	const { errors } = useInputPartsContext();
	return <Field.Error {...props}>{errors}</Field.Error>;
};
