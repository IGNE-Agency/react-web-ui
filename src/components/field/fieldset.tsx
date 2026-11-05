import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import type { ReactNode } from "react";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import {
	Field,
	type FieldLabelProps,
	type FieldProps,
	type FieldRootProps,
} from "./field.tsx";
import { fieldStateAttributes } from "./field-state.ts";

/** What the fieldset root of a group of choices takes. */
export type FieldsetRootProps = FieldRootProps &
	Pick<
		FieldProps,
		| "errors"
		| "requiredness"
		| "dirty"
		| "touched"
		| "pending"
	> &
	Readonly<{
		/** A choice is made. */
		filled?: boolean;
		readOnly?: boolean;
	}>;

/**
 * A field rendered as a fieldset, for a group of choices named by its legend.
 *
 * @example
 * <FieldsetRoot filled={kind !== null}>…</FieldsetRoot>
 */
export const FieldsetRoot = ({
	errors,
	requiredness,
	dirty,
	touched,
	pending,
	filled,
	readOnly,
	disabled,
	...props
}: FieldsetRootProps): ReactNode => {
	const invalid = normalizeFieldErrors(errors).length > 0;
	return (
		<Field.Root
			render={<BaseFieldset.Root />}
			disabled={disabled}
			invalid={invalid}
			dirty={dirty}
			touched={touched}
			{...fieldStateAttributes({
				disabled,
				readonly: readOnly,
				requiredness,
				invalid,
				dirty,
				touched,
				pending,
				filled,
			})}
			{...props}
		/>
	);
};

/**
 * The legend that names a {@link FieldsetRoot}.
 *
 * @example
 * <FieldsetLegend optionalLabel="optional">Kind</FieldsetLegend>
 */
export const FieldsetLegend = (
	props: FieldLabelProps,
): ReactNode => (
	<Field.Label
		nativeLabel={false}
		render={<BaseFieldset.Legend />}
		{...props}
	/>
);
