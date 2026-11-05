import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
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
import { CheckboxGlyph } from "../checkbox-field/checkbox-glyph.tsx";
import {
	Field,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
	withFieldFocus,
} from "../field/index.ts";
import { Icon } from "../icon/index.ts";
import { Tooltip } from "../tooltip/index.ts";
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

const ComboboxControl = ({
	className,
	children,
	tags,
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
				aria-invalid={state.invalid === true || undefined}
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
				<BaseCombobox.Icon className={style.icon}>
					<Icon svg={ExpandMoreIcon} label="" />
				</BaseCombobox.Icon>
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
	/** Renders one tag's content. */
	children: (item: TItem) => ReactNode;
	/** Called with the items left after a removal. */
	onRemove: (remaining: readonly TItem[]) => void;
	disabled?: boolean;
	readOnly?: boolean;
}>;

const ComboboxTags = <TItem,>({
	label,
	items,
	itemKey,
	itemLabel,
	removeLabel,
	removeHint,
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
								<Icon
									svg={CloseIcon}
									label=""
									size={0.875}
								/>
							</RemoveButton>
						</Tooltip>
					</Tag>
				))}
			</TagList>
		</TagGroup>
	);
};

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
		label: string;
	}>;

/**
 * The search box inside the popup. It names itself, clearing the field label
 * base-ui hands every labelable control under a field, which names the
 * field's own control.
 */
const ComboboxSearch = ({
	className,
	label,
	...props
}: ComboboxSearchProps): ReactNode => (
	<BaseCombobox.Input
		aria-label={label}
		aria-labelledby={undefined}
		className={clsx(style.search, className)}
		{...props}
	/>
);

export type ComboboxListProps = BaseCombobox.List.Props &
	Readonly<{
		/** The scroll container, which `useInfiniteScroll` watches. */
		ref?: Ref<HTMLDivElement>;
	}>;

const ComboboxList = ({
	className,
	...props
}: ComboboxListProps): ReactNode => (
	<BaseCombobox.List
		className={clsx(style.list, className)}
		{...props}
	/>
);

export type ComboboxOptionProps = BaseCombobox.Item.Props &
	Readonly<{
		/** Draws a checkbox rather than a tick, for a multi-value list. */
		multiple?: boolean;
	}>;

const ComboboxOption = ({
	className,
	children,
	multiple = false,
	...props
}: ComboboxOptionProps): ReactNode => (
	<BaseCombobox.Item
		className={clsx(style.option, className)}
		{...props}>
		{multiple ? (
			<span className={style.checkbox} aria-hidden="true">
				<BaseCombobox.ItemIndicator
					keepMounted
					className={style.checkboxIndicator}>
					<CheckboxGlyph />
				</BaseCombobox.ItemIndicator>
			</span>
		) : (
			<BaseCombobox.ItemIndicator
				className={style.indicator}>
				<Icon svg={CheckIcon} label="" />
			</BaseCombobox.ItemIndicator>
		)}
		<span className={style.optionText}>{children}</span>
	</BaseCombobox.Item>
);

const ComboboxEmpty = ({
	className,
	...props
}: BaseCombobox.Empty.Props): ReactNode => (
	<BaseCombobox.Empty
		className={clsx(style.empty, className)}
		{...props}
	/>
);

const ComboboxStatus = ({
	className,
	...props
}: BaseCombobox.Status.Props): ReactNode => (
	<BaseCombobox.Status
		className={clsx(style.status, className)}
		{...props}
	/>
);

const ComboboxStatusArea = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(style.statusArea, className)}
		{...props}
	/>
);

/** The parts of a combobox. */
export type ComboboxParts = Omit<
	typeof BaseCombobox,
	| "Root"
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
		Tags: typeof ComboboxTags;
		Positioner: typeof ComboboxPositioner;
		Popup: typeof ComboboxPopup;
		Search: typeof ComboboxSearch;
		List: typeof ComboboxList;
		Option: typeof ComboboxOption;
		Empty: typeof ComboboxEmpty;
		Status: typeof ComboboxStatus;
		StatusArea: typeof ComboboxStatusArea;
		Pending: typeof Field.Pending;
	}>;

/**
 * The styled parts of a base-ui Combobox: a filterable select whose control
 * matches `Select`'s trigger and whose popup is the shared popup surface. Every
 * unstyled base-ui part stays reachable. For the ordinary case, use
 * `ComboboxField`. The positioner takes the control as its `anchor`.
 *
 * @example
 * <Combobox.Root items={statuses}>
 * 	<Combobox.Control ref={anchorRef}>
 * 		<Combobox.Value>{(status: string | null) => status}</Combobox.Value>
 * 	</Combobox.Control>
 * 	<Combobox.Portal>
 * 		<Combobox.Positioner anchor={anchorRef}>
 * 			<Combobox.Popup>
 * 				<Combobox.Search label="Search" />
 * 				<Combobox.List>
 * 					{(status: string) => <Combobox.Option key={status} value={status}>{status}</Combobox.Option>}
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
	Tags: ComboboxTags,
	Positioner: ComboboxPositioner,
	Popup: ComboboxPopup,
	Search: ComboboxSearch,
	List: ComboboxList,
	Option: ComboboxOption,
	Empty: ComboboxEmpty,
	Status: ComboboxStatus,
	StatusArea: ComboboxStatusArea,
	Pending: Field.Pending,
};
