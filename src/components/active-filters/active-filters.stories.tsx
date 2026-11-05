import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { useFilterView } from "../filter-bar/use-filter-view.ts";
import {
	describeFlag,
	describeList,
	describeValue,
} from "./active-filter-describers.ts";
import { ActiveFilters } from "./active-filters.tsx";

const ACTIVE_LABEL = "Active filters";
const REMOVE_LABEL = "Remove";
const STATUS_CHIP = "Status: Submitted, Paid";
const YEAR_CHIP = "Year: 2026";
const ARCHIVED_CHIP = "Archived";

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
		/>
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
	},
	argTypes: {
		filters: { control: false },
		describe: { control: false },
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

export const Unfiltered: Story = {
	render: UnfilteredExample,
	play: async ({ canvas }) => {
		await expect(
			canvas.queryByRole("grid"),
		).not.toBeInTheDocument();
	},
};
