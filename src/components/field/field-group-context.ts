import type { AnyFieldApi } from "@tanstack/react-form";
import {
	type Context,
	createContext,
	useContext,
} from "react";
import { fieldContext } from "../../lib/forms/context.tsx";

/** What a field group tells the fields it collects the errors of. */
export type FieldGroupContextValue = Readonly<{
	/** The ids of the lines a field's errors show as in the group's error, or `undefined` for a field the group does not collect. */
	lineIds: (name: string) => readonly string[] | undefined;
	/** Tells the group a field's label, until the returned function takes it back. */
	registerLabel: (
		name: string,
		label: string,
	) => () => void;
}>;

/** The field group the fields inside it report to. */
export const FieldGroupContext: Context<FieldGroupContextValue | null> =
	createContext<FieldGroupContextValue | null>(null);

/** Whether a field root sits directly in a field group's row of fields. */
export const FieldRowContext: Context<boolean> =
	createContext(false);

/**
 * The ids of the lines `group` shows the errors of `field` as, where there are
 * both.
 *
 * @example
 * groupLineIds(group, field); // ["«r3»line0"]
 */
const groupLineIds = (
	group: FieldGroupContextValue | null,
	field: AnyFieldApi | null,
): readonly string[] | undefined =>
	group === null || field === null
		? undefined
		: group.lineIds(field.name);

/**
 * The ids of the lines the enclosing field group shows this field's errors as,
 * or `undefined` when no group collects it. A field is matched by the name of
 * the TanStack Form field it renders in.
 *
 * @example
 * const lineIds = useFieldGroupLineIds(); // ["«r3»line0"]
 */
export const useFieldGroupLineIds = ():
	| readonly string[]
	| undefined =>
	groupLineIds(
		useContext(FieldGroupContext),
		useContext(fieldContext),
	);
