import {
	Input as BaseInput,
	type InputProps as BaseInputProps,
} from "@base-ui/react/input";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ReactNode,
	useRef,
	useState,
} from "react";
import { lengthTone } from "../../lib/text-length.ts";
import { Button } from "../button/index.ts";
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
	"label" | "description"
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
 * <TextInput.Root value={value} onValueChange={setValue} optionalLabel="optional">…</TextInput.Root>
 */
const TextInputRoot = ({
	value,
	onValueChange,
	disabled,
	readOnly,
	requiredness,
	optionalLabel,
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
				optionalLabel,
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

export type TextInputClearProps = Readonly<{
	/** Accessible name and tooltip hint, such as "Clear". */
	label: string;
	className?: string;
	/** The icon the button shows. */
	children: ReactNode;
}>;

/**
 * The icon-only button that empties the control, shown once it holds a value.
 *
 * @example
 * <TextInput.Clear label="Clear"><CloseIcon /></TextInput.Clear>
 */
const TextInputClear = ({
	label,
	className,
	children,
}: TextInputClearProps): ReactNode => {
	const { value, setValue, state, focusControl } =
		useTextInputContext();
	if (
		value === "" ||
		state.disabled === true ||
		state.readonly === true
	) {
		return null;
	}
	return (
		<Button
			iconOnly
			icon={children}
			label={label}
			variant="tertiary"
			size="sm"
			className={clsx(style.action, className)}
			onClick={() => {
				setValue("");
				focusControl();
			}}
		/>
	);
};

export type TextInputCopyProps = Readonly<{
	/** Accessible name and tooltip hint, such as "Copy". */
	label: string;
	/** Accessible name and announcement while the confirmation shows, such as "Copied". */
	copiedLabel: string;
	/** Accessible name and announcement once copying failed and the text is selected instead. */
	failedLabel: string;
	/** The icon while the confirmation shows. Left out, the button keeps its own. */
	copiedIcon?: ReactNode;
	/** The icon once copying failed. Left out, the button keeps its own. */
	failedIcon?: ReactNode;
	className?: string;
	/** The icon the button shows. */
	children: ReactNode;
}>;

type CopyOutcome = "idle" | "copied" | "failed";

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
 * The icon-only button that copies the value to the clipboard, shown once it
 * holds one, and announces whether the copy landed.
 *
 * @example
 * <TextInput.Copy label="Copy" copiedLabel="Copied" failedLabel="Copy failed, text selected"><CopyIcon /></TextInput.Copy>
 */
const TextInputCopy = ({
	label,
	copiedLabel,
	failedLabel,
	copiedIcon,
	failedIcon,
	className,
	children,
}: TextInputCopyProps): ReactNode => {
	const { value, state, selectControl } =
		useTextInputContext();
	const [outcome, setOutcome] =
		useState<CopyOutcome>("idle");
	if (value === "" || state.disabled === true) {
		return null;
	}
	const settle = (next: CopyOutcome) => {
		setOutcome(next);
		setTimeout(
			() => setOutcome("idle"),
			COPIED_FEEDBACK_MS,
		);
	};
	const labels: Readonly<Record<CopyOutcome, string>> = {
		idle: label,
		copied: copiedLabel,
		failed: failedLabel,
	};
	const icons: Readonly<Record<CopyOutcome, ReactNode>> = {
		idle: children,
		copied: copiedIcon ?? children,
		failed: failedIcon ?? children,
	};
	return (
		<>
			<Button
				iconOnly
				icon={icons[outcome]}
				label={labels[outcome]}
				tone={outcome === "failed" ? "danger" : "brand"}
				variant="tertiary"
				size="sm"
				className={clsx(style.action, className)}
				onClick={() => {
					void writeClipboard(value).then(
						() => settle("copied"),
						() => {
							selectControl();
							settle("failed");
						},
					);
				}}
			/>
			<span role="status" className={style.copyStatus}>
				{outcome === "idle" ? "" : labels[outcome]}
			</span>
		</>
	);
};

export type TextInputRevealProps = Readonly<{
	/** Whether the concealed value shows as text. */
	revealed: boolean;
	onRevealedChange: (revealed: boolean) => void;
	/** Accessible name and tooltip hint, such as "Show password". */
	label: string;
	className?: string;
	/** The icon the button shows. */
	children: ReactNode;
}>;

/**
 * The icon-only toggle that shows a concealed value, such as a password, as
 * text. The caller switches the `Input`'s `type` with `revealed`.
 *
 * @example
 * <TextInput.Reveal revealed={revealed} onRevealedChange={setRevealed} label="Show password"><VisibilityIcon /></TextInput.Reveal>
 */
const TextInputReveal = ({
	revealed,
	onRevealedChange,
	label,
	className,
	children,
}: TextInputRevealProps): ReactNode => {
	const { state } = useTextInputContext();
	return (
		<Button
			iconOnly
			icon={children}
			label={label}
			variant="tertiary"
			size="sm"
			aria-pressed={revealed}
			disabled={state.disabled}
			className={clsx(style.action, className)}
			onClick={() => onRevealedChange(!revealed)}
		/>
	);
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
 * <TextInput.Root value={value} onValueChange={setValue} errors={errors} optionalLabel="optional">
 * 	<TextInput.Label>Email</TextInput.Label>
 * 	<TextInput.Group>
 * 		<TextInput.Input type="email" />
 * 		<TextInput.Clear label="Clear">
 * 			<CloseIcon />
 * 		</TextInput.Clear>
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
