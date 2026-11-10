import { useRender } from "@base-ui/react/use-render";
import {
	type AnyFormApi,
	useStore,
} from "@tanstack/react-form";
import {
	type ComponentPropsWithRef,
	type ReactElement,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import {
	formContext,
	useFormContext,
} from "../../lib/forms/context.tsx";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { useFailedSubmitFocus } from "../../lib/forms/failed-submit.tsx";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import {
	type LeaveGuardPolicy,
	whenDirty,
} from "../../lib/unsaved-changes/policy.ts";
import { useReportUnsavedChanges } from "../../lib/unsaved-changes/registry.ts";
import {
	Button,
	type ButtonProps,
} from "../button/index.ts";
import {
	createErrorCascade,
	ErrorCascadeProvider,
} from "../error-text/error-cascade.ts";
import { ErrorText } from "../error-text/index.ts";
import { Spinner } from "../spinner/index.ts";
import { focusFirstInvalid } from "./first-invalid.ts";
import {
	FormDisabledProvider,
	FormStatusProvider,
	useFormDisabled,
	useFormStatus,
} from "./form-context.ts";
import style from "./form.module.scss";

export type FormRootProps = Omit<
	ComponentPropsWithRef<"form">,
	"onSubmit" | "children"
> &
	Readonly<{
		/** The form instance, from `useAppForm`. */
		form: AnyFormApi;
		/** Work the form waits on besides its own submit, such as a mutation it started. */
		busy?: boolean;
		/** When the form reports unsaved changes to the page's leave guards, decided from its live state. Defaults to `whenDirty`. */
		leaveGuard?: LeaveGuardPolicy;
		children: ReactNode;
	}>;

/**
 * The `<form>`: it submits through the form instance, disables its fields while
 * busy, focuses the first invalid control after a failed submit, and reports
 * unsaved changes to the page's leave guards while `leaveGuard` holds.
 *
 * @example
 * <Form.Root form={form}>…</Form.Root>
 */
const FormRoot = ({
	form,
	busy = false,
	leaveGuard = whenDirty,
	children,
	...props
}: FormRootProps): ReactNode => {
	const submitting = useStore(
		form.store,
		state => state.isSubmitting,
	);
	const guarded = useStore(form.store, leaveGuard);
	useReportUnsavedChanges(guarded);
	const disabled = busy || submitting;
	const content = useRef<HTMLFieldSetElement>(null);
	const [invalidSubmits, setInvalidSubmits] = useState(0);
	const focusedSubmits = useRef(0);
	const [cascade] = useState(() => createErrorCascade());
	const [status, setStatus] = useState<HTMLElement | null>(
		null,
	);

	useFailedSubmitFocus(form, () =>
		setInvalidSubmits(count => count + 1),
	);

	useEffect(() => {
		if (
			disabled ||
			content.current === null ||
			focusedSubmits.current === invalidSubmits
		) {
			return;
		}
		focusedSubmits.current = invalidSubmits;
		focusFirstInvalid(content.current);
	}, [disabled, invalidSubmits]);

	return (
		<formContext.Provider value={form}>
			<form
				noValidate
				aria-busy={disabled || undefined}
				{...props}
				onSubmit={event => {
					event.preventDefault();
					void form.handleSubmit();
				}}>
				<fieldset
					ref={content}
					disabled={disabled}
					inert={disabled}
					className={style.fieldset}>
					<FormDisabledProvider value={disabled}>
						<FormStatusProvider value={status}>
							<ErrorCascadeProvider value={cascade}>
								{children}
							</ErrorCascadeProvider>
						</FormStatusProvider>
					</FormDisabledProvider>
				</fieldset>
				<span
					ref={setStatus}
					role="status"
					className={style.status}
				/>
			</form>
		</formContext.Provider>
	);
};

export type FormErrorsProps = Readonly<{
	className?: string;
}>;

/**
 * The errors that belong to the form rather than to one of its fields, such
 * as a refusal `onSubmitAsync` returns. Renders nothing when there are none.
 *
 * @example
 * <Form.Errors />
 */
const FormErrors = ({
	className,
}: FormErrorsProps): ReactNode => {
	const form = useFormContext();
	const errors = useStore(
		form.store,
		state => state.errors,
	);
	return (
		<ErrorText role="alert" className={className}>
			{normalizeFieldErrors(errors)}
		</ErrorText>
	);
};

export type FormPendingProps =
	useRender.ComponentProps<"span">;

/**
 * What the form shows while its wait is worth showing, such as a spinner: it
 * renders once the form has been busy for 150 ms, and stays at least 200 ms.
 * It is decoration; `Form.Submit` announces the wait.
 *
 * @example
 * <Form.Pending render={<Spinner size={1} />} />
 */
const FormPending = ({
	render,
	ref,
	...props
}: FormPendingProps): ReactElement | null => {
	const busy = useFormDisabled();
	return useRender({
		defaultTagName: "span",
		render,
		ref,
		enabled: useBusyPhase({ busy }) !== "fresh",
		props,
	});
};

export type FormSubmitProps = Omit<ButtonProps, "type"> &
	Readonly<{
		/** What a wait is announced as once it has lasted, such as "Saving". */
		busyLabel: string;
	}>;

/**
 * The form's submit button. A wait that lasts 150 ms shows a `Form.Pending`
 * spinner in place of its icon, is announced as `busyLabel`, and stays shown
 * at least 200 ms.
 *
 * @example
 * <Form.Submit busyLabel="Saving">Save</Form.Submit>
 */
const FormSubmit = ({
	busyLabel,
	variant = "primary",
	icon,
	children,
	...props
}: FormSubmitProps): ReactNode => {
	const busy = useFormDisabled();
	const status = useFormStatus();
	const shown = useBusyPhase({ busy }) !== "fresh";

	return (
		<>
			<Button
				{...props}
				type="submit"
				variant={variant}
				icon={shown ? undefined : icon}
				aria-busy={shown || undefined}>
				<FormPending render={<Spinner size={1} />} />
				{children}
			</Button>
			{shown && status !== null
				? createPortal(busyLabel, status)
				: null}
		</>
	);
};

/** The parts of a form. */
export type FormParts = Readonly<{
	Root: typeof FormRoot;
	Errors: typeof FormErrors;
	Pending: typeof FormPending;
	Submit: typeof FormSubmit;
}>;

/**
 * A form over a TanStack Form instance: `Root` is the `<form>`, `Errors` its
 * form-level errors, `Submit` its submit button and `Pending` what shows while
 * it waits.
 *
 * @example
 * <Form.Root form={form}>
 * 	<form.AppField name="email">{field => <field.EmailField label="Email" optionalLabel="optional" />}</form.AppField>
 * 	<Form.Errors />
 * 	<Form.Submit busyLabel="Signing in">Sign in</Form.Submit>
 * </Form.Root>
 */
export const Form: FormParts = {
	Root: FormRoot,
	Errors: FormErrors,
	Pending: FormPending,
	Submit: FormSubmit,
};
