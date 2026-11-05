import type { QueryKey } from "@tanstack/react-query";
import {
	type ReactNode,
	use,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldState,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import {
	Combobox,
	type ComboboxPopupLabels,
} from "./combobox.tsx";
import {
	type ComboboxItems,
	type ItemQuery,
	itemsOf,
	loadOf,
} from "./combobox-items.ts";
import { ItemLookupsContext } from "./item-lookups.ts";
import {
	type ComboboxMode,
	defaultValues,
	emitValues,
	selectedValues,
} from "./selection.ts";
import {
	type ItemLookup,
	type ValueState,
	type ValueStateLabels,
	valueStateOf,
} from "./value-state.ts";
import {
	ValueStatesStatus,
	ValueStateView,
	valueStateName,
} from "./value-state-view.tsx";

const DEFAULT_SEARCH_DELAY = 300;

const alwaysRetryable = (): boolean => true;

/** Everything a combobox field takes besides its items, its value and how it reads them. */
export type ComboboxFieldChrome = FieldProps &
	ComboboxPopupLabels &
	Readonly<{
		/** Shown in the control while nothing is chosen. */
		placeholder?: string;
		disabled?: boolean;
		readOnly?: boolean;
		/** The form field's name. */
		name?: string;
		/** Called when focus leaves the control. */
		onBlur?: FieldBlurHandler;
		/** Whether trying a failed load again can help. @default always */
		retryable?: (error: unknown) => boolean;
		/** Debounce before a search reaches `onSearchChange`, in ms. @default 300 */
		searchDelay?: number;
		/** Applied to the field wrapper, so callers can size the control. */
		className?: string;
		/** The chevron at the end of the control, such as an expand icon. */
		icon?: ReactNode;
		/** The mark beside a chosen option, such as a tick. */
		checkIcon: ReactNode;
	}>;

/** How a combobox field reads its items. */
export type ComboboxDerivations<TItem> = Readonly<{
	/** A stable identity per item, for keys, selection and form values. */
	itemKey: (item: TItem) => string;
	/** An item as plain text: the filter text and its accessible name. @default itemKey */
	itemToStringLabel?: (item: TItem) => string;
	/** Renders one item, as a list row and as a chosen value. */
	children: (item: TItem) => ReactNode;
}>;

/**
 * An `itemQuery` that looks up the values the loaded list does not hold, with
 * the copy for values it reports gone. Needs `ComboboxItemQueries` above it.
 */
export type ComboboxItemLookup<
	TItem,
	TData = TItem,
	TKey extends QueryKey = QueryKey,
> =
	| Readonly<{ itemQuery?: never }>
	| (Readonly<{
			itemQuery: ItemQuery<TItem, TData, TKey>;
			/** Marks a value that is no longer available, beside its label. */
			unavailableIcon?: ReactNode;
	  }> &
			ValueStateLabels);

export type ComboboxFieldProps<
	TItem,
	TData = TItem,
	TKey extends QueryKey = QueryKey,
> = ComboboxFieldChrome &
	ComboboxItems<TItem> &
	ComboboxDerivations<TItem> &
	ComboboxMode<TItem> &
	ComboboxItemLookup<TItem, TData, TKey>;

type FieldBodyProps<TItem> = Readonly<{
	chrome: ComboboxFieldChrome;
	source: ComboboxItems<TItem>;
	derivations: ComboboxDerivations<TItem>;
	mode: ComboboxMode<TItem>;
	labels: ValueStateLabels | undefined;
	unavailableIcon: ReactNode;
	values: readonly TItem[];
	states: readonly ValueState<TItem>[];
	onChange: (next: readonly TItem[]) => void;
}>;

const FieldBody = <TItem,>({
	chrome,
	source,
	derivations,
	mode,
	labels,
	unavailableIcon,
	values,
	states,
	onChange,
}: FieldBodyProps<TItem>): ReactNode => {
	const {
		label,
		description,
		errors,
		requiredness,
		optionalLabel,
		dirty,
		touched,
		pending = false,
		placeholder,
		readOnly,
		name,
		onBlur,
		retryable = alwaysRetryable,
		searchDelay = DEFAULT_SEARCH_DELAY,
		className,
		icon,
		checkIcon,
	} = chrome;
	const { itemKey, children: renderItem } = derivations;
	const itemLabel =
		derivations.itemToStringLabel ?? itemKey;
	const ids = Field.useIds();
	const anchorRef = useRef<HTMLDivElement>(null);
	const items = itemsOf(source);
	const load = loadOf(source, retryable);
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled: chrome.disabled,
		readOnly,
		filled: values.length > 0,
	});
	const { disabled } = field;
	const [search, setSearch] = useState("");
	const searchTimer = useRef<
		ReturnType<typeof setTimeout> | undefined
	>(undefined);

	useEffect(
		() => () => clearTimeout(searchTimer.current),
		[],
	);

	const searchServer = (text: string, delay: number) => {
		const { onSearchChange } = source;
		if (onSearchChange === undefined) {
			return;
		}
		clearTimeout(searchTimer.current);
		searchTimer.current = setTimeout(
			() => onSearchChange(text),
			delay,
		);
	};

	const fieldState: FieldState = {
		...field.state,
		pending:
			field.state.pending === true ||
			load.status === "pending",
	};
	const nameOf = (state: ValueState<TItem>) =>
		valueStateName(state, itemLabel, labels);
	const view = (state: ValueState<TItem>) => (
		<ValueStateView
			state={state}
			renderItem={renderItem}
			itemLabel={itemLabel}
			labels={labels}
			icon={unavailableIcon}
		/>
	);
	const [first] = states;

	const root = {
		items,
		filter: source.query === undefined ? undefined : null,
		itemToStringLabel: itemLabel,
		itemToStringValue: itemKey,
		isItemEqualToValue: (item: TItem, value: TItem) =>
			itemKey(item) === itemKey(value),
		name: name ?? ids.controlId,
		inputRef: detachHiddenInput,
		disabled,
		readOnly,
		...(readOnly === true && { open: false }),
		required: requiredness === "required",
		onInputValueChange: (
			next: string,
			details: Readonly<{ reason: string }>,
		) => {
			if (details.reason === "input-change") {
				setSearch(next);
				searchServer(next, searchDelay);
			}
		},
		onOpenChangeComplete: (open: boolean) => {
			if (!open) {
				setSearch("");
				searchServer("", 0);
			}
		},
	};

	const parts = (
		<>
			<Field.Label
				requiredness={requiredness}
				optionalLabel={optionalLabel}>
				{label}
			</Field.Label>

			{mode.multiple === true ? (
				<Combobox.Control
					ref={anchorRef}
					state={fieldState}
					icon={icon}
					onBlur={onBlur}
					tags={
						first === undefined ? (
							<span aria-hidden="true">{placeholder}</span>
						) : (
							<Combobox.Tags
								label={mode.selectedLabel}
								items={states}
								itemKey={state => state.key}
								itemLabel={nameOf}
								removeLabel={mode.removeLabel}
								removeHint={state =>
									mode.removeHint(nameOf(state))
								}
								removeIcon={mode.removeIcon}
								disabled={disabled}
								readOnly={readOnly}
								onRemove={remaining => {
									const kept = new Set(
										remaining.map(state => state.key),
									);
									onChange(
										values.filter(value =>
											kept.has(itemKey(value)),
										),
									);
								}}>
								{view}
							</Combobox.Tags>
						)
					}>
					{first === undefined
						? placeholder
						: states.map(nameOf).join(", ")}
				</Combobox.Control>
			) : (
				<Combobox.Control
					ref={anchorRef}
					state={fieldState}
					icon={icon}
					onBlur={onBlur}>
					{first === undefined ? placeholder : view(first)}
				</Combobox.Control>
			)}

			<Combobox.Portal>
				<Combobox.Positioner anchor={anchorRef}>
					<Combobox.Popup aria-label={label}>
						<Combobox.Body
							load={load}
							query={source.query}
							noOptions={
								source.query === undefined
									? items.length === 0
									: search === ""
							}
							multiple={mode.multiple === true}
							itemKey={itemKey}
							checkIcon={checkIcon}
							loadingLabel={chrome.loadingLabel}
							loadFailedLabel={chrome.loadFailedLabel}
							loadBrokenLabel={chrome.loadBrokenLabel}
							retryLabel={chrome.retryLabel}
							noOptionsLabel={chrome.noOptionsLabel}
							noResultsLabel={chrome.noResultsLabel}
							searchLabel={chrome.searchLabel}
							loadingMoreLabel={chrome.loadingMoreLabel}
							resultsLabel={chrome.resultsLabel}>
							{renderItem}
						</Combobox.Body>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>

			{labels !== undefined && (
				<ValueStatesStatus
					states={states}
					labels={labels}
				/>
			)}
			<Field.Description>{description}</Field.Description>
			<Field.Error>{errors}</Field.Error>
		</>
	);

	return (
		<Field.Root
			className={className}
			disabled={disabled}
			invalid={field.invalid}
			dirty={dirty}
			touched={touched}
			{...fieldStateAttributes(fieldState)}>
			{mode.multiple === true ? (
				<Combobox.Root<TItem, true>
					{...root}
					multiple
					value={[...values]}
					onValueChange={next => onChange(next)}>
					{parts}
				</Combobox.Root>
			) : (
				<Combobox.Root<TItem>
					{...root}
					value={values.at(0) ?? null}
					onValueChange={next =>
						onChange(next === null ? [] : [next])
					}>
					{parts}
				</Combobox.Root>
			)}
		</Field.Root>
	);
};

/**
 * The assembled combobox: a labelled field whose control shows the selection —
 * one value, or removable tags under `multiple` — and whose popup holds the
 * search box and the list. Static `items` are filtered on the client; a paged
 * `query` is searched on the server, debounced, and loads its next page as the
 * list nears its end. An `itemQuery` looks up chosen values the list does not
 * hold, and marks the ones it reports gone.
 *
 * @example
 * <ComboboxField
 * 	label="Reviewer"
 * 	optionalLabel="optional"
 * 	query={reviewersQuery}
 * 	onSearchChange={setSearch}
 * 	itemKey={user => user.id}
 * 	itemToStringLabel={user => user.name}
 * 	value={reviewer}
 * 	onValueChange={setReviewer}
 * 	icon={<ExpandMoreIcon />}
 * 	checkIcon={<CheckIcon />}
 * 	{...comboboxCopy}>
 * 	{user => user.name}
 * </ComboboxField>
 */
export const ComboboxField = <
	TItem,
	TData = TItem,
	TKey extends QueryKey = QueryKey,
>(
	props: ComboboxFieldProps<TItem, TData, TKey>,
): ReactNode => {
	const { itemKey } = props;
	const Lookups = use(ItemLookupsContext);
	const [own, setOwn] = useState(() =>
		defaultValues(props),
	);
	const [picked, setPicked] = useState<ReadonlySet<string>>(
		() => new Set(),
	);
	const values = selectedValues(props) ?? own;
	const listed = new Map(
		itemsOf(props).map(item => [itemKey(item), item]),
	);
	const retryable = props.retryable ?? alwaysRetryable;
	const asked = values
		.map(itemKey)
		.filter(key => !picked.has(key) && !listed.has(key));

	const change = (next: readonly TItem[]) => {
		const added = next
			.map(itemKey)
			.filter(
				key =>
					!values.some(value => itemKey(value) === key),
			);
		if (added.length > 0) {
			setPicked(new Set([...picked, ...added]));
		}
		setOwn(next);
		emitValues(props, next);
	};

	const statesOf = (
		lookups: readonly ItemLookup<TItem>[],
	): readonly ValueState<TItem>[] => {
		const lookupOf = new Map(
			asked.map((key, index) => [key, lookups[index]]),
		);
		return values.map(item => {
			const key = itemKey(item);
			return valueStateOf({
				key,
				item,
				picked: picked.has(key),
				listed: listed.get(key),
				lookup: lookupOf.get(key),
				retryable,
			});
		});
	};

	const body = (
		states: readonly ValueState<TItem>[],
		labels: ValueStateLabels | undefined,
		unavailableIcon?: ReactNode,
	) => (
		<FieldBody
			chrome={props}
			source={props}
			derivations={props}
			mode={props}
			labels={labels}
			unavailableIcon={unavailableIcon}
			values={values}
			states={states}
			onChange={change}
		/>
	);

	if (props.itemQuery === undefined) {
		return body(statesOf([]), undefined);
	}
	if (Lookups === null) {
		throw new Error(
			"A ComboboxField with an itemQuery needs a <ComboboxItemQueries> above it.",
		);
	}
	const labels: ValueStateLabels = props;
	const { unavailableIcon } = props;
	return (
		// oxlint-disable-next-line react/static-components -- The lookup component comes from context, set once by ComboboxItemQueries; it is never created here.
		<Lookups keys={asked} itemQuery={props.itemQuery}>
			{lookups =>
				body(statesOf(lookups), labels, unavailableIcon)
			}
		</Lookups>
	);
};
