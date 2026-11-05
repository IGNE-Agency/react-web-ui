import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import FilterIcon from "@material-design-icons/svg/outlined/filter_alt.svg?react";
import FilterOffIcon from "@material-design-icons/svg/outlined/filter_alt_off.svg?react";
import RestoreIcon from "@material-design-icons/svg/outlined/restore.svg?react";
import { clsx } from "clsx";
import {
	createContext,
	type ReactNode,
	useRef,
	useState,
} from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { Badge } from "../badge/badge.tsx";
import { Button } from "../button/button.tsx";
import { Drawer } from "../drawer/drawer.tsx";
import { SearchField } from "../search-field/search-field.tsx";
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

export type FilterBarRootProps<TFilters extends object> =
	Readonly<{
		filters: FilterView<TFilters>;
		children: ReactNode;
		className?: string;
	}>;

const Root = <TFilters extends object>({
	filters,
	children,
	className,
}: FilterBarRootProps<TFilters>): ReactNode => (
	<FilterBarContext value={filters}>
		<search className={clsx(style.bar, className)}>
			{children}
		</search>
	</FilterBarContext>
);

export type FilterBarSearchProps = Readonly<{
	/** Names the field and fills its placeholder, such as "Search clients". */
	label: string;
	/** The clear button's name and tooltip, such as "Clear search". */
	clearLabel: string;
	className?: string;
}>;

/**
 * The live search input. Search is not part of the Apply/Cancel bargain: it
 * narrows as you type, debounced by the view. Its label is hidden; the glyph
 * and the placeholder carry it for anyone who can see them.
 */
const Search = ({
	label,
	clearLabel,
	className,
}: FilterBarSearchProps): ReactNode => {
	const { search, setSearch } = useFilterBar();

	return (
		<SearchField
			label={label}
			labelHidden
			optionalLabel=""
			clearLabel={clearLabel}
			placeholder={label}
			value={search}
			onValueChange={setSearch}
			className={clsx(style.search, className)}
		/>
	);
};

export type FilterBarDrawerProps = Readonly<{
	/** The filter controls, bound to the view's `draft`. */
	children: ReactNode;
	/**
	 * Where the drawer comes from: `"right"` for a side panel, `"down"` for a
	 * bottom sheet, for example from the app's own viewport query.
	 */
	swipeDirection: "right" | "down";
	/** The trigger's label, such as "Filters". */
	triggerLabel: string;
	/** The drawer's title, such as "Filter clients". */
	title: string;
	/** The close button's name and tooltip, such as "Close". */
	closeLabel: string;
	/** The button that restores the initial filters, such as "Reset". */
	resetLabel: string;
	/** The button that commits the draft, such as "Apply". */
	applyLabel: string;
	className?: string;
}>;

/**
 * The apply-gated half: a trigger badged with the applied-filter count, and a
 * drawer of filter fields over Apply, which commits the draft. Dismissing the
 * drawer discards the draft, and Reset puts it back to the initial filters
 * without closing.
 */
const FilterDrawer = ({
	children,
	swipeDirection,
	triggerLabel,
	title,
	closeLabel,
	resetLabel,
	applyLabel,
	className,
}: FilterBarDrawerProps): ReactNode => {
	const { activeCount, apply, cancel, reset } =
		useFilterBar();
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
		<Drawer.Root
			open={open}
			onOpenChange={handleOpenChange}
			swipeDirection={swipeDirection}>
			<Drawer.Trigger
				render={
					<Button variant="secondary" icon={FilterIcon}>
						{triggerLabel}
						{activeCount > 0 && (
							<Badge tone="neutral" variant="solid">
								{activeCount}
							</Badge>
						)}
					</Button>
				}
			/>

			<Drawer.Portal>
				<Drawer.Backdrop />
				<Drawer.Viewport>
					<Drawer.Popup>
						<Drawer.Content>
							<Drawer.Header>
								<Drawer.Title>{title}</Drawer.Title>
								<Drawer.CloseButton label={closeLabel} />
							</Drawer.Header>

							<div
								className={clsx(style.fields, className)}>
								{children}
							</div>

							<div className={style.footer}>
								<Button
									variant="tertiary"
									icon={RestoreIcon}
									onClick={reset}>
									{resetLabel}
								</Button>
								<Button
									variant="primary"
									icon={CheckIcon}
									onClick={handleApply}>
									{applyLabel}
								</Button>
							</div>
						</Drawer.Content>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	);
};

export type FilterBarActiveProps = Readonly<{
	/** The chips for the committed filters, i.e. an `<ActiveFilters>`. */
	children?: ReactNode;
	/** The button that clears every filter and the search, such as "Clear filters". */
	clearAllLabel: string;
	className?: string;
}>;

/**
 * The applied-filter row: the chips for what is narrowing the list, with the
 * clear-everything control inline at their end. That control clears the search
 * as well as the committed filters.
 */
const Active = ({
	children,
	clearAllLabel,
	className,
}: FilterBarActiveProps): ReactNode => {
	const { isNarrowed, clearAll } = useFilterBar();

	if (!isNarrowed) {
		return null;
	}

	return (
		<div className={clsx(style.active, className)}>
			{children}
			<Button
				variant="tertiary"
				icon={FilterOffIcon}
				onClick={clearAll}>
				{clearAllLabel}
			</Button>
		</div>
	);
};

type FilterBarParts = Readonly<{
	Root: typeof Root;
	Search: typeof Search;
	Drawer: typeof FilterDrawer;
	Active: typeof Active;
}>;

/**
 * Composite filter surface. `Root` holds a `useFilterView` in context and lays
 * out the parts: `Search` and `Drawer` share the leading row, and `Active`, the
 * applied-filter row, takes a line of its own.
 *
 * @example
 * <FilterBar.Root filters={filters}>
 * 	<FilterBar.Search label="Search clients" clearLabel="Clear search" />
 * 	<FilterBar.Drawer swipeDirection={narrow ? "down" : "right"} triggerLabel="Filters" title="Filter clients" closeLabel="Close" resetLabel="Reset" applyLabel="Apply">
 * 		<ClientFilterFields filters={filters} />
 * 	</FilterBar.Drawer>
 * 	<FilterBar.Active clearAllLabel="Clear filters">
 * 		<ActiveFilters filters={filters} describe={describers} label="Active filters" removeLabel="Remove" />
 * 	</FilterBar.Active>
 * </FilterBar.Root>
 */
export const FilterBar: FilterBarParts = {
	Root,
	Search,
	Drawer: FilterDrawer,
	Active,
};
