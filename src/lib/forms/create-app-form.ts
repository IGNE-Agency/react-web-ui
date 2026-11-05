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

/** The bridges that read a whole form rather than one field, such as `TSFFieldGroup`, by the name a form reaches each under. */
export type AppFormComponents = Readonly<
	Record<string, Bridge>
>;

/** A form hook's form components when it registers none. */
export type NoFormComponents = Readonly<
	Record<string, never>
>;

type AppFormHook<
	TFields extends AppFieldComponents,
	TForms extends AppFormComponents,
> = ReturnType<typeof createFormHook<TFields, TForms>>;

/** The form hook `createAppForm` builds, with the form and field-group helpers bound to it. */
export type AppForm<
	TFields extends AppFieldComponents,
	TForms extends AppFormComponents = NoFormComponents,
> = Readonly<
	Pick<
		AppFormHook<TFields, TForms>,
		"useAppForm" | "withForm" | "withFieldGroup"
	>
>;

/** `createAppForm`, with or without form components. */
export type CreateAppForm = {
	<TFields extends AppFieldComponents>(
		fieldComponents: TFields,
	): AppForm<TFields>;
	<
		TFields extends AppFieldComponents,
		TForms extends AppFormComponents,
	>(
		fieldComponents: TFields,
		formComponents: TForms,
	): AppForm<TFields, TForms>;
};

const noFormComponents: NoFormComponents = {};

/**
 * A form hook over the given bridges, whose failed submit focuses the first
 * invalid control of the `Form.Root` the form renders in.
 *
 * @example
 * const { useAppForm } = buildAppForm({ TextField: TSFTextField }, {});
 */
const buildAppForm = <
	TFields extends AppFieldComponents,
	TForms extends AppFormComponents,
>(
	fieldComponents: TFields,
	formComponents: TForms,
): AppForm<TFields, TForms> => {
	const hook = createFormHook<TFields, TForms>({
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

/**
 * The app's form hook, with only the bridges it registers. A form reaches each
 * field bridge through `form.AppField` under its key, and each form component,
 * such as `TSFFieldGroup`, as `form.<key>`. A failed submit focuses the first
 * invalid control of the `Form.Root` the form renders in.
 *
 * @example
 * export const { useAppForm, withForm, withFieldGroup } = createAppForm(
 * 	{ TextField: TSFTextField, SelectField: TSFSelectField },
 * 	{ FieldGroup: TSFFieldGroup },
 * );
 */
export const createAppForm: CreateAppForm = <
	TFields extends AppFieldComponents,
	TForms extends AppFormComponents,
>(
	fieldComponents: TFields,
	formComponents?: TForms,
) =>
	formComponents === undefined
		? buildAppForm(fieldComponents, noFormComponents)
		: buildAppForm(fieldComponents, formComponents);
