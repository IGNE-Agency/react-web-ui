import { createFormHook } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { fieldContext, formContext } from "./context.tsx";
import { focusFirstInvalidField } from "./failed-submit.tsx";

type Bridge = Readonly<{
	bivarianceHack(props: object): ReactNode;
}>["bivarianceHack"];

/** The bridges a form hook renders through `form.AppField`, by the name a field reaches each under. */
export type AppFieldComponents = Readonly<
	Record<string, Bridge>
>;

type FormComponents = Readonly<Record<string, never>>;

type AppFormHook<TFields extends AppFieldComponents> =
	ReturnType<
		typeof createFormHook<TFields, FormComponents>
	>;

/** The form hook `createAppForm` builds, with the form and field-group helpers bound to it. */
export type AppForm<TFields extends AppFieldComponents> =
	Readonly<
		Pick<
			AppFormHook<TFields>,
			"useAppForm" | "withForm" | "withFieldGroup"
		>
	>;

const formComponents: FormComponents = {};

/**
 * The app's form hook, with only the bridges it registers. A form reaches each
 * through `form.AppField` under its key, and a failed submit focuses the first
 * invalid control of the `Form.Root` the form renders in.
 *
 * @example
 * export const { useAppForm, withForm, withFieldGroup } = createAppForm({
 * 	TextField: TSFTextField,
 * 	SelectField: TSFSelectField,
 * });
 */
export const createAppForm = <
	TFields extends AppFieldComponents,
>(
	fieldComponents: TFields,
): AppForm<TFields> => {
	const hook = createFormHook<TFields, FormComponents>({
		fieldContext,
		formContext,
		fieldComponents,
		formComponents,
	});
	return {
		useAppForm: options =>
			hook.useAppForm({
				...options,
				onSubmitInvalid: props => {
					options.onSubmitInvalid?.(props);
					focusFirstInvalidField(props.formApi);
				},
			}),
		withForm: hook.withForm,
		withFieldGroup: hook.withFieldGroup,
	};
};
