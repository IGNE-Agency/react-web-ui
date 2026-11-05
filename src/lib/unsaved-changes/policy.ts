import type { AnyFormState } from "@tanstack/react-form";

/**
 * Decides from a form's live state whether leaving would lose unsaved
 * changes. `Form.Root` reports into the leave guards while it returns true.
 *
 * @example
 * const policy: LeaveGuardPolicy = state => state.isDirty && !state.isSubmitted;
 */
export type LeaveGuardPolicy = (
	state: AnyFormState,
) => boolean;

/**
 * Guards while the form's values were edited away from their defaults and are
 * not being submitted. The default for `Form.Root`.
 *
 * @example
 * <Form.Root form={form} leaveGuard={whenDirty}>…</Form.Root>
 */
export const whenDirty: LeaveGuardPolicy = state =>
	state.isDirty &&
	!state.isDefaultValue &&
	!state.isSubmitting;

/**
 * Never guards, for a form whose edits need not survive leaving.
 *
 * @example
 * <Form.Root form={form} leaveGuard={never}>…</Form.Root>
 */
export const never: LeaveGuardPolicy = () => false;
