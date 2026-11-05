import type { AnyFormApi } from "@tanstack/react-form";
import { useEffect } from "react";

const invalidFocus = new WeakMap<
	AnyFormApi["store"],
	() => void
>();

/**
 * Ties a form to the `Form.Root` it renders in, so a failed submit of that form
 * can focus its first invalid control.
 *
 * @example
 * useFailedSubmitFocus(form, () => setInvalidSubmits(count => count + 1));
 */
export const useFailedSubmitFocus = (
	form: AnyFormApi,
	focusFirstInvalid: () => void,
): void => {
	useEffect(() => {
		invalidFocus.set(form.store, focusFirstInvalid);
		return () => {
			if (
				invalidFocus.get(form.store) === focusFirstInvalid
			) {
				invalidFocus.delete(form.store);
			}
		};
	}, [form, focusFirstInvalid]);
};

/**
 * Focuses the first invalid control of the `Form.Root` a form renders in.
 *
 * @example
 * onSubmitInvalid: ({ formApi }) => focusFirstInvalidField(formApi),
 */
export const focusFirstInvalidField = (
	form: AnyFormApi,
): void => {
	invalidFocus.get(form.store)?.();
};
