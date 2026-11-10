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
	Field,
	type FieldPendingProps,
	type FieldState,
	fieldStateAttributes,
	type OptionsLoad,
	type OptionsLoadLabels,
	useFieldFocus,
} from "../field/index.ts";
import { withFieldFocus } from "../field/use-field-focus.ts";
import { Spinner } from "../spinner/index.ts";
import {
	type PagedQuery,
	pagedProgress,
} from "./combobox-items.ts";
import style from "./combobox.module.scss";

export type ComboboxRootProps<
	TItem,
	TMultiple extends boolean | undefined = false,
> = Omit<
	BaseCombobox.Root.Props<TItem, TMultiple>,
	"autoHighlight"
> &
	Readonly<{
		/** `"always"` highlights the first item whenever the list changes. @default "always" */
		autoHighlight?: boolean | "always";
	}>;

/** The combobox's state, holding its items and its value. */
const ComboboxRoot = <
	TItem,
	TMultiple extends boolean | undefined = false,
>({
	autoHighlight = "always",
	...props
}: ComboboxRootProps<TItem, TMultiple>): ReactNode => (
	<BaseCombobox.Root<TItem, TMultiple>
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion -- base-ui's Root types `autoHighlight` as boolean, but forwards it unchanged to the AriaCombobox beneath, which accepts "always".
		autoHighlight={autoHighlight as boolean}
		{...props}
	/>
);

export type ComboboxControlProps =
	BaseCombobox.InputGroup.Props &
		Readonly<{
			/** The control element, which the positioner takes as its `anchor`. */
			ref?: Ref<HTMLDivElement>;
			/** The states projected onto the control as `data-*` attributes. */
			state?: FieldState;
		}>;

const NO_STATE: FieldState = {};

const ControlStateContext: Context<FieldState> =
	createContext<FieldState>(NO_STATE);

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
 * The control's box, projecting `state` onto itself and holding the `Chips`
 * and the `Trigger`. The positioner takes it as its `anchor`.
 *
 * @example
 * <Combobox.Control ref={anchorRef} state={state}>
 * 	<Combobox.Trigger>…</Combobox.Trigger>
 * </Combobox.Control>
 */
const ComboboxControl = ({
	className,
	children,
	state = NO_STATE,
	...props
}: ComboboxControlProps): ReactNode => {
	const focus = useFieldFocus(props);
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
 * What the trigger shows while the control's `state` is pending, such as a
 * spinner. Renders nothing otherwise.
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
	disabled?: boolean;
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
	disabled = false,
	readOnly = false,
	className,
}: ComboboxChipListProps<TItem>): ReactNode => {
	const ref = useRef<HTMLDivElement>(null);
	const locked = disabled || readOnly;
	return (
		<TagGroup
			ref={ref}
			aria-label={label}
			className={style.tags}
			disabledKeys={disabled ? items.map(itemKey) : []}
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
		/** The button's own name, which the chip's name completes, such as "Remove". */
		"aria-label": string;
		className?: string;
	}>;

/**
 * The pointer-only button that removes its chip; the keyboard removes with
 * Delete. Its children are the icon, such as a cross.
 *
 * @example
 * <Tooltip content="Remove Open">
 * 	<Combobox.ChipRemove aria-label="Remove"><CloseIcon /></Combobox.ChipRemove>
 * </Tooltip>
 */
const ComboboxChipRemove = ({
	className,
	...props
}: ComboboxChipRemoveProps): ReactNode => (
	<RemoveButton
		slot="remove"
		excludeFromTabOrder
		isDisabled={useContext(ChipsLockedContext)}
		className={clsx(style.tagRemove, className)}
		{...props}
	/>
);

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
> &
	Readonly<{
		/** The search box's accessible name. */
		"aria-label": string;
	}>;

/**
 * The search box inside the popup. It names itself, clearing the field label
 * base-ui hands every labelable control under a field, which names the
 * field's own control.
 */
const ComboboxSearch = ({
	className,
	...props
}: ComboboxSearchProps): ReactNode => (
	<BaseCombobox.Input
		aria-labelledby={undefined}
		className={clsx(style.search, className)}
		{...props}
	/>
);

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

/** The copy a combobox's popup shows about its options. */
export type ComboboxPopupLabels = OptionsLoadLabels &
	Readonly<{
		/** Shown when the search matches nothing. */
		noResultsLabel: string;
		/** The search box's accessible name, such as "Search". */
		searchLabel: string;
		/** Read while a paged query fetches its next page. */
		loadingMoreLabel: string;
		/** The match count of a paged query, such as "40 results". */
		resultsLabel: (count: number) => string;
	}>;

/** The copy `LoadStatus` shows. */
export type ComboboxLoadStatusLabels = Pick<
	ComboboxPopupLabels,
	| "loadingLabel"
	| "loadFailedLabel"
	| "loadBrokenLabel"
	| "retryLabel"
	| "loadingMoreLabel"
	| "resultsLabel"
>;

export type ComboboxLoadStatusProps =
	ComboboxLoadStatusLabels &
		Readonly<{
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
	labels: ComboboxLoadStatusLabels,
	load: OptionsLoad,
	query: ComboboxLoadStatusProps["query"],
): string | undefined => {
	if (load.status === "pending") {
		return labels.loadingLabel;
	}
	if (load.status === "error") {
		return load.retry === undefined
			? labels.loadBrokenLabel
			: labels.loadFailedLabel;
	}
	const paged = pagedProgress(query);
	if (paged === undefined) {
		return undefined;
	}
	if (paged.isFetchingNextPage) {
		return labels.loadingMoreLabel;
	}
	return paged.totalCount === undefined
		? undefined
		: labels.resultsLabel(paged.totalCount);
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
	...labels
}: ComboboxLoadStatusProps): ReactNode => {
	const retry =
		load.status === "error" ? load.retry : undefined;
	return (
		<ComboboxStatusArea className={className}>
			<ComboboxStatus>
				{(load.status === "pending" ||
					query?.isFetchingNextPage === true) && (
					<Spinner size={1} />
				)}
				{loadMessage(labels, load, query)}
			</ComboboxStatus>
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
		</ComboboxStatusArea>
	);
};

export type ComboboxBodyProps<TItem> = ComboboxPopupLabels &
	Readonly<{
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
		/** The mark beside a chosen option, such as a tick. */
		checkIcon: ReactNode;
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
	checkIcon,
	children,
	...labels
}: ComboboxBodyProps<TItem>): ReactNode => {
	const searchRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<ComboboxSearch
				ref={searchRef}
				aria-label={labels.searchLabel}
			/>
			<ComboboxLoadStatus
				load={load}
				query={query}
				loadingLabel={labels.loadingLabel}
				loadFailedLabel={labels.loadFailedLabel}
				loadBrokenLabel={labels.loadBrokenLabel}
				retryLabel={labels.retryLabel}
				loadingMoreLabel={labels.loadingMoreLabel}
				resultsLabel={labels.resultsLabel}
				onRetry={retry => {
					retry();
					searchRef.current?.focus();
				}}
			/>
			<ComboboxEmpty>
				{load.status === "success"
					? noOptions
						? labels.noOptionsLabel
						: labels.noResultsLabel
					: null}
			</ComboboxEmpty>
			<ComboboxList query={query}>
				{(item: TItem) => (
					<ComboboxOption key={itemKey(item)} value={item}>
						{multiple ? (
							<ComboboxOptionCheckbox>
								<ComboboxOptionIndicator>
									{checkIcon}
								</ComboboxOptionIndicator>
							</ComboboxOptionCheckbox>
						) : (
							<ComboboxOptionIndicator>
								{checkIcon}
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
	}>;

/**
 * The styled parts of a base-ui Combobox: a filterable select whose control
 * matches `Select`'s trigger and whose popup is the shared popup surface. Every
 * unstyled base-ui part stays reachable. A multiple combobox shows its
 * selection as `Chips` beside the `Trigger`. `Body` holds what the popup
 * usually does. For the ordinary case, use `ComboboxField`. The positioner takes the
 * control as its `anchor`.
 *
 * @example
 * <Combobox.Root items={statuses}>
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
 * 				<Combobox.Search aria-label="Search" />
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
 * </Combobox.Root>
 */
export const Combobox: ComboboxParts = {
	...BaseCombobox,
	Root: ComboboxRoot,
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
};
