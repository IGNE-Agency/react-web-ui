import { Select as BaseSelect } from "@base-ui/react/select";
import { clsx } from "clsx";
import {
	type Context,
	createContext,
	type ReactNode,
	useContext,
	useRef,
} from "react";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import { Button } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldPendingProps,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	type OptionsLoad,
	useFieldFocus,
	useFieldState,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import {
	InputError,
	InputPartsContext,
	useInputPartsContext,
} from "../field/input-parts.tsx";
import {
	OPTIONS_LOADED,
	optionsLoadMessage,
} from "../field/options-load.ts";
import { withFieldFocus } from "../field/use-field-focus.ts";
import { Spinner } from "../spinner/index.ts";
import {
	SelectContext,
	type SelectOption,
	useSelectContext,
} from "./select-context.ts";
import style from "./select.module.scss";

export type { SelectOption };

export type SelectRootProps<T extends string> = Omit<
	FieldProps,
	"label" | "description"
> &
	Omit<
		BaseSelect.Root.Props<T>,
		| "items"
		| "onValueChange"
		| "disabled"
		| "readOnly"
		| "required"
		| "inputRef"
		| "children"
	> &
	Readonly<{
		/** The selectable options; `label` is what the trigger and list display. */
		options: readonly SelectOption<T>[];
		/** Called with the new value. */
		onValueChange?: (value: T) => void;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Shows the value without letting it be changed. */
		readOnly?: boolean;
		/** States no prop here owns, projected over the ones that do. */
		state?: FieldState;
		/** Called once focus has left the field, its popup included. */
		onBlur?: FieldBlurHandler;
		/** Applied to the field frame, so callers can size the control. */
		className?: string;
		/** The field's parts. */
		children?: ReactNode;
	}>;

/**
 * The field frame around a select, holding its options and value and
 * projecting its state onto every part.
 *
 * @example
 * <Select.Root options={options} value={value} onValueChange={setValue}>…</Select.Root>
 */
const SelectRoot = <T extends string>({
	options,
	onValueChange,
	disabled,
	readOnly,
	requiredness,
	errors,
	dirty,
	touched,
	pending = false,
	state,
	onBlur,
	name,
	onOpenChange,
	onOpenChangeComplete,
	className,
	children,
	...props
}: SelectRootProps<T>): ReactNode => {
	const ids = Field.useIds();
	const open = useRef(false);
	const focused = useRef(false);
	const inside = useRef(false);
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled:
			props.value !== undefined &&
			props.value !== null &&
			props.value !== "",
		state,
	});
	const leave = () => {
		if (
			inside.current &&
			!open.current &&
			!focused.current
		) {
			inside.current = false;
			onBlur?.();
		}
	};

	return (
		<InputPartsContext
			value={{
				state: field.state,
				errors,
				phase: field.phase,
			}}>
			<SelectContext
				value={{
					options,
					triggerFocused: () => {
						focused.current = true;
						inside.current = true;
					},
					triggerBlurred: () => {
						focused.current = false;
						leave();
					},
				}}>
				<Field.Root
					disabled={field.disabled}
					invalid={field.invalid}
					requiredness={field.state.requiredness}
					dirty={dirty}
					touched={touched}
					phase={field.phase}
					className={className}
					{...fieldStateAttributes(field.state)}>
					<BaseSelect.Root<T>
						items={options}
						name={name ?? ids.controlId}
						inputRef={detachHiddenInput}
						disabled={field.disabled}
						readOnly={readOnly}
						required={requiredness === "required"}
						onValueChange={next => {
							if (next !== null) {
								onValueChange?.(next);
							}
						}}
						onOpenChange={(next, details) => {
							open.current = next;
							if (next) {
								inside.current = true;
							}
							onOpenChange?.(next, details);
						}}
						onOpenChangeComplete={next => {
							onOpenChangeComplete?.(next);
							if (!next) {
								requestAnimationFrame(leave);
							}
						}}
						{...props}>
						{children}
					</BaseSelect.Root>
				</Field.Root>
			</SelectContext>
		</InputPartsContext>
	);
};

/** The label that names the trigger. */
const SelectLabel = ({
	className,
	...props
}: BaseSelect.Label.Props): ReactNode => (
	<BaseSelect.Label
		className={clsx(style.label, className)}
		{...props}
	/>
);

export type SelectTriggerProps = BaseSelect.Trigger.Props &
	Readonly<{
		/** States the root does not own, projected over its own onto the trigger. */
		state?: FieldState;
	}>;

type TriggerFocusEvent = Parameters<
	NonNullable<BaseSelect.Trigger.Props["onFocus"]>
>[0];

const TriggerStateContext: Context<FieldState> =
	createContext<FieldState>({});

/**
 * The chosen option's label on the trigger, or `placeholder` while nothing is
 * chosen.
 *
 * @example
 * <Select.Value placeholder="Pick a status" />
 */
const SelectValue = ({
	className,
	...props
}: BaseSelect.Value.Props): ReactNode => (
	<BaseSelect.Value
		className={clsx(style.value, className)}
		{...props}
	/>
);

/**
 * What the trigger shows while the field is pending, such as a spinner.
 * Renders nothing otherwise.
 *
 * @example
 * <Select.Pending><Spinner size={1} /></Select.Pending>
 */
const SelectPending = (
	props: FieldPendingProps,
): ReactNode =>
	useContext(TriggerStateContext).pending === true ? (
		<Field.Pending {...props} />
	) : null;

/**
 * The chevron after the trigger's value. Its children are the icon; without
 * them it renders nothing.
 *
 * @example
 * <Select.Icon><ExpandMoreIcon /></Select.Icon>
 */
const SelectIcon = ({
	className,
	children,
	...props
}: BaseSelect.Icon.Props): ReactNode =>
	children === undefined ||
	children === null ||
	children === false ? null : (
		<BaseSelect.Icon
			className={clsx(style.icon, className)}
			{...props}>
			{children}
		</BaseSelect.Icon>
	);

/**
 * The button that opens the list, projecting the root's state onto itself and
 * holding what it is given: usually `Value`, `Pending` and `Icon`.
 *
 * @example
 * <Select.Trigger>
 * 	<Select.Value placeholder="Pick a status" />
 * 	<Select.Pending><Spinner size={1} /></Select.Pending>
 * 	<Select.Icon><ExpandMoreIcon /></Select.Icon>
 * </Select.Trigger>
 */
const SelectTrigger = ({
	state: ownState,
	className,
	children,
	onFocus,
	onBlur,
	...props
}: SelectTriggerProps): ReactNode => {
	const root = useInputPartsContext();
	const { triggerFocused, triggerBlurred } =
		useSelectContext();
	const state = { ...root.state, ...ownState };
	const focus = useFieldFocus<TriggerFocusEvent>({
		onFocus: event => {
			onFocus?.(event);
			triggerFocused();
		},
		onBlur: event => {
			onBlur?.(event);
			triggerBlurred();
		},
	});
	return (
		<BaseSelect.Trigger
			aria-invalid={
				state.validity === "invalid" || undefined
			}
			className={clsx(style.trigger, className)}
			{...fieldStateAttributes(
				withFieldFocus(state, focus),
			)}
			{...props}
			{...focus.props}>
			<TriggerStateContext value={state}>
				{children}
			</TriggerStateContext>
		</BaseSelect.Trigger>
	);
};

/** Places the popup against the trigger. */
const SelectPositioner = ({
	className,
	sideOffset = 4,
	alignItemWithTrigger = false,
	...props
}: BaseSelect.Positioner.Props): ReactNode => (
	<BaseSelect.Positioner
		{...usePopupEdgePadding()}
		className={clsx(style.positioner, className)}
		sideOffset={sideOffset}
		alignItemWithTrigger={alignItemWithTrigger}
		{...props}
	/>
);

/** The shared popup surface the list sits on. */
const SelectPopup = ({
	className,
	...props
}: BaseSelect.Popup.Props): ReactNode => (
	<BaseSelect.Popup
		className={clsx(style.popup, className)}
		{...props}
	/>
);

export type SelectItemProps = BaseSelect.Item.Props;

/** One option's row, holding its `ItemText` and `ItemIndicator`. */
const SelectItem = ({
	className,
	...props
}: SelectItemProps): ReactNode => (
	<BaseSelect.Item
		className={clsx(style.item, className)}
		{...props}
	/>
);

/** An option's text, which the trigger shows once it is chosen. */
const SelectItemText = ({
	className,
	...props
}: BaseSelect.ItemText.Props): ReactNode => (
	<BaseSelect.ItemText
		className={clsx(style.itemText, className)}
		{...props}
	/>
);

/** The mark beside the chosen option. Its children are the mark, such as a tick. */
const SelectItemIndicator = ({
	className,
	...props
}: BaseSelect.ItemIndicator.Props): ReactNode => (
	<BaseSelect.ItemIndicator
		className={clsx(style.indicator, className)}
		{...props}
	/>
);

/**
 * Every option of the enclosing `Select.Root`, in the order it was given them.
 * Compose the parts directly instead where a row is more than its label.
 */
const SelectItems = (): ReactNode => {
	const { options } = useSelectContext();
	const icons = useIcons();
	return options.map(option => (
		<SelectItem key={option.value} value={option.value}>
			<SelectItemText>
				{option.label}
				{option.detail !== undefined && (
					<span className={style.itemDetail}>
						{option.detail}
					</span>
				)}
			</SelectItemText>
			<SelectItemIndicator>
				{icons.check}
			</SelectItemIndicator>
		</SelectItem>
	));
};

type SelectStatusProps = Readonly<{
	load: OptionsLoad;
	onRetry: (retry: () => void) => void;
}>;

const SelectStatus = ({
	load,
	onRetry,
}: SelectStatusProps): ReactNode => {
	const { options } = useSelectContext();
	const copy = useCopy();
	const retry =
		load.status === "error" ? load.retry : undefined;
	return (
		<div className={style.statusArea}>
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className={style.status}>
				{load.status === "pending" && <Spinner size={1} />}
				{optionsLoadMessage(load, copy.options) ??
					(options.length === 0
						? copy.options.empty
						: undefined)}
			</div>
			{retry !== undefined && (
				<Button
					variant="tertiary"
					size="sm"
					onClick={() => {
						onRetry(retry);
					}}>
					{copy.retry}
				</Button>
			)}
		</div>
	);
};

export type SelectControlProps = Omit<
	SelectTriggerProps,
	"children"
> &
	Readonly<{
		/** Shown while nothing is selected. */
		placeholder?: string;
		/** How far the options have loaded, when they come from a query. */
		load?: OptionsLoad;
	}>;

/**
 * The trigger over the portalled list of every option: the shape almost every
 * select takes. Reach for the parts where the list needs anything else.
 */
const SelectControl = ({
	placeholder,
	load = OPTIONS_LOADED,
	state,
	...props
}: SelectControlProps): ReactNode => {
	const icons = useIcons();
	const popupRef = useRef<HTMLDivElement>(null);
	return (
		<>
			<SelectTrigger
				state={
					load.status === "pending"
						? { ...state, pending: true }
						: state
				}
				{...props}>
				<SelectValue placeholder={placeholder} />
				<SelectPending>
					<Spinner size={1} />
				</SelectPending>
				<SelectIcon>{icons.expand}</SelectIcon>
			</SelectTrigger>
			<BaseSelect.Portal>
				<SelectPositioner>
					<SelectPopup ref={popupRef}>
						<SelectStatus
							load={load}
							onRetry={retry => {
								retry();
								popupRef.current?.focus();
							}}
						/>
						<BaseSelect.List>
							<SelectItems />
						</BaseSelect.List>
					</SelectPopup>
				</SelectPositioner>
			</BaseSelect.Portal>
		</>
	);
};

/** The parts of a select. */
export type SelectParts = Readonly<{
	Root: typeof SelectRoot;
	Label: typeof SelectLabel;
	Trigger: typeof SelectTrigger;
	Value: typeof SelectValue;
	Icon: typeof SelectIcon;
	Portal: typeof BaseSelect.Portal;
	Positioner: typeof SelectPositioner;
	Popup: typeof SelectPopup;
	List: typeof BaseSelect.List;
	Item: typeof SelectItem;
	ItemText: typeof SelectItemText;
	ItemIndicator: typeof SelectItemIndicator;
	Items: typeof SelectItems;
	Group: typeof BaseSelect.Group;
	GroupLabel: typeof BaseSelect.GroupLabel;
	Separator: typeof BaseSelect.Separator;
	Control: typeof SelectControl;
	Pending: typeof SelectPending;
	Description: typeof Field.Description;
	Error: typeof InputError;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a base-ui Select: the field frame, a trigger wearing the
 * same treatment as every text input, and the shared popup surface. `Root`
 * holds the options and the field's states, so no part below it takes either
 * again, and `Error` renders the errors `Root` was given. For the ordinary case,
 * use the `SelectField` prefab, which is assembled from exactly these parts; a
 * control in a toolbar composes them directly.
 *
 * @example
 * <Select.Root options={options} value={value} onValueChange={setValue} errors={errors} requiredness="required">
 * 	<Select.Label>Status <Field.Requiredness /></Select.Label>
 * 	<Select.Control placeholder="Pick a status" />
 * 	<Select.Description>The status the invoice is in now.</Select.Description>
 * 	<Select.Error />
 * </Select.Root>
 */
export const Select: SelectParts = {
	Root: SelectRoot,
	Label: SelectLabel,
	Trigger: SelectTrigger,
	Value: SelectValue,
	Icon: SelectIcon,
	Portal: BaseSelect.Portal,
	Positioner: SelectPositioner,
	Popup: SelectPopup,
	List: BaseSelect.List,
	Item: SelectItem,
	ItemText: SelectItemText,
	ItemIndicator: SelectItemIndicator,
	Items: SelectItems,
	Group: BaseSelect.Group,
	GroupLabel: BaseSelect.GroupLabel,
	Separator: BaseSelect.Separator,
	Control: SelectControl,
	Pending: SelectPending,
	Description: Field.Description,
	Error: InputError,
	useIds: Field.useIds,
};
