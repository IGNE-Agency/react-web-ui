import { Select as BaseSelect } from "@base-ui/react/select";
import { clsx } from "clsx";
import { type ReactNode, useRef } from "react";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import { Button } from "../button/index.ts";
import {
	Field,
	type FieldState,
	fieldStateAttributes,
	type OptionsLoad,
	type OptionsLoadLabels,
	useFieldFocus,
} from "../field/index.ts";
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
	BaseSelect.Root.Props<T>,
	"items" | "onValueChange"
> &
	Readonly<{
		/** The selectable options; `label` is what the trigger and list display. */
		options: readonly SelectOption<T>[];
		onValueChange?: (value: T) => void;
	}>;

/** The select's state, holding the options every part below it reads. */
const SelectRoot = <T extends string>({
	options,
	onValueChange,
	...props
}: SelectRootProps<T>): ReactNode => (
	<SelectContext value={{ options }}>
		<BaseSelect.Root<T>
			items={options}
			onValueChange={next => {
				if (next !== null) {
					onValueChange?.(next);
				}
			}}
			{...props}
		/>
	</SelectContext>
);

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
		/** Shown while nothing is selected. */
		placeholder?: string;
		/** The states projected onto the trigger as `data-*` attributes. */
		state?: FieldState;
		/** The chevron after the value, such as an expand icon. */
		icon?: ReactNode;
	}>;

const NO_STATE: FieldState = {};

/** The chevron after the trigger's value. Its children are the icon; without them it renders nothing. */
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

/** The button that opens the list. Without children it shows the value, the pending mark and `icon`. */
const SelectTrigger = ({
	placeholder,
	state = NO_STATE,
	icon,
	className,
	children,
	...props
}: SelectTriggerProps): ReactNode => {
	const focus = useFieldFocus(props);
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
			{children ?? (
				<>
					<BaseSelect.Value
						className={style.value}
						placeholder={placeholder}
					/>
					{state.pending === true && <Field.Pending />}
					<SelectIcon>{icon}</SelectIcon>
				</>
			)}
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

export type SelectItemsProps = Readonly<{
	/** The mark beside the chosen option, such as a tick. */
	checkIcon: ReactNode;
}>;

/**
 * Every option of the enclosing `Select.Root`, in the order it was given them.
 * Compose the parts directly instead where a row is more than its label.
 */
const SelectItems = ({
	checkIcon,
}: SelectItemsProps): ReactNode => {
	const { options } = useSelectContext();
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
			<SelectItemIndicator>{checkIcon}</SelectItemIndicator>
		</SelectItem>
	));
};

type SelectStatusProps = OptionsLoadLabels &
	Readonly<{
		load: OptionsLoad;
		onRetry: (retry: () => void) => void;
	}>;

const SelectStatus = ({
	load,
	onRetry,
	...labels
}: SelectStatusProps): ReactNode => {
	const { options } = useSelectContext();
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
				{optionsLoadMessage(load, labels) ??
					(options.length === 0
						? labels.noOptionsLabel
						: undefined)}
			</div>
			{retry !== undefined && (
				<Button
					variant="tertiary"
					size="sm"
					onClick={() => {
						onRetry(retry);
					}}>
					{labels.retryLabel}
				</Button>
			)}
		</div>
	);
};

export type SelectControlProps = Omit<
	SelectTriggerProps,
	"children"
> &
	OptionsLoadLabels &
	SelectItemsProps &
	Readonly<{
		/** How far the options have loaded, when they come from a query. */
		load?: OptionsLoad;
	}>;

/**
 * The trigger over the portalled list of every option: the shape almost every
 * select takes. Reach for the parts where the list needs anything else.
 */
const SelectControl = ({
	load = OPTIONS_LOADED,
	loadingLabel,
	loadFailedLabel,
	loadBrokenLabel,
	retryLabel,
	noOptionsLabel,
	checkIcon,
	...props
}: SelectControlProps): ReactNode => {
	const popupRef = useRef<HTMLDivElement>(null);
	return (
		<>
			<SelectTrigger {...props} />
			<BaseSelect.Portal>
				<SelectPositioner>
					<SelectPopup ref={popupRef}>
						<SelectStatus
							load={load}
							loadingLabel={loadingLabel}
							loadFailedLabel={loadFailedLabel}
							loadBrokenLabel={loadBrokenLabel}
							retryLabel={retryLabel}
							noOptionsLabel={noOptionsLabel}
							onRetry={retry => {
								retry();
								popupRef.current?.focus();
							}}
						/>
						<BaseSelect.List>
							<SelectItems checkIcon={checkIcon} />
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
	Value: typeof BaseSelect.Value;
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
	Pending: typeof Field.Pending;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
	useIds: typeof Field.useIds;
}>;

/**
 * The styled parts of a base-ui Select: a trigger wearing the same treatment as
 * every text input, over the shared popup surface. `Root` holds the options, so
 * no part below it takes the list again. For a labelled field, use
 * `SelectField`; a control in a toolbar composes these directly.
 *
 * @example
 * <Select.Root options={options} value={value} onValueChange={setValue}>
 * 	<Select.Label>Status</Select.Label>
 * 	<Select.Control
 * 		icon={<ExpandMoreIcon />}
 * 		checkIcon={<CheckIcon />}
 * 		loadingLabel="Loading options…"
 * 		loadFailedLabel="Options could not be loaded."
 * 		loadBrokenLabel="Options could not be loaded, and trying again won't help."
 * 		retryLabel="Try again"
 * 		noOptionsLabel="No options available."
 * 	/>
 * </Select.Root>
 */
export const Select: SelectParts = {
	Root: SelectRoot,
	Label: SelectLabel,
	Trigger: SelectTrigger,
	Value: BaseSelect.Value,
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
	Pending: Field.Pending,
	Description: Field.Description,
	Error: Field.Error,
	useIds: Field.useIds,
};
