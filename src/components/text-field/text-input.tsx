import {
	Input as BaseInput,
	type InputProps as BaseInputProps,
} from "@base-ui/react/input";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ComponentPropsWithRef,
	type ReactNode,
	useRef,
	useState,
} from "react";
import { lengthTone } from "../../lib/text-length.ts";
import {
	Field,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
	useFieldState,
} from "../field/index.ts";
import {
	InputError,
	type InputErrorProps,
	InputLabel,
	type InputLabelProps,
	InputPartsContext,
	InputPending,
	type InputPendingProps,
} from "../field/input-parts.tsx";
import { focusControlOnRim } from "../field/rim-focus.ts";
import { withFieldFocus } from "../field/use-field-focus.ts";
import {
	TextInputContext,
	type TextInputControl,
	useTextInputContext,
} from "./text-input-context.ts";
import style from "./text-field.module.scss";

const COPIED_FEEDBACK_MS = 2000;

export type TextInputRootProps = Omit<
	FieldProps,
	"label" | "description" | "optionalLabel"
> &
	Readonly<{
		value: string;
		onValueChange: (value: string) => void;
		disabled?: boolean;
		readOnly?: boolean;
		/** Advisory maximum, shown by `Counter`. The control does not truncate. */
		maxLength?: number;
		/** States no prop here owns, projected over the ones that do. */
		state?: FieldState;
		className?: string;
		children?: ReactNode;
	}>;

/**
 * The field frame around a text input, holding its value and projecting its
 * state onto every part.
 *
 * @example
 * <TextInput.Root value={value} onValueChange={setValue}>…</TextInput.Root>
 */
const TextInputRoot = ({
	value,
	onValueChange,
	disabled,
	readOnly,
	requiredness,
	errors,
	dirty,
	touched,
	pending = false,
	maxLength,
	state,
	className,
	children,
}: TextInputRootProps): ReactNode => {
	const controlRef = useRef<TextInputControl | null>(null);
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled: value !== "",
		state,
	});

	return (
		<InputPartsContext
			value={{
				state: field.state,
				errors,
				phase: field.phase,
			}}>
			<TextInputContext
				value={{
					state: field.state,
					value,
					setValue: onValueChange,
					setControl: control => {
						controlRef.current = control;
					},
					focusControl: () => controlRef.current?.focus(),
					selectControl: () => {
						controlRef.current?.focus();
						controlRef.current?.select();
					},
					maxLength,
				}}>
				<Field.Root
					disabled={field.disabled}
					invalid={field.invalid}
					requiredness={field.state.requiredness}
					dirty={dirty}
					touched={touched}
					className={clsx(style.root, className)}
					{...fieldStateAttributes(field.state)}>
					{children}
				</Field.Root>
			</TextInputContext>
		</InputPartsContext>
	);
};

export type TextInputLabelProps = InputLabelProps;

/**
 * The bordered box holding the control and its inlays.
 *
 * @example
 * <TextInput.Group><TextInput.Input /></TextInput.Group>
 */
const TextInputGroup = ({
	className,
	children,
	...props
}: ComponentProps<"div">): ReactNode => {
	const { state } = useTextInputContext();
	const focus = useFieldFocus(props);
	return (
		<div
			className={clsx(style.group, className)}
			onMouseDown={focusControlOnRim}
			{...fieldStateAttributes(
				withFieldFocus(state, focus),
			)}
			{...props}
			{...focus.props}>
			{children}
		</div>
	);
};

/**
 * A strip of inlays along the bottom edge of the group.
 *
 * @example
 * <TextInput.Bar><TextInput.Counter /></TextInput.Bar>
 */
const TextInputBar = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div className={clsx(style.bar, className)} {...props} />
);

/**
 * A slot beside the control inside the group, such as an icon.
 *
 * @example
 * <TextInput.Inlay aria-hidden="true"><SearchIcon /></TextInput.Inlay>
 */
const TextInputInlay = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.inlay, className)}
		{...props}
	/>
);

/**
 * Static text beside the control, such as a unit. Decoration only.
 *
 * @example
 * <TextInput.Affix>kg</TextInput.Affix>
 */
const TextInputAffix = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		aria-hidden="true"
		className={clsx(style.inlay, className)}
		{...props}
	/>
);

export type TextInputInputProps = Omit<
	BaseInputProps,
	"value" | "defaultValue" | "onValueChange"
>;

/**
 * The bare control, bound to `Root`'s value.
 *
 * @example
 * <TextInput.Input type="email" />
 */
const TextInputInput = ({
	type = "text",
	className,
	...props
}: TextInputInputProps): ReactNode => {
	const { value, setValue, state, setControl } =
		useTextInputContext();
	return (
		<BaseInput
			ref={node => {
				setControl(
					node instanceof HTMLInputElement ? node : null,
				);
			}}
			type={type}
			value={value}
			onValueChange={setValue}
			disabled={state.disabled}
			readOnly={state.readonly}
			required={state.requiredness === "required"}
			className={clsx(style.control, className)}
			{...props}
		/>
	);
};

/** The props of a button part: the button's own, but the click, which the part owns. */
type InlayButtonProps = Omit<
	ComponentPropsWithRef<"button">,
	"onClick" | "type" | "children"
>;

export type TextInputClearProps = InlayButtonProps &
	Readonly<{
		/** The button to render, such as `<IconButton label="Clear"><CloseIcon /></IconButton>`. */
		render: useRender.RenderProp;
	}>;

/**
 * The button that empties the control, shown once it holds a value. It renders
 * whichever button it is given.
 *
 * @example
 * <TextInput.Clear render={<IconButton label="Clear" variant="tertiary" size="sm"><CloseIcon /></IconButton>} />
 */
const TextInputClear = ({
	render,
	className,
	...props
}: TextInputClearProps): ReactNode => {
	const { value, setValue, state, focusControl } =
		useTextInputContext();
	return useRender({
		render,
		enabled:
			value !== "" &&
			state.disabled !== true &&
			state.readonly !== true,
		props: {
			...props,
			type: "button",
			className: clsx(style.action, className),
			onClick: () => {
				setValue("");
				focusControl();
			},
		},
	});
};

/** Where a copy stands: not tried, landed, or refused and selected instead. */
export type TextInputCopyOutcome =
	| "idle"
	| "copied"
	| "failed";

/** The state a `Copy` part renders from, also set as `data-outcome`. */
export type TextInputCopyState = Readonly<{
	outcome: TextInputCopyOutcome;
}>;

export type TextInputCopyProps = InlayButtonProps &
	Readonly<{
		/** Announced once the value is on the clipboard, such as "Copied". */
		copiedLabel: string;
		/** Announced once copying failed and the text is selected instead. */
		failedLabel: string;
		/** The button to render, or a function of the copy's state that returns one. */
		render: useRender.RenderProp<TextInputCopyState>;
	}>;

/**
 * Writes text to the clipboard, rejecting where there is no clipboard as well
 * as where the browser refuses.
 *
 * @example
 * void writeClipboard("NL91ABNA0417164300").catch(selectByHand);
 */
const writeClipboard = async (text: string) =>
	navigator.clipboard.writeText(text);

/**
 * The button that copies the value to the clipboard, shown once it holds one,
 * and announces whether the copy landed. It renders whichever button it is
 * given, and a render function can follow the outcome.
 *
 * @example
 * <TextInput.Copy
 * 	copiedLabel="Copied"
 * 	failedLabel="Copy failed, text selected"
 * 	render={(props, { outcome }) => (
 * 		<IconButton {...props} label="Copy" variant="tertiary" size="sm">
 * 			{outcome === "copied" ? <CheckIcon /> : <CopyIcon />}
 * 		</IconButton>
 * 	)}
 * />
 */
const TextInputCopy = ({
	copiedLabel,
	failedLabel,
	render,
	className,
	...props
}: TextInputCopyProps): ReactNode => {
	const { value, state, selectControl } =
		useTextInputContext();
	const [outcome, setOutcome] =
		useState<TextInputCopyOutcome>("idle");
	const shown = value !== "" && state.disabled !== true;
	const settle = (next: TextInputCopyOutcome) => {
		setOutcome(next);
		setTimeout(
			() => setOutcome("idle"),
			COPIED_FEEDBACK_MS,
		);
	};
	const button = useRender({
		render,
		enabled: shown,
		state: { outcome },
		props: {
			...props,
			type: "button",
			className: clsx(style.action, className),
			onClick: () => {
				void writeClipboard(value).then(
					() => settle("copied"),
					() => {
						selectControl();
						settle("failed");
					},
				);
			},
		},
	});
	if (!shown) {
		return null;
	}
	const announcements: Readonly<
		Record<TextInputCopyOutcome, string>
	> = {
		idle: "",
		copied: copiedLabel,
		failed: failedLabel,
	};
	return (
		<>
			{button}
			<span role="status" className={style.copyStatus}>
				{announcements[outcome]}
			</span>
		</>
	);
};

/** The state a `Reveal` part renders from, also set as `data-revealed`. */
export type TextInputRevealState = Readonly<{
	revealed: boolean;
}>;

export type TextInputRevealProps = InlayButtonProps &
	Readonly<{
		/** Whether the concealed value shows as text. */
		revealed: boolean;
		onRevealedChange: (revealed: boolean) => void;
		/** The button to render, or a function of `revealed` that returns one. */
		render: useRender.RenderProp<TextInputRevealState>;
	}>;

/**
 * The toggle that shows a concealed value, such as a password, as text. The
 * caller switches the `Input`'s `type` with `revealed`, and names the button for
 * what a press will do.
 *
 * @example
 * <TextInput.Reveal
 * 	revealed={revealed}
 * 	onRevealedChange={setRevealed}
 * 	render={
 * 		<Button variant="tertiary" size="sm">{revealed ? "Hide" : "Show"}</Button>
 * 	}
 * />
 */
const TextInputReveal = ({
	revealed,
	onRevealedChange,
	render,
	className,
	...props
}: TextInputRevealProps): ReactNode => {
	const { state } = useTextInputContext();
	return useRender({
		render,
		state: { revealed },
		props: {
			...props,
			type: "button",
			disabled: state.disabled,
			className: clsx(style.action, className),
			onClick: () => onRevealedChange(!revealed),
		},
	});
};

/**
 * The value's length against `Root`'s `maxLength`, toned as it nears the limit.
 * Renders nothing without a `maxLength`.
 *
 * @example
 * <TextInput.Counter />
 */
const TextInputCounter = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => {
	const { value, maxLength } = useTextInputContext();
	if (maxLength === undefined) {
		return null;
	}
	return (
		<span
			aria-live="off"
			data-tone={lengthTone(value.length, maxLength)}
			className={clsx(style.counter, className)}
			{...props}>
			{value.length}/{maxLength}
		</span>
	);
};

export type TextInputPendingProps = InputPendingProps;

export type TextInputErrorProps = InputErrorProps;

/** The parts of a text input. */
export type TextInputParts = Readonly<{
	Root: typeof TextInputRoot;
	Label: typeof InputLabel;
	Group: typeof TextInputGroup;
	Bar: typeof TextInputBar;
	Inlay: typeof TextInputInlay;
	Affix: typeof TextInputAffix;
	Input: typeof TextInputInput;
	Clear: typeof TextInputClear;
	Copy: typeof TextInputCopy;
	Reveal: typeof TextInputReveal;
	Counter: typeof TextInputCounter;
	Pending: typeof InputPending;
	Description: typeof Field.Description;
	Error: typeof InputError;
}>;

/**
 * The parts of a text input: the field frame, a group carrying the border and
 * its inlays, and the bare control inside it. A `Bar` is a strip of inlays along
 * the bottom edge of the group, for a control the inlays cannot sit beside. For
 * the ordinary case, use the `TextField` shorthand, which is assembled from
 * exactly these parts. An `Affix` is decoration, so its meaning belongs in the
 * label or description too. `Error` renders the errors `Root` was given.
 *
 * @example
 * <TextInput.Root value={value} onValueChange={setValue} errors={errors} requiredness="optional">
 * 	<TextInput.Label>Email <Field.Requiredness optionalLabel="optional" /></TextInput.Label>
 * 	<TextInput.Group>
 * 		<TextInput.Input type="email" />
 * 		<TextInput.Clear
 * 			render={
 * 				<IconButton label="Clear" variant="tertiary" size="sm">
 * 					<CloseIcon />
 * 				</IconButton>
 * 			}
 * 		/>
 * 	</TextInput.Group>
 * 	<TextInput.Error />
 * </TextInput.Root>
 */
export const TextInput: TextInputParts = {
	Root: TextInputRoot,
	Label: InputLabel,
	Group: TextInputGroup,
	Bar: TextInputBar,
	Inlay: TextInputInlay,
	Affix: TextInputAffix,
	Input: TextInputInput,
	Clear: TextInputClear,
	Copy: TextInputCopy,
	Reveal: TextInputReveal,
	Counter: TextInputCounter,
	Pending: InputPending,
	Description: Field.Description,
	Error: InputError,
};
