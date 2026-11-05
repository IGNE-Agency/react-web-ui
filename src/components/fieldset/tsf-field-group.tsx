import { useStore } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { useFormContext } from "../../lib/forms/context.tsx";
import {
	type FieldMetaState,
	getFieldErrors,
} from "../../lib/forms/errors.ts";
import {
	FieldGroup,
	type FieldGroupProps,
} from "./field-group.tsx";

export type TSFFieldGroupProps = Omit<
	FieldGroupProps,
	"members"
> &
	Readonly<{
		/** The fields whose errors the group shows, by name, in the order it shows them. A field it does not name keeps its own error. */
		names: readonly string[];
	}>;

/**
 * `FieldGroup` bound to the TanStack Form it renders in: it shows the errors
 * of the fields it `names`. Registered as `form.FieldGroup`.
 *
 * @example
 * <form.FieldGroup legend="Address" optionalLabel="optional" names={["postalCode", "houseNumber"]}>
 * 	<form.AppField name="postalCode">
 * 		{field => <field.TextField label="Postal code" optionalLabel="optional" />}
 * 	</form.AppField>
 * 	<form.AppField name="houseNumber">
 * 		{field => <field.TextField label="House number" optionalLabel="optional" />}
 * 	</form.AppField>
 * </form.FieldGroup>
 */
export const TSFFieldGroup = ({
	names,
	...props
}: TSFFieldGroupProps): ReactNode => {
	const form = useFormContext();
	const members = useStore(form.store, state =>
		names.map(name => ({
			name,
			errors: getFieldErrors<FieldMetaState>(state, [name]),
		})),
	);
	return <FieldGroup {...props} members={members} />;
};
