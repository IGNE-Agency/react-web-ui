import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import {
	type BusyPhase,
	useBusyPhase,
} from "../../lib/hooks/use-busy-phase.ts";
import { useFormDisabled } from "../form/form-context.ts";
import type { FieldProps } from "./field.tsx";
import type { FieldState } from "./field-state.ts";

/** What `useFieldState` reads a field's states from. */
export type FieldStateOptions = Pick<
	FieldProps,
	| "errors"
	| "requiredness"
	| "dirty"
	| "touched"
	| "pending"
> &
	Readonly<{
		disabled?: boolean;
		readOnly?: boolean;
		/** The control holds a value. */
		filled?: boolean;
		/** States no option here owns, projected over the ones that do. */
		state?: FieldState;
	}>;

/** A field's states, read from their owners. */
export type FieldStateProjection = Readonly<{
	/** Every state the field projects, for `fieldStateAttributes` and its parts. */
	state: FieldState;
	/** The field has an error to show. */
	invalid: boolean;
	/** Disabled by its own prop or by a busy `Form.Root`. */
	disabled: boolean;
	/** How long `pending` has lasted; a `Pending` part mounts once it leaves `fresh`. */
	phase: BusyPhase;
}>;

/**
 * A field's states, each from its owner: invalid from its errors, disabled
 * by its own prop or a busy `Form.Root`, and pending once the wait has lasted
 * long enough to show.
 *
 * @example
 * const { state, invalid, disabled, phase } = useFieldState({ errors, pending, disabled, filled: value !== "" });
 */
export const useFieldState = ({
	errors,
	requiredness,
	dirty,
	touched,
	pending = false,
	disabled: ownDisabled = false,
	readOnly,
	filled,
	state,
}: FieldStateOptions): FieldStateProjection => {
	const formDisabled = useFormDisabled();
	const phase = useBusyPhase({ busy: pending });
	const invalid = normalizeFieldErrors(errors).length > 0;
	const disabled = ownDisabled || formDisabled;

	return {
		state: {
			disabled,
			readonly: readOnly,
			requiredness,
			validity: invalid ? "invalid" : undefined,
			dirty,
			touched,
			filled,
			pending: phase !== "fresh",
			...state,
		},
		invalid,
		disabled,
		phase,
	};
};
