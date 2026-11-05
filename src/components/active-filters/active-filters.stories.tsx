import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { useFilterView } from "../filter-bar/use-filter-view.ts";
import { Icon } from "../icon/icon.tsx";
import { Tag } from "../tag/tag.tsx";
import { TagGroup } from "../tag-group/tag-group.tsx";
import {
	describeFlag,
	describeList,
	describeValue,
} from "./active-filter-describers.ts";
import {
	ActiveFilters,
	useActiveFilterChips,
} from "./active-filters.tsx";

const ACTIVE_LABEL = "Active filters";
const REMOVE_LABEL = "Remove";
const STATUS_CHIP = "Status: Submitted, Paid";
const YEAR_CHIP = "Year: 2026";
const ARCHIVED_CHIP = "Archived";

const removeIcon = <Icon svg={CloseIcon} label="" />;

type DeclarationFilters = Readonly<{
	statuses?: readonly string[];
	year?: string;
	archived?: boolean;
}>;

const ActiveFiltersExample = () => {
	const filters = useFilterView<DeclarationFilters>({
		initial: {
			statuses: ["Submitted", "Paid"],
			year: "2026",
			archived: true,
		},
	});

	return (
		<ActiveFilters
			filters={filters}
			describe={{
				statuses: describeList({
					label: "Status",
					tone: "info",
				}),
				year: describeValue({ label: "Year" }),
				archived: describeFlag(ARCHIVED_CHIP),
			}}
			label={ACTIVE_LABEL}
			removeLabel={REMOVE_LABEL}
			removeIcon={removeIcon}
		/>
	);
};

const ComposedExample = () => {
	const filters = useFilterView<DeclarationFilters>({
		initial: {
			statuses: ["Submitted", "Paid"],
			year: "2026",
		},
	});
	const { chips, onRemove } = useActiveFilterChips(
		filters,
		{
			statuses: describeList({
				label: "Status",
				tone: "info",
			}),
			year: describeValue({ label: "Year" }),
		},
	);

	return (
		<TagGroup.Root
			aria-label={ACTIVE_LABEL}
			onRemove={onRemove}>
			<TagGroup.List items={chips}>
				{chip => (
					<TagGroup.Tag
						id={chip.id}
						textValue={chip.textValue}
						tone={chip.tone}
						variant={chip.variant}>
						<Tag.Dot />
						{chip.content}
						<TagGroup.Remove label={REMOVE_LABEL}>
							{removeIcon}
						</TagGroup.Remove>
					</TagGroup.Tag>
				)}
			</TagGroup.List>
		</TagGroup.Root>
	);
};

const UnfilteredExample = () => {
	const filters = useFilterView<DeclarationFilters>({
		initial: {},
	});

	return (
		<ActiveFilters
			filters={filters}
			describe={{ year: describeValue({ label: "Year" }) }}
			label={ACTIVE_LABEL}
			removeLabel={REMOVE_LABEL}
			removeIcon={removeIcon}
		/>
	);
};

const meta = {
	parameters: {
		layout: "padded",
		designSystem: [
			{
				page: "Patterns",
				section: "Labels pinned to things",
			},
			{ component: "components/filter-bar" },
		],
	},
	component: ActiveFilters,
	render: ActiveFiltersExample,
	args: {
		filters: undefined,
		describe: {},
		label: ACTIVE_LABEL,
		removeLabel: REMOVE_LABEL,
		removeIcon,
	},
	argTypes: {
		filters: { control: false },
		describe: { control: false },
		removeIcon: { control: false },
	},
} satisfies Meta<typeof ActiveFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filtered: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("grid", { name: ACTIVE_LABEL }),
		).toBeVisible();
		await expect(
			canvas.getByRole("row", { name: STATUS_CHIP }),
		).toBeVisible();
		await expect(
			canvas.getByRole("row", { name: YEAR_CHIP }),
		).toBeVisible();
		await expect(
			canvas.getByRole("row", { name: ARCHIVED_CHIP }),
		).toBeVisible();
	},
};

export const RemoveKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(
			canvas.getByRole("row", { name: STATUS_CHIP }),
		).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(
			canvas.getByRole("row", { name: YEAR_CHIP }),
		).toHaveFocus();
		await userEvent.keyboard("{Delete}");

		await waitFor(() =>
			expect(
				canvas.queryByRole("row", { name: YEAR_CHIP }),
			).not.toBeInTheDocument(),
		);
		await expect(
			canvas.getByRole("row", { name: STATUS_CHIP }),
		).toBeVisible();
	},
};

export const RemoveMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: `${REMOVE_LABEL} ${ARCHIVED_CHIP}`,
			}),
		);

		await waitFor(() =>
			expect(
				canvas.queryByRole("row", { name: ARCHIVED_CHIP }),
			).not.toBeInTheDocument(),
		);
	},
};

export const RemoveTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: `${REMOVE_LABEL} ${STATUS_CHIP}`,
			}),
		});

		await waitFor(() =>
			expect(
				canvas.queryByRole("row", { name: STATUS_CHIP }),
			).not.toBeInTheDocument(),
		);
	},
};

export const Composed: Story = {
	render: ComposedExample,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("row", { name: STATUS_CHIP }),
		).toBeVisible();
		await expect(
			canvas.getByRole("row", { name: YEAR_CHIP }),
		).toBeVisible();
	},
};

export const ComposedRemoveMouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: ComposedExample,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: `${REMOVE_LABEL} ${YEAR_CHIP}`,
			}),
		);

		await waitFor(() =>
			expect(
				canvas.queryByRole("row", { name: YEAR_CHIP }),
			).not.toBeInTheDocument(),
		);
		await expect(
			canvas.getByRole("row", { name: STATUS_CHIP }),
		).toBeVisible();
	},
};

export const Unfiltered: Story = {
	render: UnfilteredExample,
	play: async ({ canvas }) => {
		await expect(
			canvas.queryByRole("grid"),
		).not.toBeInTheDocument();
	},
};
