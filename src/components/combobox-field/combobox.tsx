import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ReactNode,
	type Ref,
	useRef,
} from "react";
import {
	Button as RemoveButton,
	Tag,
	TagGroup,
	TagList,
} from "react-aria-components";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import { useInfiniteScroll } from "../../lib/use-infinite-scroll.ts";
import { Button } from "../button/index.ts";
import {
	Field,
	type FieldState,
	fieldStateAttributes,
	type OptionsLoad,
	type OptionsLoadLabels,
	useFieldFocus,
} from "../field/index.ts";
import { withFieldFocus } from "../field/use-field-focus.ts";
import { Spinner } from "../spinner/index.ts";
import { Tooltip } from "../tooltip/index.ts";
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
			/**
			 * The tags, beside the trigger. They show the selection, so the
			 * trigger's own value is read but not shown.
			 */
			tags?: ReactNode;
			/** The chevron at the end of the control, such as an expand icon. */
			icon?: ReactNode;
		}>;

const NO_STATE: FieldState = {};

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

/** The chevron at the end of the control. Its children are the icon; without them it renders nothing. */
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

/** The control that opens the popup: the value or the tags, the pending mark and `icon`. */
const ComboboxControl = ({
	className,
	children,
	tags,
	icon,
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
			{tags !== undefined && (
				<div
					className={style.content}
					onKeyDownCapture={event => {
						const edges = tagsOf(event.currentTarget);
						if (
							(event.key === "ArrowRight" &&
								edges.at(-1) === event.target) ||
							(event.key === "ArrowLeft" &&
								edges.at(0) === event.target)
						) {
							event.preventDefault();
							event.stopPropagation();
							focusTrigger(
								event.currentTarget.parentElement,
							);
						}
					}}>
					{tags}
				</div>
			)}
			<BaseCombobox.Trigger
				data-combobox-trigger=""
				aria-invalid={
					state.validity === "invalid" || undefined
				}
				aria-busy={busy}
				className={style.trigger}
				onKeyDown={event => {
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
				}}>
				<span
					className={
						tags === undefined
							? style.content
							: style.spokenValue
					}>
					{children}
				</span>
				{state.pending === true && <Field.Pending />}
				<ComboboxIcon>{icon}</ComboboxIcon>
			</BaseCombobox.Trigger>
		</BaseCombobox.InputGroup>
	);
};

export type ComboboxTagsProps<TItem> = Readonly<{
	/** Names the group of tags, such as "Selected statuses". */
	label: string;
	items: readonly TItem[];
	/** A stable identity per item. */
	itemKey: (item: TItem) => string;
	/** An item as plain text, which its tag is read as. */
	itemLabel: (item: TItem) => string;
	/** The remove control's own name, which the tag's name completes, such as "Remove". */
	removeLabel: string;
	/** The remove control's tooltip for an item, such as "Remove Jan Jansen". */
	removeHint: (item: TItem) => string;
	/** The remove control's icon, such as a cross. */
	removeIcon: ReactNode;
	/** Renders one tag's content. */
	children: (item: TItem) => ReactNode;
	/** Called with the items left after a removal. */
	onRemove: (remaining: readonly TItem[]) => void;
	disabled?: boolean;
	readOnly?: boolean;
}>;

/** The chosen values of a multiple combobox as removable tags, for `Control`'s `tags`. */
const ComboboxTags = <TItem,>({
	label,
	items,
	itemKey,
	itemLabel,
	removeLabel,
	removeHint,
	removeIcon,
	children,
	onRemove,
	disabled = false,
	readOnly = false,
}: ComboboxTagsProps<TItem>): ReactNode => {
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
			<TagList className={style.tagList}>
				{items.map(item => (
					<Tag
						key={itemKey(item)}
						id={itemKey(item)}
						textValue={itemLabel(item)}
						data-combobox-tag=""
						data-tone="neutral"
						data-variant="subtle"
						className={style.tag}>
						{children(item)}
						<Tooltip content={removeHint(item)}>
							<RemoveButton
								slot="remove"
								excludeFromTabOrder
								isDisabled={locked}
								aria-label={removeLabel}
								className={style.tagRemove}>
								{removeIcon}
							</RemoveButton>
						</Tooltip>
					</Tag>
				))}
			</TagList>
		</TagGroup>
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

export type ComboboxOptionIndicatorProps =
	BaseCombobox.ItemIndicator.Props &
		Readonly<{
			/** Draws the mark inside a checkbox, for a multi-value list. */
			multiple?: boolean;
		}>;

/** The mark beside a chosen option. Its children are the mark, such as a tick. */
const ComboboxOptionIndicator = ({
	className,
	multiple = false,
	...props
}: ComboboxOptionIndicatorProps): ReactNode =>
	multiple ? (
		<span className={style.checkbox} aria-hidden="true">
			<BaseCombobox.ItemIndicator
				keepMounted
				className={clsx(style.checkboxIndicator, className)}
				{...props}
			/>
		</span>
	) : (
		<BaseCombobox.ItemIndicator
			className={clsx(style.indicator, className)}
			{...props}
		/>
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
		/** Draws each option's mark inside a checkbox. */
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
						<ComboboxOptionIndicator multiple={multiple}>
							{checkIcon}
						</ComboboxOptionIndicator>
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
		Icon: typeof ComboboxIcon;
		Tags: typeof ComboboxTags;
		Positioner: typeof ComboboxPositioner;
		Popup: typeof ComboboxPopup;
		Search: typeof ComboboxSearch;
		List: typeof ComboboxList;
		Option: typeof ComboboxOption;
		OptionIndicator: typeof ComboboxOptionIndicator;
		OptionText: typeof ComboboxOptionText;
		Empty: typeof ComboboxEmpty;
		Status: typeof ComboboxStatus;
		StatusArea: typeof ComboboxStatusArea;
		LoadStatus: typeof ComboboxLoadStatus;
		Body: typeof ComboboxBody;
		Pending: typeof Field.Pending;
	}>;

/**
 * The styled parts of a base-ui Combobox: a filterable select whose control
 * matches `Select`'s trigger and whose popup is the shared popup surface. Every
 * unstyled base-ui part stays reachable. `Body` holds what the popup usually
 * does. For the ordinary case, use `ComboboxField`. The positioner takes the
 * control as its `anchor`.
 *
 * @example
 * <Combobox.Root items={statuses}>
 * 	<Combobox.Control ref={anchorRef} icon={<ExpandMoreIcon />}>
 * 		<Combobox.Value>{(status: string | null) => status}</Combobox.Value>
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
	Icon: ComboboxIcon,
	Tags: ComboboxTags,
	Positioner: ComboboxPositioner,
	Popup: ComboboxPopup,
	Search: ComboboxSearch,
	List: ComboboxList,
	Option: ComboboxOption,
	OptionIndicator: ComboboxOptionIndicator,
	OptionText: ComboboxOptionText,
	Empty: ComboboxEmpty,
	Status: ComboboxStatus,
	StatusArea: ComboboxStatusArea,
	LoadStatus: ComboboxLoadStatus,
	Body: ComboboxBody,
	Pending: Field.Pending,
};
