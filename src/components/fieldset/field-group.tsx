import { type ReactNode, useId } from "react";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { Field, type FieldProps } from "../field/index.ts";
import { Fieldset } from "./fieldset.tsx";
import type {
	FieldsetErrorFormat,
	FieldsetMember,
} from "./fieldset-root.tsx";

export type FieldGroupProps = Pick<
	FieldProps,
	"requiredness" | "optionalLabel"
> &
	Readonly<{
		/** The visible name of the group, such as "Address". */
		legend: string;
		/** Help about the group as a whole, under its legend. */
		description?: ReactNode;
		/** Errors about the group as a whole, such as a failed address lookup, in any shape `normalizeFieldErrors` accepts. */
		errors?: unknown;
		/** The fields whose errors the group shows in its own error instead of under each field. */
		members?: readonly FieldsetMember[];
		/** Turns a member's message into its line. Left out, the line is the message. */
		formatError?: FieldsetErrorFormat;
		className?: string;
		/** The fields, laid out side by side. */
		children: ReactNode;
	}>;

/**
 * Related fields side by side under one legend, with one error for all of
 * them: the lines of its `members`, each tied to its field's control, then its
 * own `errors`. Every field's label, control, description and error line up
 * with its neighbours'. The `--field-group-columns` knob sets the columns.
 *
 * @example
 * <FieldGroup legend="Address" optionalLabel="optional" members={members}>
 * 	<TextField label="Postal code" … />
 * 	<TextField label="House number" … />
 * </FieldGroup>
 */
export const FieldGroup = ({
	legend,
	description,
	errors,
	requiredness,
	optionalLabel,
	members,
	formatError,
	className,
	children,
}: FieldGroupProps): ReactNode => {
	const id = useId();
	const descriptionId = `${id}description`;
	const errorId = `${id}error`;
	const describedBy =
		[
			description === undefined ? "" : descriptionId,
			normalizeFieldErrors(errors).length === 0
				? ""
				: errorId,
		]
			.filter(part => part !== "")
			.join(" ") || undefined;
	return (
		<Fieldset.Root
			errors={errors}
			requiredness={requiredness}
			members={members}
			formatError={formatError}
			aria-describedby={describedBy}
			className={className}>
			<Fieldset.Legend>
				{legend}{" "}
				<Field.Requiredness optionalLabel={optionalLabel} />
			</Fieldset.Legend>
			<Fieldset.Description id={descriptionId}>
				{description}
			</Fieldset.Description>
			<Fieldset.Fields>{children}</Fieldset.Fields>
			<Fieldset.Error id={errorId} />
		</Fieldset.Root>
	);
};
