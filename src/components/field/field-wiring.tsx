import {
	type Context,
	createContext,
	type ReactNode,
	type RefCallback,
	useCallback,
	useState,
} from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import {
	Field,
	type FieldDescriptionProps,
	type FieldIds,
	type FieldLabelProps,
} from "./field.tsx";
import {
	InputError,
	type InputErrorProps,
} from "./input-parts.tsx";

/** What a root whose control is wired by hand hands its label, description and error parts. */
export type FieldWiringValue = Readonly<{
	ids: FieldIds;
	/** The control's `aria-describedby`: the description while one is mounted, then the error while the field is invalid. */
	describedBy: string | undefined;
	/** Taken by the description part, so the control is described by it only while it is mounted. */
	descriptionRef: RefCallback<HTMLElement>;
}>;

/** The context a root whose control is wired by hand provides its parts. */
export const FieldWiringContext: Context<FieldWiringValue | null> =
	createContext<FieldWiringValue | null>(null);

/**
 * The ids of a field whose control is not a labelable element, and that
 * control's `aria-describedby`, which follows the description part as it
 * mounts and unmounts.
 *
 * @example
 * const wiring = useFieldWiring(field.invalid);
 * <FieldWiringContext value={wiring}>…</FieldWiringContext>
 */
export const useFieldWiring = (
	invalid: boolean,
): FieldWiringValue => {
	const ids = Field.useIds();
	const [described, setDescribed] = useState(false);
	const descriptionRef = useCallback(
		(node: HTMLElement | null) => {
			setDescribed(node !== null);
		},
		[],
	);
	return {
		ids,
		describedBy: ids.describedBy(described, invalid),
		descriptionRef,
	};
};

/**
 * The ids and `aria-describedby` of the surrounding root.
 *
 * @example
 * const { ids, describedBy } = useFieldWiringContext();
 */
export const useFieldWiringContext = (): FieldWiringValue =>
	useRequiredContext(
		FieldWiringContext,
		"Field parts must be rendered within their input's <Root>.",
	);

export type WiredLabelProps = Omit<FieldLabelProps, "id">;

/**
 * The visible label of a control that is not a labelable element: a `span`
 * its root names the control by through `aria-labelledby`. Renders nothing
 * without children.
 *
 * @example
 * <DateInput.Label>Service date <Field.Requiredness /></DateInput.Label>
 */
export const WiredLabel = (
	props: WiredLabelProps,
): ReactNode => {
	const { ids } = useFieldWiringContext();
	return (
		<Field.Label
			nativeLabel={false}
			render={<span />}
			{...props}
			id={ids.labelId}
		/>
	);
};

export type WiredDescriptionProps = Omit<
	FieldDescriptionProps,
	"id" | "ref"
>;

/**
 * The help under a control its root describes by hand, which joins the
 * control's `aria-describedby` while it renders. Renders nothing without
 * children.
 *
 * @example
 * <DateInput.Description>The day the work was done.</DateInput.Description>
 */
export const WiredDescription = (
	props: WiredDescriptionProps,
): ReactNode => {
	const { ids, descriptionRef } = useFieldWiringContext();
	return (
		<Field.Description
			{...props}
			id={ids.descriptionId}
			ref={descriptionRef}
		/>
	);
};

export type WiredErrorProps = Omit<InputErrorProps, "id">;

/**
 * The errors the root was given, under the id its control is described by.
 *
 * @example
 * <DateInput.Error />
 */
export const WiredError = (
	props: WiredErrorProps,
): ReactNode => {
	const { ids } = useFieldWiringContext();
	return <InputError {...props} id={ids.errorId} />;
};
