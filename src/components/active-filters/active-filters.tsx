import type { ReactNode } from "react";
import type { Key } from "react-aria-components";
import type { Tone, ToneVariant } from "../../lib/tone.ts";
import {
	type FilterView,
	isActiveFilterValue,
} from "../filter-bar/use-filter-view.ts";
import { TagGroup } from "../tag-group/tag-group.tsx";
import type { ActiveFilterDescribers } from "./active-filter-describers.ts";

type Chip = Readonly<{
	id: string;
	content: ReactNode;
	textValue?: string;
	tone?: Tone;
	variant: ToneVariant;
	onRemove: () => void;
}>;

const buildChips = <TFilters extends object>(
	filters: FilterView<TFilters>,
	describe: ActiveFilterDescribers<TFilters>,
): readonly Chip[] => {
	const keys = Object.keys(describe).filter(
		(key): key is Extract<keyof TFilters, string> =>
			key in describe,
	);
	return keys.flatMap(key => {
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
		return descriptors.map((descriptor, index): Chip => ({
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
		}));
	});
};

export type ActiveFiltersProps<TFilters extends object> =
	Readonly<{
		filters: FilterView<TFilters>;
		/** Maps a filter key + value to one or more chip descriptors. */
		describe: ActiveFilterDescribers<TFilters>;
		/** What the chips are, such as "Active filters". */
		label: string;
		/** Each chip's remove button's name and tooltip, such as "Remove". */
		removeLabel: string;
		className?: string;
	}>;

/**
 * A roving-focus row of removable chips for the committed filters, on the
 * kit's `TagGroup`. Renders one or more chips per described, non-empty
 * committed field, and nothing when none are active.
 *
 * @example
 * <ActiveFilters
 * 	filters={filters}
 * 	describe={{ status: describeValue({ label: "Status" }) }}
 * 	label="Active filters"
 * 	removeLabel="Remove"
 * />
 */
export const ActiveFilters = <TFilters extends object>({
	filters,
	describe,
	label,
	removeLabel,
	className,
}: ActiveFiltersProps<TFilters>): ReactNode => {
	const chips = buildChips(filters, describe);

	if (chips.length === 0) {
		return null;
	}

	const handleRemove = (keys: Set<Key>) => {
		for (const chip of chips) {
			if (keys.has(chip.id)) {
				chip.onRemove();
			}
		}
	};

	return (
		<TagGroup.Root
			aria-label={label}
			onRemove={handleRemove}
			className={className}>
			<TagGroup.List items={chips}>
				{chip => (
					<TagGroup.Tag
						id={chip.id}
						textValue={chip.textValue}
						tone={chip.tone}
						variant={chip.variant}>
						{chip.content}
						<TagGroup.Remove label={removeLabel} />
					</TagGroup.Tag>
				)}
			</TagGroup.List>
		</TagGroup.Root>
	);
};
