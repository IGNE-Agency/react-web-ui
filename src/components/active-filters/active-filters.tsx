import { type ReactNode, type RefObject, use } from "react";
import type { Key } from "react-aria-components";
import type { Tone, ToneVariant } from "../../lib/tone.ts";
import { FilterBarTriggerContext } from "../filter-bar/filter-bar-trigger.ts";
import {
	type FilterView,
	isActiveFilterValue,
} from "../filter-bar/use-filter-view.ts";
import { TagGroup } from "../tag-group/tag-group.tsx";
import type { ActiveFilterDescribers } from "./active-filter-describers.ts";

/** One chip for a committed filter, ready for a `TagGroup.Tag`. */
export type ActiveFilterChip = Readonly<{
	/** The chip's key in the `TagGroup`. */
	id: string;
	content: ReactNode;
	textValue?: string;
	tone?: Tone;
	variant: ToneVariant;
	/** Clears what the chip stands for. */
	onRemove: () => void;
}>;

/** The chips for the committed filters, and the `TagGroup.Root` `onRemove` that clears them. */
export type ActiveFilterChips = Readonly<{
	chips: readonly ActiveFilterChip[];
	/** Clears the filters behind the removed keys; pass it to `TagGroup.Root`. */
	onRemove: (keys: Set<Key>) => void;
}>;

/**
 * Builds one or more chips per described, non-empty committed filter, for a
 * caller that renders its own `TagGroup`.
 *
 * @example
 * const { chips, onRemove } = useActiveFilterChips(filters, {
 * 	status: describeValue({ label: "Status" }),
 * });
 */
export const useActiveFilterChips = <
	TFilters extends object,
>(
	filters: FilterView<TFilters>,
	describe: ActiveFilterDescribers<TFilters>,
): ActiveFilterChips => {
	const keys = Object.keys(describe).filter(
		(key): key is Extract<keyof TFilters, string> =>
			key in describe,
	);
	const chips = keys.flatMap(key => {
		const value = filters.committed[key];
		if (!isActiveFilterValue(value)) {
			return [];
		}
		const described = describe[key]?.(value);
		if (!described) {
			return [];
		}
		const descriptors = Array.isArray(described)
			? described
			: [described];
		return descriptors.map(
			(descriptor, index): ActiveFilterChip => ({
				id: `${key}#${index}`,
				content: descriptor.content,
				textValue:
					descriptor.textValue ??
					(typeof descriptor.content === "string"
						? descriptor.content
						: undefined),
				tone: descriptor.tone,
				variant: descriptor.variant ?? "subtle",
				onRemove:
					descriptor.onRemove ??
					(() => {
						filters.removeFilter(key);
					}),
			}),
		);
	});

	return {
		chips,
		onRemove: removed => {
			for (const chip of chips) {
				if (removed.has(chip.id)) {
					chip.onRemove();
				}
			}
		},
	};
};

export type ActiveFiltersProps<TFilters extends object> =
	Readonly<{
		filters: FilterView<TFilters>;
		/** Maps a filter key + value to one or more chip descriptors. */
		describe: ActiveFilterDescribers<TFilters>;
		/** What the chips are, such as "Active filters". */
		label: string;
		/**
		 * Where focus goes when the last chip is removed, such as the button that
		 * opens the filters. Inside a `FilterBar.Root` it defaults to
		 * `FilterBar.Trigger`; outside one it is required.
		 */
		returnFocus?: RefObject<HTMLElement | null>;
		className?: string;
	}>;

/**
 * A roving-focus row of removable chips for the committed filters, on the
 * kit's `TagGroup`. Renders one or more chips per described, non-empty
 * committed field, and nothing when none are active, so removing the last chip
 * moves focus to `returnFocus`. Compose `TagGroup` over `useActiveFilterChips`
 * where a chip needs more than this.
 *
 * @example
 * <ActiveFilters
 * 	filters={filters}
 * 	describe={{ status: describeValue({ label: "Status" }) }}
 * 	label="Active filters"
 * 	returnFocus={filtersButtonRef}
 * />
 */
export const ActiveFilters = <TFilters extends object>({
	filters,
	describe,
	label,
	returnFocus,
	className,
}: ActiveFiltersProps<TFilters>): ReactNode => {
	const { chips, onRemove } = useActiveFilterChips(
		filters,
		describe,
	);
	const barTrigger = use(FilterBarTriggerContext);
	const focusTarget = returnFocus ?? barTrigger;

	if (!focusTarget) {
		throw new Error(
			"ActiveFilters needs returnFocus outside <FilterBar.Root>.",
		);
	}

	if (chips.length === 0) {
		return null;
	}

	return (
		<TagGroup.Root
			aria-label={label}
			onRemove={removed => {
				onRemove(removed);
				if (chips.every(chip => removed.has(chip.id))) {
					focusTarget.current?.focus();
				}
			}}
			className={className}>
			<TagGroup.List items={chips}>
				{chip => (
					<TagGroup.Tag
						id={chip.id}
						textValue={chip.textValue}
						tone={chip.tone}
						variant={chip.variant}>
						{chip.content}
						<TagGroup.Remove />
					</TagGroup.Tag>
				)}
			</TagGroup.List>
		</TagGroup.Root>
	);
};
