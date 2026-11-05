import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import {
	type Context,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useId,
	useState,
} from "react";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import {
	Field,
	type FieldLabelProps,
	type FieldProps,
	type FieldRootProps,
} from "../field/field.tsx";
import {
	FieldGroupContext,
	type FieldGroupContextValue,
} from "../field/field-group-context.ts";
import { fieldStateAttributes } from "../field/field-state.ts";
import { useFieldState } from "../field/use-field-state.ts";

/** A field whose errors a fieldset collects, by the name of the TanStack Form field it renders in. */
export type FieldsetMember = Readonly<{
	name: string;
	/** Errors in any shape `normalizeFieldErrors` accepts. */
	errors: unknown;
}>;

/** The field a collected line belongs to, as `formatError` receives it. */
export type FieldsetMemberField = Readonly<{
	name: string;
	/** The field's label, once the field has told the group. */
	label: string | undefined;
}>;

/** Turns one of a member's messages into the line the group shows for it. */
export type FieldsetErrorFormat = (
	field: FieldsetMemberField,
	message: string,
) => ReactNode;

/** One line of a fieldset's error. */
export type FieldsetLine = Readonly<{
	id: string;
	/** The member the line belongs to, or `undefined` for a line about the group. */
	name: string | undefined;
	content: ReactNode;
}>;

/** What a fieldset's root hands its parts. */
export type FieldsetContextValue = Readonly<{
	/** The members' lines in member order, then the group's own. */
	lines: readonly FieldsetLine[];
}>;

const FieldsetContext: Context<FieldsetContextValue | null> =
	createContext<FieldsetContextValue | null>(null);

/**
 * The lines of the surrounding fieldset's error.
 *
 * @example
 * const { lines } = useFieldsetContext();
 */
export const useFieldsetContext =
	(): FieldsetContextValue =>
		useRequiredContext(
			FieldsetContext,
			"Fieldset parts must be rendered within <Fieldset.Root>.",
		);

/** What the root of a fieldset takes, for a group of choices or a group of fields. */
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
		/** The fields whose errors the group shows in its own error instead of under each field. */
		members?: readonly FieldsetMember[];
		/** Turns a member's message into its line. Left out, the line is the message. */
		formatError?: FieldsetErrorFormat;
	}>;

/**
 * A copy of `record` without `key`.
 *
 * @example
 * withoutKey({ street: "Street", city: "City" }, "city"); // { street: "Street" }
 */
const withoutKey = (
	record: Readonly<Record<string, string>>,
	key: string,
): Readonly<Record<string, string>> =>
	Object.fromEntries(
		Object.entries(record).filter(([name]) => name !== key),
	);

/**
 * A field rendered as a fieldset, named by its legend: a group of choices, or a
 * group of fields that shows the errors of its `members` in one place.
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
	members,
	formatError,
	children,
	...props
}: FieldsetRootProps): ReactNode => {
	const id = useId();
	const parentGroup = useContext(FieldGroupContext);
	const [labels, setLabels] = useState<
		Readonly<Record<string, string>>
	>({});
	const registerLabel = useCallback(
		(name: string, label: string) => {
			setLabels(current => ({ ...current, [name]: label }));
			return () => {
				setLabels(current => withoutKey(current, name));
			};
		},
		[],
	);
	const memberLines: readonly FieldsetLine[] = (
		members ?? []
	).flatMap((member, memberIndex) =>
		normalizeFieldErrors(member.errors).map(
			(message, lineIndex) => ({
				id: `${id}member${memberIndex}line${lineIndex}`,
				name: member.name,
				content:
					formatError === undefined
						? message
						: formatError(
								{
									name: member.name,
									label: labels[member.name],
								},
								message,
							),
			}),
		),
	);
	const groupMessages = normalizeFieldErrors(errors);
	const lines: readonly FieldsetLine[] = [
		...memberLines,
		...groupMessages.map((message, lineIndex) => ({
			id: `${id}line${lineIndex}`,
			name: undefined,
			content: message,
		})),
	];
	const group: FieldGroupContextValue | null =
		members === undefined
			? parentGroup
			: {
					lineIds: name =>
						members.some(member => member.name === name)
							? memberLines
									.filter(line => line.name === name)
									.map(line => line.id)
							: undefined,
					registerLabel,
				};
	const field = useFieldState({
		errors: [
			...groupMessages,
			...(members ?? []).flatMap(member =>
				normalizeFieldErrors(member.errors),
			),
		],
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled,
	});
	return (
		<FieldsetContext value={{ lines }}>
			<FieldGroupContext value={group}>
				<Field.Root
					render={<BaseFieldset.Root />}
					disabled={field.disabled}
					invalid={field.invalid}
					dirty={dirty}
					touched={touched}
					{...fieldStateAttributes(field.state)}
					{...props}>
					{children}
				</Field.Root>
			</FieldGroupContext>
		</FieldsetContext>
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
