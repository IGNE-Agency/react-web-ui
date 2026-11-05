const linesOf = (errors: unknown): readonly string[] => {
	if (Array.isArray(errors)) {
		const bag: readonly unknown[] = errors;
		return bag.flatMap(linesOf);
	}
	if (typeof errors === "string") {
		return errors === "" ? [] : [errors];
	}
	if (
		typeof errors === "object" &&
		errors !== null &&
		"message" in errors &&
		typeof errors.message === "string"
	) {
		return linesOf(errors.message);
	}
	return [];
};

/**
 * Errors of any shape as the lines a field or form shows, each once: strings as
 * they are, anything with a string `message` (a Standard Schema issue, an
 * `Error`) as that message, and lists flattened. Anything else is dropped.
 *
 * @example
 * normalizeFieldErrors(["Too short", { message: "Not an address" }]); // ["Too short", "Not an address"]
 */
export const normalizeFieldErrors = (
	errors: unknown,
): readonly string[] => [...new Set(linesOf(errors))];

/** The part of a form's state `getFieldErrors` reads. */
export type FieldMetaState = Readonly<{
	fieldMeta: Readonly<
		Record<
			string,
			Readonly<{ errors: unknown }> | undefined
		>
	>;
}>;

/**
 * The error lines of the named fields, in the order they are named, such as
 * the errors of a group that shows them in one place.
 *
 * @example
 * getFieldErrors(form.state, ["start", "end"]); // ["Enter a start date."]
 */
export const getFieldErrors = <
	TState extends FieldMetaState,
>(
	state: TState,
	fields: readonly (keyof TState["fieldMeta"] & string)[],
): readonly string[] =>
	fields.flatMap(field =>
		normalizeFieldErrors(state.fieldMeta[field]?.errors),
	);
