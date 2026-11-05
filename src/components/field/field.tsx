import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ReactNode,
	useId,
} from "react";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { ErrorText } from "../error-text/index.ts";
import { Spinner } from "../spinner/index.ts";
import type { Requiredness } from "./field-state.ts";
import style from "./field.module.scss";

/**
 * The props every field takes, on every tier: the raw compound's root, the
 * `<Control>Field` shorthand and the `TSF<Control>Field` bridge.
 */
export type FieldProps = Readonly<{
	/** The visible label; never only a placeholder. */
	label: string;
	/** Help shown under the control, before any error. */
	description?: ReactNode;
	/** Errors in any shape `normalizeFieldErrors` accepts. Any line makes the field invalid. */
	errors?: unknown;
	/** What the label asserts. Left out, it shows neither mark. */
	requiredness?: Requiredness;
	/** The word an optional field's label trails, such as "optional". */
	optionalLabel: string;
	/** The value differs from the one the form started with. */
	dirty?: boolean;
	/** The user has left the control at least once. */
	touched?: boolean;
	/** Background work, such as an async validator, is in flight. */
	pending?: boolean;
}>;

const isEmpty = (children: ReactNode): boolean =>
	children === undefined ||
	children === null ||
	children === false ||
	children === "";

/** The copy and assertion a label carries about requiredness. */
export type RequirednessProps = Readonly<{
	requiredness?: Requiredness;
	/** The word an optional field's label trails, such as "optional". */
	optionalLabel: string;
}>;

/**
 * The mark a label carries when its field is required. Decoration only: the
 * control's own `required` tells assistive tech.
 *
 * @example
 * <Field.RequiredMark requiredness="required" />
 */
const RequiredMark = ({
	requiredness,
}: Readonly<{ requiredness?: Requiredness }>): ReactNode =>
	requiredness === "required" ? (
		<span className={style.required} aria-hidden="true" />
	) : null;

/**
 * The suffix a label trails: the required mark, or the optional word.
 *
 * @example
 * <Field.Requiredness requiredness="optional" optionalLabel="optional" />
 */
const FieldRequiredness = ({
	requiredness,
	optionalLabel,
}: RequirednessProps): ReactNode =>
	requiredness === "optional" ? (
		<span className={style.optional}>{optionalLabel}</span>
	) : (
		<RequiredMark requiredness={requiredness} />
	);

export type InlineLabelTextProps = RequirednessProps &
	Readonly<{
		label: string;
		/** The label of the field the row sits in, which carries the suffix instead. */
		fieldLabel?: string;
	}>;

/**
 * The text beside a control that shares its label, carrying the suffix a
 * `fieldLabel` above the row would otherwise carry.
 *
 * @example
 * <BaseField.Label>
 * 	<Checkbox />
 * 	<Field.InlineLabelText label={label} requiredness="optional" optionalLabel="optional" />
 * </BaseField.Label>
 */
const InlineLabelText = ({
	label,
	fieldLabel,
	requiredness,
	optionalLabel,
}: InlineLabelTextProps): ReactNode => (
	<>
		<span className={style.inlineText}>
			{label}
			{fieldLabel === undefined &&
				requiredness === "required" && (
					<>
						{" "}
						<RequiredMark requiredness={requiredness} />
					</>
				)}
		</span>
		{requiredness === "optional" &&
			fieldLabel === undefined && (
				<span
					data-optional-suffix=""
					className={clsx(
						style.optional,
						style.inlineOptional,
					)}>
					{optionalLabel}
				</span>
			)}
	</>
);

export type FieldRootProps = BaseField.Root.Props &
	Readonly<{
		className?: string;
	}>;

/**
 * The field frame: label, control, description and error stacked full width.
 *
 * @example
 * <Field.Root name="email" invalid={invalid}>…</Field.Root>
 */
const FieldRoot = ({
	className,
	...props
}: FieldRootProps): ReactNode => (
	<BaseField.Root
		className={clsx(style.field, className)}
		{...props}
	/>
);

export type FieldLabelProps = Omit<
	BaseField.Label.Props,
	"className"
> &
	RequirednessProps &
	Readonly<{
		className?: string;
	}>;

/**
 * The label above a control, trailing its requiredness. Renders nothing without
 * children.
 *
 * @example
 * <Field.Label requiredness="optional" optionalLabel="optional">Notes</Field.Label>
 */
const FieldLabel = ({
	children,
	requiredness,
	optionalLabel,
	className,
	...props
}: FieldLabelProps): ReactNode =>
	isEmpty(children) ? null : (
		<BaseField.Label
			className={clsx(style.label, className)}
			{...props}>
			{children}{" "}
			<FieldRequiredness
				requiredness={requiredness}
				optionalLabel={optionalLabel}
			/>
		</BaseField.Label>
	);

export type FieldCaptionProps = ComponentProps<"p"> &
	RequirednessProps;

/**
 * A caption styled like a field label, which names nothing: a paragraph, with
 * no `for` and no `aria-labelledby` of its own. Use it for standing text above
 * a control that already carries its own name. To name something, use `Label`.
 *
 * @example
 * <Field.Caption optionalLabel="optional">Theme</Field.Caption>
 */
const FieldCaption = ({
	children,
	requiredness,
	optionalLabel,
	className,
	...props
}: FieldCaptionProps): ReactNode =>
	isEmpty(children) ? null : (
		<p className={clsx(style.label, className)} {...props}>
			{children}{" "}
			<FieldRequiredness
				requiredness={requiredness}
				optionalLabel={optionalLabel}
			/>
		</p>
	);

/**
 * The help under a control. Renders nothing without children.
 *
 * @example
 * <Field.Description>We only use it to send the receipt.</Field.Description>
 */
const FieldDescription = ({
	children,
	className,
	...props
}: BaseField.Description.Props): ReactNode =>
	isEmpty(children) ? null : (
		<BaseField.Description
			className={clsx(style.description, className)}
			{...props}>
			{children}
		</BaseField.Description>
	);

export type FieldErrorProps = Omit<
	BaseField.Error.Props,
	"match" | "render" | "children"
> &
	Readonly<{
		/** Errors in any shape `normalizeFieldErrors` accepts. */
		children?: unknown;
	}>;

/**
 * The one error part every control renders, after the description. Normalises
 * its errors to lines with `normalizeFieldErrors` and renders nothing when
 * there are none. It is the field's only live region, so a control must not
 * announce the same message a second time.
 *
 * @example
 * <Field.Error>{errors}</Field.Error>
 */
const FieldError = ({
	children: errors,
	...props
}: FieldErrorProps): ReactNode => {
	const messages = normalizeFieldErrors(errors);
	return messages.length === 0 ? null : (
		<BaseField.Error
			match
			{...props}
			render={renderProps => (
				<ErrorText el="span" role="alert" {...renderProps}>
					{messages}
				</ErrorText>
			)}
		/>
	);
};

export type FieldPendingProps = Readonly<{
	className?: string;
}>;

/**
 * The spinner a field shows while background work is in flight, sized to sit
 * in the box beside the control. The control decides when it is mounted, once
 * the wait is worth showing. It is decoration: the wait reaches assistive tech
 * as the `aria-busy` that `fieldStateAttributes` projects.
 *
 * @example
 * {phase !== "fresh" && <Field.Pending />}
 */
const FieldPending = ({
	className,
}: FieldPendingProps): ReactNode => (
	<span className={clsx(style.pending, className)}>
		<Spinner size={1} />
	</span>
);

/** Stable ids for the parts of one field. */
export type FieldIds = Readonly<{
	labelId: string;
	descriptionId: string;
	errorId: string;
	/** A stable id and name for the control. */
	controlId: string;
	/** The control's `aria-describedby`: the description and the error that are shown. */
	describedBy: (
		hasDescription: boolean,
		invalid: boolean,
	) => string | undefined;
}>;

/**
 * Stable ids for a field's label, description and error, for controls that
 * wire `aria-labelledby` and `aria-describedby` themselves.
 *
 * @example
 * const { labelId, errorId } = useFieldIds();
 */
export const useFieldIds = (): FieldIds => {
	const id = useId();
	const descriptionId = `${id}description`;
	const errorId = `${id}error`;
	return {
		labelId: `${id}label`,
		descriptionId,
		errorId,
		controlId: `${id}control`,
		describedBy: (hasDescription, invalid) =>
			[
				hasDescription ? descriptionId : "",
				invalid ? errorId : "",
			]
				.filter(part => part !== "")
				.join(" ") || undefined,
	};
};

/** The parts of a field. */
export type FieldParts = Readonly<{
	Root: typeof FieldRoot;
	Label: typeof FieldLabel;
	Caption: typeof FieldCaption;
	Control: typeof BaseField.Control;
	Description: typeof FieldDescription;
	Error: typeof FieldError;
	Pending: typeof FieldPending;
	Item: typeof BaseField.Item;
	Validity: typeof BaseField.Validity;
	Requiredness: typeof FieldRequiredness;
	RequiredMark: typeof RequiredMark;
	InlineLabelText: typeof InlineLabelText;
	useIds: typeof useFieldIds;
}>;

/**
 * The field frame and its parts, over base-ui's `Field`. A control's raw tier
 * renders inside `Root` and names itself through `Label`; `Description` comes
 * before `Error`, the field's only live region.
 *
 * @example
 * <Field.Root name="email" invalid={invalid}>
 * 	<Field.Label requiredness="required" optionalLabel="optional">Email</Field.Label>
 * 	<Field.Control />
 * 	<Field.Description>We send the receipt here.</Field.Description>
 * 	<Field.Error>{errors}</Field.Error>
 * </Field.Root>
 */
export const Field: FieldParts = {
	Root: FieldRoot,
	Label: FieldLabel,
	Caption: FieldCaption,
	Control: BaseField.Control,
	Description: FieldDescription,
	Error: FieldError,
	Pending: FieldPending,
	Item: BaseField.Item,
	Validity: BaseField.Validity,
	Requiredness: FieldRequiredness,
	RequiredMark,
	InlineLabelText,
	useIds: useFieldIds,
};
