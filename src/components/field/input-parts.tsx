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
} from "./field.tsx";
import type { FieldState } from "./field-state.ts";

/** What a raw input's `Root` hands its label, pending and error parts. */
export type InputPartsContextValue = Readonly<{
	/** Projected by `Root`; every part reads it, none of them own it. */
	state: FieldState;
	/** The errors `Root` was given, which `Error` renders. */
	errors: unknown;
	/** The word an optional field's label trails. */
	optionalLabel: string;
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

export type InputLabelProps = Omit<
	FieldLabelProps,
	"requiredness" | "optionalLabel"
>;

/**
 * The label above a raw input, trailing the requiredness its `Root` was given.
 *
 * @example
 * <TextInput.Label>Email</TextInput.Label>
 */
export const InputLabel = ({
	children,
	...props
}: InputLabelProps): ReactNode => {
	const { state, optionalLabel } = useInputPartsContext();
	return (
		<Field.Label
			requiredness={state.requiredness}
			optionalLabel={optionalLabel}
			{...props}>
			{children}
		</Field.Label>
	);
};

export type InputPendingProps = Readonly<{
	className?: string;
}>;

/**
 * The spinner a raw input shows once its `Root`'s wait is worth showing.
 *
 * @example
 * <TextInput.Pending />
 */
export const InputPending = ({
	className,
}: InputPendingProps): ReactNode => {
	const { phase } = useInputPartsContext();
	if (phase === "fresh") {
		return null;
	}
	return <Field.Pending className={className} />;
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
