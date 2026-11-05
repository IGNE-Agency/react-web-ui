import { createFormHookContexts } from "@tanstack/react-form";

type FormHookContexts = ReturnType<
	typeof createFormHookContexts
>;

const contexts: FormHookContexts = createFormHookContexts();

/**
 * The field context the form hook is built on, kept apart from the hook so a
 * bridge can read its field without importing every other bridge.
 *
 * @example
 * <fieldContext.Provider value={field}>{children}</fieldContext.Provider>
 */
export const fieldContext: FormHookContexts["fieldContext"] =
	contexts.fieldContext;

/**
 * The form context the form hook is built on, which `Form.Root` provides.
 *
 * @example
 * <formContext.Provider value={form}>{children}</formContext.Provider>
 */
export const formContext: FormHookContexts["formContext"] =
	contexts.formContext;

/**
 * The field a bridge is rendered for, inside `form.AppField`.
 *
 * @example
 * const field = useFieldContext<string>();
 */
export const useFieldContext: FormHookContexts["useFieldContext"] =
	contexts.useFieldContext;

/**
 * The form a part is rendered inside, under `Form.Root` or `form.AppForm`.
 *
 * @example
 * const form = useFormContext();
 */
export const useFormContext: FormHookContexts["useFormContext"] =
	contexts.useFormContext;
