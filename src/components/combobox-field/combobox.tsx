import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type Context,
	createContext,
	type ReactNode,
	type Ref,
	useContext,
	useRef,
} from "react";
import {
	type ButtonProps as AriaButtonProps,
	Button as RemoveButton,
	Tag,
	TagGroup,
	TagList,
	type TagProps,
} from "react-aria-components";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import { useInfiniteScroll } from "../../lib/use-infinite-scroll.ts";
import { Button } from "../button/index.ts";
import {
	type KitCopy,
	useCopy,
} from "../copy-provider/index.ts";
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
	InputLabel,
	InputPartsContext,
	useInputPartsContext,
} from "../field/input-parts.tsx";
import { optionsLoadMessage } from "../field/options-load.ts";
import { withFieldFocus } from "../field/use-field-focus.ts";
import { useIcons } from "../icon-provider/index.ts";
import { Spinner } from "../spinner/index.ts";
import {
	type PagedQuery,
	pagedProgress,
} from "./combobox-items.ts";
import style from "./combobox.module.scss";

export type ComboboxRootProps<
	TItem,
	TMultiple extends boolean | undefined = false,
> = Omit<FieldProps, "label" | "description"> &
	Omit<
		BaseCombobox.Root.Props<TItem, TMultiple>,
		| "autoHighlight"
		| "disabled"
		| "readOnly"
		| "required"
		| "inputRef"
		| "children"
	> &
	Readonly<{
		/** `"always"` highlights the first item whenever the list changes. @default "always" */
		autoHighlight?: boolean | "always";
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Keeps the value and the popup closed. */
		readOnly?: boolean;
		/** States no prop here owns, projected over the ones that do. */
		state?: FieldState;
		/** Called when focus leaves the control. */
		onBlur?: FieldBlurHandler;
		/** Applied to the field frame, so callers can size the control. */
		className?: string;
		/** The field's parts. */
		children?: ReactNode;
	}>;

const RootBlurContext: Context<
	FieldBlurHandler | undefined
> = createContext<FieldBlurHandler | undefined>(undefined);

const holdsValue = (value: unknown): boolean =>
	Array.isArray(value)
		? value.length > 0
		: value !== null && value !== undefined;

/**
 * The field frame around a combobox, holding its items and value and
 * projecting its state onto every part.
 *
 * @example
 * <Combobox.Root items={statuses} value={status} onValueChange={setStatus}>…</Combobox.Root>
 */
const ComboboxRoot = <
	TItem,
	TMultiple extends boolean | undefined = false,
>({
	autoHighlight = "always",
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
	open,
	className,
	children,
	...props
}: ComboboxRootProps<TItem, TMultiple>): ReactNode => {
	const ids = Field.useIds();
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled: holdsValue(props.value),
		state,
	});

	return (
		<InputPartsContext
			value={{
				state: field.state,
				errors,
				phase: field.phase,
			}}>
			<RootBlurContext value={onBlur}>
				<Field.Root
					disabled={field.disabled}
					invalid={field.invalid}
					requiredness={field.state.requiredness}
					dirty={dirty}
					touched={touched}
					className={className}
					{...fieldStateAttributes(field.state)}>
					<BaseCombobox.Root<TItem, TMultiple>
						// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion -- base-ui's Root types `autoHighlight` as boolean, but forwards it unchanged to the AriaCombobox beneath, which accepts "always".
						autoHighlight={autoHighlight as boolean}
						name={name ?? ids.controlId}
						inputRef={detachHiddenInput}
						disabled={field.disabled}
						readOnly={readOnly}
						required={requiredness === "required"}
						open={readOnly === true ? false : open}
						{...props}>
						{children}
					</BaseCombobox.Root>
				</Field.Root>
			</RootBlurContext>
		</InputPartsContext>
	);
};

export type ComboboxControlProps =
	BaseCombobox.InputGroup.Props &
		Readonly<{
			/** The control element, which the positioner takes as its `anchor`. */
			ref?: Ref<HTMLDivElement>;
			/** States the root does not own, projected over its own onto the control. */
			state?: FieldState;
		}>;

const ControlStateContext: Context<FieldState> =
	createContext<FieldState>({});

const ControlBusyContext: Context<boolean | undefined> =
	createContext<boolean | undefined>(undefined);

const CONTROL_SELECTOR = "[data-combobox-control]";
const TAG_SELECTOR = "[data-combobox-tag]";
const TRIGGER_SELECTOR = "[data-combobox-trigger]";

const tagsOf = (
	control: Element | null,
): readonly HTMLElement[] =>
	control === null
		? []
		: [
				...control.querySelectorAll<HTMLElement>(
					TAG_SELECTOR,
				),
			];

const focusTagAt = (
	control: Element | null,
	edge: "first" | "last",
): boolean => {
	const tags = tagsOf(control);
	const tag = edge === "first" ? tags.at(0) : tags.at(-1);
	tag?.focus();
	return tag !== undefined;
};

const focusTrigger = (
	control: Element | null | undefined,
): void => {
	control
		?.querySelector<HTMLElement>(TRIGGER_SELECTOR)
		?.focus();
};

/**
 * The chevron at the end of the trigger. Its children are the icon; without
 * them it renders nothing.
 *
 * @example
 * <Combobox.Icon><ExpandMoreIcon /></Combobox.Icon>
 */
const ComboboxIcon = ({
	className,
	children,
	...props
}: BaseCombobox.Icon.Props): ReactNode =>
	children === undefined ||
	children === null ||
	children === false ? null : (
		<BaseCombobox.Icon
			className={clsx(style.icon, className)}
			{...props}>
			{children}
		</BaseCombobox.Icon>
	);

/**
 * The control's box, projecting the root's state onto itself and holding the
 * `Chips` and the `Trigger`. The positioner takes it as its `anchor`.
 *
 * @example
 * <Combobox.Control ref={anchorRef}>
 * 	<Combobox.Trigger>…</Combobox.Trigger>
 * </Combobox.Control>
 */
const ComboboxControl = ({
	className,
	children,
	state: ownState,
	onFocus,
	onBlur,
	...props
}: ComboboxControlProps): ReactNode => {
	const root = useInputPartsContext();
	const rootBlur = useContext(RootBlurContext);
	const state = { ...root.state, ...ownState };
	const focus = useFieldFocus({
		onFocus,
		onBlur: event => {
			onBlur?.(event);
			rootBlur?.();
		},
	});
	const { "aria-busy": busy, ...attributes } =
		fieldStateAttributes(withFieldFocus(state, focus));
	return (
		<BaseCombobox.InputGroup
			data-combobox-control=""
			aria-disabled={state.disabled === true || undefined}
			className={clsx(style.control, className)}
			{...attributes}
			{...props}
			{...focus.props}>
			<ControlStateContext value={state}>
				<ControlBusyContext value={busy}>
					{children}
				</ControlBusyContext>
			</ControlStateContext>
		</BaseCombobox.InputGroup>
	);
};

export type ComboboxTriggerProps =
	BaseCombobox.Trigger.Props;

/**
 * The button that opens the popup, holding the value, `Pending` and `Icon`.
 * The arrow keys move between it and the `Chips` beside it.
 *
 * @example
 * <Combobox.Trigger>
 * 	<Combobox.TriggerValue>{label}</Combobox.TriggerValue>
 * 	<Combobox.Icon><ExpandMoreIcon /></Combobox.Icon>
 * </Combobox.Trigger>
 */
const ComboboxTrigger = ({
	className,
	onKeyDown,
	...props
}: ComboboxTriggerProps): ReactNode => {
	const state = useContext(ControlStateContext);
	const busy = useContext(ControlBusyContext);
	return (
		<BaseCombobox.Trigger
			data-combobox-trigger=""
			aria-invalid={
				state.validity === "invalid" || undefined
			}
			aria-busy={busy}
			className={clsx(style.trigger, className)}
			onKeyDown={event => {
				onKeyDown?.(event);
				const control = event.currentTarget.parentElement;
				if (
					event.key === "ArrowRight" &&
					focusTagAt(control, "first")
				) {
					event.preventDefault();
				}
				if (
					event.key === "ArrowLeft" &&
					focusTagAt(control, "last")
				) {
					event.preventDefault();
				}
			}}
			{...props}
		/>
	);
};

/**
 * The value the trigger shows, such as the chosen item or the placeholder.
 *
 * @example
 * <Combobox.TriggerValue>{label ?? placeholder}</Combobox.TriggerValue>
 */
const ComboboxTriggerValue = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.content, className)}
		{...props}
	/>
);

/**
 * The value the trigger is read as while `Chips` show the selection, such as
 * every chosen item joined. Only assistive tech reads it.
 *
 * @example
 * <Combobox.SpokenValue>{names.join(", ")}</Combobox.SpokenValue>
 */
const ComboboxSpokenValue = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.spokenValue, className)}
		{...props}
	/>
);

/**
 * What the trigger shows while the field is pending, such as a spinner.
 * Renders nothing otherwise.
 *
 * @example
 * <Combobox.Pending><Spinner size={1} /></Combobox.Pending>
 */
const ComboboxPending = (
	props: FieldPendingProps,
): ReactNode =>
	useContext(ControlStateContext).pending === true ? (
		<Field.Pending {...props} />
	) : null;

/**
 * The area beside the trigger that shows the selection of a multiple
 * combobox: a `ChipList`, or a placeholder while nothing is chosen. The arrow
 * keys move from its first and last chip back to the trigger.
 *
 * @example
 * <Combobox.Chips>
 * 	<Combobox.ChipList …>…</Combobox.ChipList>
 * </Combobox.Chips>
 */
const ComboboxChips = ({
	className,
	onKeyDownCapture,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(style.content, className)}
		onKeyDownCapture={event => {
			onKeyDownCapture?.(event);
			const edges = tagsOf(event.currentTarget);
			if (
				(event.key === "ArrowRight" &&
					edges.at(-1) === event.target) ||
				(event.key === "ArrowLeft" &&
					edges.at(0) === event.target)
			) {
				event.preventDefault();
				event.stopPropagation();
				focusTrigger(event.currentTarget.parentElement);
			}
		}}
		{...props}
	/>
);

const ChipsLockedContext: Context<boolean> =
	createContext(false);

export type ComboboxChipListProps<TItem> = Readonly<{
	/** Names the group of chips, such as "Selected statuses". */
	label: string;
	items: readonly TItem[];
	/** A stable identity per item, which its `Chip` takes as its `id`. */
	itemKey: (item: TItem) => string;
	/** Renders one item's `Chip`. */
	children: (item: TItem) => ReactNode;
	/** Called with the items left after a removal. */
	onRemove: (remaining: readonly TItem[]) => void;
	/** Left out, it follows the control's state. */
	disabled?: boolean;
	/** Left out, it follows the control's state. */
	readOnly?: boolean;
	className?: string;
}>;

/**
 * The chosen values of a multiple combobox as a grid of removable chips, over
 * react-aria's `TagGroup`. Removing the last one returns focus to the trigger.
 *
 * @example
 * <Combobox.ChipList label="Selected statuses" items={chosen} itemKey={status => status} onRemove={setChosen}>
 * 	{status => <Combobox.Chip key={status} id={status} textValue={status}>{status}</Combobox.Chip>}
 * </Combobox.ChipList>
 */
const ComboboxChipList = <TItem,>({
	label,
	items,
	itemKey,
	children,
	onRemove,
	disabled,
	readOnly,
	className,
}: ComboboxChipListProps<TItem>): ReactNode => {
	const ref = useRef<HTMLDivElement>(null);
	const control = useContext(ControlStateContext);
	const isDisabled = disabled ?? control.disabled === true;
	const locked =
		isDisabled || (readOnly ?? control.readonly === true);
	return (
		<TagGroup
			ref={ref}
			aria-label={label}
			className={style.tags}
			disabledKeys={isDisabled ? items.map(itemKey) : []}
			onRemove={
				locked
					? undefined
					: keys => {
							const remaining = items.filter(
								item => !keys.has(itemKey(item)),
							);
							if (remaining.length === 0) {
								focusTrigger(
									ref.current?.closest(CONTROL_SELECTOR),
								);
							}
							onRemove(remaining);
						}
			}>
			<TagList className={clsx(style.tagList, className)}>
				<ChipsLockedContext value={locked}>
					{items.map(children)}
				</ChipsLockedContext>
			</TagList>
		</TagGroup>
	);
};

export type ComboboxChipProps = Omit<
	TagProps,
	"className" | "id" | "textValue"
> &
	Readonly<{
		/** The item's key, as `ChipList`'s `itemKey` gives it. */
		id: string;
		/** The item as plain text, which the chip is read as. */
		textValue: string;
		className?: string;
	}>;

/**
 * One chosen value as a chip, holding its content and a `ChipRemove`.
 *
 * @example
 * <Combobox.Chip id={status} textValue={status}>{status}</Combobox.Chip>
 */
const ComboboxChip = ({
	className,
	...props
}: ComboboxChipProps): ReactNode => (
	<Tag
		data-combobox-tag=""
		data-tone="neutral"
		data-variant="subtle"
		className={clsx(style.tag, className)}
		{...props}
	/>
);

export type ComboboxChipRemoveProps = Omit<
	AriaButtonProps,
	"className" | "slot" | "aria-label"
> &
	Readonly<{
		className?: string;
	}>;

/**
 * The pointer-only button that removes its chip; the keyboard removes with
 * Delete. Its children are the icon, such as a cross.
 *
 * @example
 * <Tooltip content="Remove Open">
 * 	<Combobox.ChipRemove><CloseIcon /></Combobox.ChipRemove>
 * </Tooltip>
 */
const ComboboxChipRemove = ({
	className,
	...props
}: ComboboxChipRemoveProps): ReactNode => {
	const copy = useCopy();
	return (
		<RemoveButton
			slot="remove"
			excludeFromTabOrder
			isDisabled={useContext(ChipsLockedContext)}
			aria-label={copy.remove}
			className={clsx(style.tagRemove, className)}
			{...props}
		/>
	);
};

/** Places the popup against the control, given as its `anchor`. */
const ComboboxPositioner = ({
	className,
	sideOffset = 4,
	...props
}: BaseCombobox.Positioner.Props): ReactNode => (
	<BaseCombobox.Positioner
		{...usePopupEdgePadding()}
		className={clsx(style.positioner, className)}
		sideOffset={sideOffset}
		{...props}
	/>
);

/** The shared popup surface. */
const ComboboxPopup = ({
	className,
	...props
}: BaseCombobox.Popup.Props): ReactNode => (
	<BaseCombobox.Popup
		className={clsx(style.popup, className)}
		{...props}
	/>
);

export type ComboboxSearchProps = Omit<
	BaseCombobox.Input.Props,
	"aria-label" | "aria-labelledby"
>;

/**
 * The search box inside the popup. It names itself, clearing the field label
 * base-ui hands every labelable control under a field, which names the
 * field's own control.
 */
const ComboboxSearch = ({
	className,
	...props
}: ComboboxSearchProps): ReactNode => {
	const { options } = useCopy();
	return (
		<BaseCombobox.Input
			aria-labelledby={undefined}
			aria-label={options.search}
			className={clsx(style.search, className)}
			{...props}
		/>
	);
};

export type ComboboxListProps = Omit<
	BaseCombobox.List.Props,
	"ref"
> &
	Readonly<{
		/** A paged query, whose next page loads as the list nears its end. */
		query?: Pick<
			PagedQuery<unknown>,
			"hasNextPage" | "isFetchingNextPage" | "fetchNextPage"
		>;
	}>;

/** The scrolling list of options, which loads a paged `query`'s next page as it nears its end. */
const ComboboxList = ({
	className,
	query,
	...props
}: ComboboxListProps): ReactNode => {
	const ref = useRef<HTMLDivElement>(null);

	useInfiniteScroll({
		ref,
		enabled:
			query !== undefined &&
			query.hasNextPage &&
			!query.isFetchingNextPage,
		onLoadMore: () => {
			void query?.fetchNextPage();
		},
	});

	return (
		<BaseCombobox.List
			ref={ref}
			className={clsx(style.list, className)}
			{...props}
		/>
	);
};

export type ComboboxOptionProps = BaseCombobox.Item.Props;

/** One option's row, holding its `OptionIndicator` and `OptionText`. */
const ComboboxOption = ({
	className,
	...props
}: ComboboxOptionProps): ReactNode => (
	<BaseCombobox.Item
		className={clsx(style.option, className)}
		{...props}
	/>
);

const InCheckboxContext: Context<boolean> =
	createContext(false);

export type ComboboxOptionIndicatorProps =
	BaseCombobox.ItemIndicator.Props;

/**
 * The mark beside a chosen option. Its children are the mark, such as a tick.
 * Inside an `OptionCheckbox` it is the checkbox's tick, kept mounted.
 *
 * @example
 * <Combobox.OptionIndicator><CheckIcon /></Combobox.OptionIndicator>
 */
const ComboboxOptionIndicator = ({
	className,
	...props
}: ComboboxOptionIndicatorProps): ReactNode =>
	useContext(InCheckboxContext) ? (
		<BaseCombobox.ItemIndicator
			keepMounted
			className={clsx(style.checkboxIndicator, className)}
			{...props}
		/>
	) : (
		<BaseCombobox.ItemIndicator
			className={clsx(style.indicator, className)}
			{...props}
		/>
	);

/**
 * The box an option's `OptionIndicator` sits in, for a multi-value list.
 *
 * @example
 * <Combobox.OptionCheckbox>
 * 	<Combobox.OptionIndicator><CheckIcon /></Combobox.OptionIndicator>
 * </Combobox.OptionCheckbox>
 */
const ComboboxOptionCheckbox = ({
	className,
	children,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		aria-hidden="true"
		className={clsx(style.checkbox, className)}
		{...props}>
		<InCheckboxContext value>{children}</InCheckboxContext>
	</span>
);

/** An option's content, beside its indicator. */
const ComboboxOptionText = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.optionText, className)}
		{...props}
	/>
);

/** What the popup says when no option is listed. */
const ComboboxEmpty = ({
	className,
	...props
}: BaseCombobox.Empty.Props): ReactNode => (
	<BaseCombobox.Empty
		className={clsx(style.empty, className)}
		{...props}
	/>
);

/** The popup's polite status line. */
const ComboboxStatus = ({
	className,
	...props
}: BaseCombobox.Status.Props): ReactNode => (
	<BaseCombobox.Status
		className={clsx(style.status, className)}
		{...props}
	/>
);

/** The row that holds the status and a retry button. */
const ComboboxStatusArea = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(style.statusArea, className)}
		{...props}
	/>
);

export type ComboboxLoadStatusProps = Readonly<{
	/** How far the items have loaded. */
	load: OptionsLoad;
	/** A paged query, whose match count and next page it reports. */
	query?: Pick<
		PagedQuery<unknown>,
		"data" | "isFetchingNextPage"
	>;
	/** Runs a retry, such as to move focus back afterwards. @default retry() */
	onRetry?: (retry: () => void) => void;
	className?: string;
}>;

const loadMessage = (
	copy: KitCopy["options"],
	load: OptionsLoad,
	query: ComboboxLoadStatusProps["query"],
): string | undefined => {
	if (load.status !== "success") {
		return optionsLoadMessage(load, copy);
	}
	const paged = pagedProgress(query);
	if (paged === undefined) {
		return undefined;
	}
	if (paged.isFetchingNextPage) {
		return copy.loadingMore;
	}
	return paged.totalCount === undefined
		? undefined
		: copy.results(paged.totalCount);
};

const runRetry = (retry: () => void): void => {
	retry();
};

/** The load status of the items, with a retry button where trying again can help. */
const ComboboxLoadStatus = ({
	load,
	query,
	onRetry = runRetry,
	className,
}: ComboboxLoadStatusProps): ReactNode => {
	const copy = useCopy();
	const retry =
		load.status === "error" ? load.retry : undefined;
	return (
		<ComboboxStatusArea className={className}>
			<ComboboxStatus>
				{(load.status === "pending" ||
					query?.isFetchingNextPage === true) && (
					<Spinner size={1} />
				)}
				{loadMessage(copy.options, load, query)}
			</ComboboxStatus>
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
		</ComboboxStatusArea>
	);
};

export type ComboboxBodyProps<TItem> = Readonly<{
	/** How far the items have loaded. */
	load: OptionsLoad;
	/** A paged query, searched on the server and loaded page by page. */
	query?: PagedQuery<TItem>;
	/** There are no items at all, rather than none matching the search. */
	noOptions: boolean;
	/** Draws each option's mark inside an `OptionCheckbox`. */
	multiple?: boolean;
	/** A stable identity per item. */
	itemKey: (item: TItem) => string;
	/** Renders one item's row. */
	children: (item: TItem) => ReactNode;
}>;

/**
 * What a combobox's popup holds: the search box, the load status with a retry
 * where one can help, the empty state and the list, which loads the next page
 * of a paged query as it nears its end.
 */
const ComboboxBody = <TItem,>({
	load,
	query,
	noOptions,
	multiple = false,
	itemKey,
	children,
}: ComboboxBodyProps<TItem>): ReactNode => {
	const { options } = useCopy();
	const { check } = useIcons();
	const searchRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<ComboboxSearch ref={searchRef} />
			<ComboboxLoadStatus
				load={load}
				query={query}
				onRetry={retry => {
					retry();
					searchRef.current?.focus();
				}}
			/>
			<ComboboxEmpty>
				{load.status === "success"
					? noOptions
						? options.empty
						: options.noResults
					: null}
			</ComboboxEmpty>
			<ComboboxList query={query}>
				{(item: TItem) => (
					<ComboboxOption key={itemKey(item)} value={item}>
						{multiple ? (
							<ComboboxOptionCheckbox>
								<ComboboxOptionIndicator>
									{check}
								</ComboboxOptionIndicator>
							</ComboboxOptionCheckbox>
						) : (
							<ComboboxOptionIndicator>
								{check}
							</ComboboxOptionIndicator>
						)}
						<ComboboxOptionText>
							{children(item)}
						</ComboboxOptionText>
					</ComboboxOption>
				)}
			</ComboboxList>
		</>
	);
};

/** The parts of a combobox. */
export type ComboboxParts = Omit<
	typeof BaseCombobox,
	| "Root"
	| "Label"
	| "Icon"
	| "Trigger"
	| "Chips"
	| "Chip"
	| "ChipRemove"
	| "Positioner"
	| "Popup"
	| "Input"
	| "List"
	| "Empty"
	| "Status"
> &
	Readonly<{
		Root: typeof ComboboxRoot;
		Label: typeof InputLabel;
		Control: typeof ComboboxControl;
		Trigger: typeof ComboboxTrigger;
		TriggerValue: typeof ComboboxTriggerValue;
		SpokenValue: typeof ComboboxSpokenValue;
		Icon: typeof ComboboxIcon;
		Chips: typeof ComboboxChips;
		ChipList: typeof ComboboxChipList;
		Chip: typeof ComboboxChip;
		ChipRemove: typeof ComboboxChipRemove;
		Positioner: typeof ComboboxPositioner;
		Popup: typeof ComboboxPopup;
		Search: typeof ComboboxSearch;
		List: typeof ComboboxList;
		Option: typeof ComboboxOption;
		OptionIndicator: typeof ComboboxOptionIndicator;
		OptionCheckbox: typeof ComboboxOptionCheckbox;
		OptionText: typeof ComboboxOptionText;
		Empty: typeof ComboboxEmpty;
		Status: typeof ComboboxStatus;
		StatusArea: typeof ComboboxStatusArea;
		LoadStatus: typeof ComboboxLoadStatus;
		Body: typeof ComboboxBody;
		Pending: typeof ComboboxPending;
		Description: typeof Field.Description;
		Error: typeof InputError;
	}>;

/**
 * The styled parts of a base-ui Combobox: the field frame, a filterable select
 * whose control matches `Select`'s trigger, and the shared popup surface. Every
 * unstyled base-ui part stays reachable. `Root` holds the field's states, so no
 * part below it takes them again, and `Error` renders the errors `Root` was
 * given. A multiple combobox shows its selection as `Chips` beside the
 * `Trigger`. `Body` holds what the popup usually does. For the ordinary case,
 * use the `ComboboxField` prefab, which is assembled from exactly these parts.
 * The positioner takes the control as its `anchor`.
 *
 * @example
 * <Combobox.Root items={statuses} value={status} onValueChange={setStatus} errors={errors} requiredness="required">
 * 	<Combobox.Label>Status <Field.Requiredness /></Combobox.Label>
 * 	<Combobox.Control ref={anchorRef}>
 * 		<Combobox.Trigger>
 * 			<Combobox.TriggerValue>
 * 				<Combobox.Value>{(status: string | null) => status}</Combobox.Value>
 * 			</Combobox.TriggerValue>
 * 			<Combobox.Icon><ExpandMoreIcon /></Combobox.Icon>
 * 		</Combobox.Trigger>
 * 	</Combobox.Control>
 * 	<Combobox.Portal>
 * 		<Combobox.Positioner anchor={anchorRef}>
 * 			<Combobox.Popup>
 * 				<Combobox.Search />
 * 				<Combobox.List>
 * 					{(status: string) => (
 * 						<Combobox.Option key={status} value={status}>
 * 							<Combobox.OptionIndicator><CheckIcon /></Combobox.OptionIndicator>
 * 							<Combobox.OptionText>{status}</Combobox.OptionText>
 * 						</Combobox.Option>
 * 					)}
 * 				</Combobox.List>
 * 			</Combobox.Popup>
 * 		</Combobox.Positioner>
 * 	</Combobox.Portal>
 * 	<Combobox.Description>The status the invoice is in now.</Combobox.Description>
 * 	<Combobox.Error />
 * </Combobox.Root>
 */
export const Combobox: ComboboxParts = {
	...BaseCombobox,
	Root: ComboboxRoot,
	Label: InputLabel,
	Control: ComboboxControl,
	Trigger: ComboboxTrigger,
	TriggerValue: ComboboxTriggerValue,
	SpokenValue: ComboboxSpokenValue,
	Icon: ComboboxIcon,
	Chips: ComboboxChips,
	ChipList: ComboboxChipList,
	Chip: ComboboxChip,
	ChipRemove: ComboboxChipRemove,
	Positioner: ComboboxPositioner,
	Popup: ComboboxPopup,
	Search: ComboboxSearch,
	List: ComboboxList,
	Option: ComboboxOption,
	OptionIndicator: ComboboxOptionIndicator,
	OptionCheckbox: ComboboxOptionCheckbox,
	OptionText: ComboboxOptionText,
	Empty: ComboboxEmpty,
	Status: ComboboxStatus,
	StatusArea: ComboboxStatusArea,
	LoadStatus: ComboboxLoadStatus,
	Body: ComboboxBody,
	Pending: ComboboxPending,
	Description: Field.Description,
	Error: InputError,
};
