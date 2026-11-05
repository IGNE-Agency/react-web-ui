import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { ErrorText } from "../error-text/index.ts";
import { FieldRowContext } from "../field/field-group-context.ts";
import {
	FieldsetLegend,
	FieldsetRoot,
	useFieldsetContext,
} from "./fieldset-root.tsx";
import style from "./fieldset.module.scss";

export type FieldsetDescriptionProps = ComponentProps<"p">;

const FieldsetDescription = ({
	children,
	className,
	...props
}: FieldsetDescriptionProps): ReactNode =>
	children === undefined ||
	children === null ||
	children === false ||
	children === "" ? null : (
		<p
			className={clsx(style.description, className)}
			{...props}>
			{children}
		</p>
	);

export type FieldsetFieldsProps = ComponentProps<"div">;

const FieldsetFields = ({
	className,
	...props
}: FieldsetFieldsProps): ReactNode => (
	<FieldRowContext value>
		<div
			className={clsx(style.fields, className)}
			{...props}
		/>
	</FieldRowContext>
);

export type FieldsetErrorProps = Readonly<{
	id?: string;
	className?: string;
}>;

const FieldsetError = ({
	id,
	className,
}: FieldsetErrorProps): ReactNode => {
	const { lines } = useFieldsetContext();
	return (
		<ErrorText role="alert" id={id} className={className}>
			{lines.map(line => (
				<span key={line.id} id={line.id}>
					{line.content}
				</span>
			))}
		</ErrorText>
	);
};

/** The parts of a fieldset. */
export type FieldsetParts = Readonly<{
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Description: typeof FieldsetDescription;
	Fields: typeof FieldsetFields;
	Error: typeof FieldsetError;
}>;

/**
 * A group of related fields named by one legend, with one error for all of
 * them. `Fields` lays the fields side by side on one grid, so every field's
 * label, control, description and error share a row with its neighbours'.
 * `Error` is the group's only live region: it shows the lines of the `members`
 * the root collects, each tied to its field's control, then the group's own
 * `errors`. For the ordinary case, use `FieldGroup`.
 *
 * @example
 * <Fieldset.Root members={members} aria-describedby={descriptionId}>
 * 	<Fieldset.Legend optionalLabel="optional">Address</Fieldset.Legend>
 * 	<Fieldset.Description id={descriptionId}>We send the invoice here.</Fieldset.Description>
 * 	<Fieldset.Fields>…</Fieldset.Fields>
 * 	<Fieldset.Error />
 * </Fieldset.Root>
 */
export const Fieldset: FieldsetParts = {
	Root: FieldsetRoot,
	Legend: FieldsetLegend,
	Description: FieldsetDescription,
	Fields: FieldsetFields,
	Error: FieldsetError,
};
