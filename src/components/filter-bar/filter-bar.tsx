import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentProps,
	createContext,
	type ReactElement,
	type ReactNode,
	useRef,
	useState,
} from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { Badge, type BadgeProps } from "../badge/badge.tsx";
import { Button } from "../button/button.tsx";
import { Drawer } from "../drawer/drawer.tsx";
import {
	SearchField,
	type SearchFieldProps,
} from "../search-field/search-field.tsx";
import type { FilterView } from "./use-filter-view.ts";
import style from "./filter-bar.module.scss";

type FilterBarContextValue = Readonly<{
	activeCount: number;
	isNarrowed: boolean;
	apply: () => void;
	cancel: () => void;
	reset: () => void;
	clearAll: () => void;
	search: string;
	setSearch: (value: string) => void;
}>;

const FilterBarContext =
	createContext<FilterBarContextValue | null>(null);

const useFilterBar = (): FilterBarContextValue =>
	useRequiredContext(
		FilterBarContext,
		"FilterBar.* must be rendered inside <FilterBar.Root>.",
	);

const FilterDrawerContext = createContext<
	(() => void) | null
>(null);

const useApply = (): (() => void) =>
	useRequiredContext(
		FilterDrawerContext,
		"FilterBar.Apply must be rendered inside <FilterBar.Drawer>.",
	);

export type FilterBarRootProps<TFilters extends object> =
	useRender.ComponentProps<"search"> &
		Readonly<{
			filters: FilterView<TFilters>;
			children: ReactNode;
		}>;

/** The `<search>` landmark holding a `useFilterView` for the parts inside it. */
const Root = <TFilters extends object>({
	filters,
	render,
	className,
	ref,
	...props
}: FilterBarRootProps<TFilters>): ReactNode => {
	const element = useRender({
		defaultTagName: "search",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.bar, className),
		},
	});

	return (
		<FilterBarContext value={filters}>
			{element}
		</FilterBarContext>
	);
};

export type FilterBarSearchProps = Omit<
	SearchFieldProps,
	"value" | "onValueChange"
>;

/**
 * The live search input, a `SearchField` bound to the view's search. Search is
 * not part of the Apply/Cancel bargain: it narrows as you type, debounced by
 * the view. Its label is hidden and fills the placeholder unless told otherwise.
 */
const Search = ({
	label,
	labelHidden = true,
	placeholder = label,
	className,
	...props
}: FilterBarSearchProps): ReactNode => {
	const { search, setSearch } = useFilterBar();

	return (
		<SearchField
			{...props}
			label={label}
			labelHidden={labelHidden}
			placeholder={placeholder}
			value={search}
			onValueChange={setSearch}
			className={clsx(style.search, className)}
		/>
	);
};

export type FilterBarDrawerProps = Readonly<{
	/** The trigger and the drawer's content: `FilterBar.Trigger` and `FilterBar.Content`. */
	children: ReactNode;
	/**
	 * Where the drawer comes from: `"right"` for a side panel, `"down"` for a
	 * bottom sheet, for example from the app's own viewport query.
	 */
	swipeDirection: "right" | "down";
}>;

/**
 * The apply-gated half: a `Drawer.Root` whose draft `FilterBar.Apply` commits.
 * Dismissing the drawer any other way discards the draft.
 */
const FilterDrawer = ({
	children,
	swipeDirection,
}: FilterBarDrawerProps): ReactNode => {
	const { apply, cancel } = useFilterBar();
	const [open, setOpen] = useState(false);
	const appliedRef = useRef(false);

	const handleApply = () => {
		appliedRef.current = true;
		apply();
		setOpen(false);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			if (!appliedRef.current) {
				cancel();
			}
			appliedRef.current = false;
		}
		setOpen(next);
	};

	return (
		<FilterDrawerContext value={handleApply}>
			<Drawer.Root
				open={open}
				onOpenChange={handleOpenChange}
				swipeDirection={swipeDirection}>
				{children}
			</Drawer.Root>
		</FilterDrawerContext>
	);
};

/** What the action buttons of a filter bar take. */
export type FilterBarButtonProps = Omit<
	ComponentProps<"button">,
	"ref" | "children"
> &
	Readonly<{
		/** The glyph leading the label. */
		icon?: ReactNode;
		/** The button's label. */
		children: ReactNode;
	}>;

/** The button that opens the drawer, such as "Filters" with a `FilterBar.Badge`. */
const Trigger = ({
	icon,
	children,
	...props
}: FilterBarButtonProps): ReactNode => (
	<Drawer.Trigger
		render={
			<Button variant="secondary" icon={icon} {...props}>
				{children}
			</Button>
		}
	/>
);

export type FilterBarBadgeProps = Omit<
	BadgeProps,
	"children"
>;

/** How many filters are applied, for the trigger. Renders nothing while none are. */
const FilterBadge = ({
	tone = "neutral",
	variant = "solid",
	...props
}: FilterBarBadgeProps): ReactNode => {
	const { activeCount } = useFilterBar();

	if (activeCount === 0) {
		return null;
	}

	return (
		<Badge tone={tone} variant={variant} {...props}>
			{activeCount}
		</Badge>
	);
};

export type FilterBarContentProps = Readonly<{
	/** The drawer's header, its `FilterBar.Fields` and its `FilterBar.Footer`. */
	children: ReactNode;
	className?: string;
}>;

/**
 * The drawer itself, a `Drawer.Sheet`: its portal, backdrop, viewport and popup,
 * around the content. For a drawer without the backdrop, compose `Drawer.Portal`,
 * `Drawer.Viewport`, `Drawer.Popup` and `Drawer.Content` in its place.
 *
 * @example
 * <FilterBar.Content>
 * 	<FilterBar.Fields>…</FilterBar.Fields>
 * </FilterBar.Content>
 */
const Content = ({
	children,
	className,
}: FilterBarContentProps): ReactNode => (
	<Drawer.Sheet className={className}>
		{children}
	</Drawer.Sheet>
);

export type FilterBarFieldsProps =
	useRender.ComponentProps<"div">;

/** The filter controls, bound to the view's `draft`, in a column. */
const Fields = ({
	render,
	className,
	ref,
	...props
}: FilterBarFieldsProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.fields, className),
		},
	});

export type FilterBarFooterProps =
	useRender.ComponentProps<"div">;

/** The drawer's actions, `FilterBar.Reset` and `FilterBar.Apply`, at its end. */
const Footer = ({
	render,
	className,
	ref,
	...props
}: FilterBarFooterProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.footer, className),
		},
	});

/** Puts the draft back to the initial filters, without closing the drawer. */
const Reset = ({
	icon,
	children,
	onClick,
	...props
}: FilterBarButtonProps): ReactNode => {
	const { reset } = useFilterBar();

	return (
		<Button
			variant="tertiary"
			icon={icon}
			{...props}
			onClick={event => {
				onClick?.(event);
				reset();
			}}>
			{children}
		</Button>
	);
};

/** Commits the draft and closes the drawer. */
const Apply = ({
	icon,
	children,
	onClick,
	...props
}: FilterBarButtonProps): ReactNode => {
	const apply = useApply();

	return (
		<Button
			variant="primary"
			icon={icon}
			{...props}
			onClick={event => {
				onClick?.(event);
				apply();
			}}>
			{children}
		</Button>
	);
};

export type FilterBarActiveProps =
	useRender.ComponentProps<"div">;

/**
 * The applied-filter row, on a line of its own: the chips for what is
 * narrowing the list, such as an `ActiveFilters`, and `FilterBar.ClearAll`.
 * Renders nothing while nothing narrows the list.
 */
const Active = ({
	render,
	className,
	ref,
	...props
}: FilterBarActiveProps): ReactElement | null => {
	const { isNarrowed } = useFilterBar();

	return useRender({
		defaultTagName: "div",
		render,
		ref,
		enabled: isNarrowed,
		props: {
			...props,
			className: clsx(style.active, className),
		},
	});
};

/** Clears every committed filter and the search. */
const ClearAll = ({
	icon,
	children,
	onClick,
	...props
}: FilterBarButtonProps): ReactNode => {
	const { clearAll } = useFilterBar();

	return (
		<Button
			variant="tertiary"
			icon={icon}
			{...props}
			onClick={event => {
				onClick?.(event);
				clearAll();
			}}>
			{children}
		</Button>
	);
};

type FilterBarParts = Readonly<{
	Root: typeof Root;
	Search: typeof Search;
	Drawer: typeof FilterDrawer;
	Trigger: typeof Trigger;
	Badge: typeof FilterBadge;
	Content: typeof Content;
	Fields: typeof Fields;
	Footer: typeof Footer;
	Reset: typeof Reset;
	Apply: typeof Apply;
	Active: typeof Active;
	ClearAll: typeof ClearAll;
}>;

/**
 * Composite filter surface. `Root` holds a `useFilterView` in context: `Search`
 * and the `Drawer` share the leading row, and `Active`, the applied-filter row,
 * takes a line of its own. The drawer's header is the `Drawer` component's own
 * `Drawer.Header`, `Drawer.Title` and `Drawer.Close`.
 *
 * @example
 * <FilterBar.Root filters={filters}>
 * 	<FilterBar.Search label="Search clients" clearLabel="Clear search" clearIcon={<CloseIcon />} icon={<SearchIcon />} optionalLabel="optional" />
 * 	<FilterBar.Drawer swipeDirection={narrow ? "down" : "right"}>
 * 		<FilterBar.Trigger icon={<FilterIcon />}>Filters<FilterBar.Badge /></FilterBar.Trigger>
 * 		<FilterBar.Content>
 * 			<Drawer.Header>
 * 				<Drawer.Title>Filter clients</Drawer.Title>
 * 				<Drawer.Close render={<IconButton label="Close" variant="tertiary"><CloseIcon /></IconButton>} />
 * 			</Drawer.Header>
 * 			<FilterBar.Fields><ClientFilterFields filters={filters} /></FilterBar.Fields>
 * 			<FilterBar.Footer>
 * 				<FilterBar.Reset>Reset</FilterBar.Reset>
 * 				<FilterBar.Apply>Apply</FilterBar.Apply>
 * 			</FilterBar.Footer>
 * 		</FilterBar.Content>
 * 	</FilterBar.Drawer>
 * 	<FilterBar.Active>
 * 		<ActiveFilters filters={filters} describe={describers} label="Active filters" removeLabel="Remove" removeIcon={<CloseIcon />} />
 * 		<FilterBar.ClearAll>Clear filters</FilterBar.ClearAll>
 * 	</FilterBar.Active>
 * </FilterBar.Root>
 */
export const FilterBar: FilterBarParts = {
	Root,
	Search,
	Drawer: FilterDrawer,
	Trigger,
	Badge: FilterBadge,
	Content,
	Fields,
	Footer,
	Reset,
	Apply,
	Active,
	ClearAll,
};
