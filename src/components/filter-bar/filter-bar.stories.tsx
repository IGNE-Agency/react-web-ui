import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import { z } from "zod";
import { memoryStorage } from "../../lib/storybook/memory-storage.ts";
import { roleGone } from "../../lib/storybook/waits.ts";
import {
	type StoredValue,
	tableStoredValue,
} from "../../lib/table-storage.ts";
import { describeValue } from "../active-filters/active-filter-describers.ts";
import { ActiveFilters } from "../active-filters/active-filters.tsx";
import { SelectField } from "../select-field/select-field.tsx";
import { FilterBar } from "./filter-bar.tsx";
import { useFilterView } from "./use-filter-view.ts";

const CLIENT_LABEL = "Client";
const ALL_CLIENTS = "All clients";
const SEARCH_LABEL = "Search by client";
const CLEAR_SEARCH_LABEL = "Clear search";
const FILTERS_LABEL = "Filters";
const FILTERS_TITLE = "Filter clients";
const CLOSE_LABEL = "Close";
const RESET_LABEL = "Reset";
const APPLY_LABEL = "Apply";
const CLEAR_ALL_LABEL = "Clear filters";
const ACTIVE_LABEL = "Active filters";
const REMOVE_LABEL = "Remove";

const CLIENTS = [
	"Chris Bakker",
	"Anne de Vries",
	"Daan Smit",
	"Bram Jansen",
] as const;

const [CHRIS, ANNE, DAAN] = CLIENTS;

type ClientFilters = Readonly<{ client?: string }>;

const storedFilters = tableStoredValue<ClientFilters>(
	"story-filter-bar",
	"filters",
	{
		schema: z.object({ client: z.string().optional() }),
		fallback: {},
	},
	memoryStorage(),
);

const CLIENT_OPTIONS = [
	{ value: "", label: ALL_CLIENTS },
	...CLIENTS.map(client => ({
		value: client,
		label: client,
	})),
];

type ClientFilterBarProps = Readonly<{
	stored?: StoredValue<ClientFilters>;
}>;

const ClientFilterBar = ({
	stored,
}: ClientFilterBarProps) => {
	const filters = useFilterView<ClientFilters>({
		initial: {},
		stored,
	});

	return (
		<FilterBar.Root filters={filters}>
			<FilterBar.Search
				label={SEARCH_LABEL}
				clearLabel={CLEAR_SEARCH_LABEL}
			/>
			<FilterBar.Drawer
				swipeDirection="right"
				triggerLabel={FILTERS_LABEL}
				title={FILTERS_TITLE}
				closeLabel={CLOSE_LABEL}
				resetLabel={RESET_LABEL}
				applyLabel={APPLY_LABEL}>
				<SelectField
					label={CLIENT_LABEL}
					optionalLabel="optional"
					options={CLIENT_OPTIONS}
					value={filters.draft.client ?? ""}
					loadingLabel="Loading clients…"
					loadFailedLabel="Clients could not be loaded."
					loadBrokenLabel="Clients could not be loaded, and trying again won't help."
					retryLabel="Try again"
					noOptionsLabel="No clients."
					onValueChange={next => {
						filters.setDraft(
							"client",
							next === "" ? undefined : next,
						);
					}}
				/>
			</FilterBar.Drawer>
			<FilterBar.Active clearAllLabel={CLEAR_ALL_LABEL}>
				<ActiveFilters
					filters={filters}
					describe={{
						client: describeValue({
							label: CLIENT_LABEL,
						}),
					}}
					label={ACTIVE_LABEL}
					removeLabel={REMOVE_LABEL}
				/>
			</FilterBar.Active>
		</FilterBar.Root>
	);
};

const FilterBarExample = () => <ClientFilterBar />;

const StoredFilterBar = () => (
	<ClientFilterBar stored={storedFilters} />
);

type Canvas = ReturnType<typeof within>;

const clientChip = (client: string) =>
	`${CLIENT_LABEL}: ${client}`;

const chipRemover = (name: string) =>
	name.startsWith(REMOVE_LABEL);

const activeFilters = (canvas: Canvas) =>
	canvas.queryByRole("grid", {
		name: ACTIVE_LABEL,
	});

const clearAll = (canvas: Canvas) =>
	canvas.queryByRole("button", {
		name: CLEAR_ALL_LABEL,
	});

const filterTrigger = (canvas: Canvas) =>
	canvas.getByRole("button", {
		name: (name: string) =>
			name.startsWith(FILTERS_LABEL) &&
			name !== CLEAR_ALL_LABEL,
	});

const isUnfiltered = async (canvas: Canvas) => {
	await waitFor(() =>
		expect(activeFilters(canvas)).not.toBeInTheDocument(),
	);
	await expect(clearAll(canvas)).not.toBeInTheDocument();
	await expect(filterTrigger(canvas)).not.toHaveTextContent(
		"1",
	);
};

const pickClient = async (client: string) => {
	await userEvent.click(
		await screen.findByRole("combobox", {
			name: CLIENT_LABEL,
		}),
	);
	await userEvent.click(
		await screen.findByRole("option", { name: client }),
	);
	await roleGone("listbox");
};

const applyClientFilter = async (
	canvas: Canvas,
	client: string,
) => {
	await userEvent.click(filterTrigger(canvas));
	await pickClient(client);
	await userEvent.click(
		screen.getByRole("button", { name: APPLY_LABEL }),
	);
	await roleGone("dialog", { name: FILTERS_TITLE });
};

const meta = {
	title: "components/filter-bar",
	parameters: {
		layout: "padded",
		designSystem: [
			{
				page: "Patterns",
				section: "Labels pinned to things",
			},
			{
				page: "Patterns",
				section:
					"A dismissable surface says so on its title's line",
			},
		],
	},
	component: FilterBar.Root,
	render: FilterBarExample,
	args: {
		filters: undefined,
		children: null,
	},
	argTypes: {
		filters: { control: false },
		children: { control: false },
	},
} satisfies Meta<typeof FilterBar.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unfiltered: Story = {
	play: async ({ canvas }) => {
		await isUnfiltered(canvas);
	},
};

export const Filtered: Story = {
	render: StoredFilterBar,
	beforeEach: () => {
		storedFilters.write({ client: ANNE });
	},
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("row", {
				name: clientChip(ANNE),
			}),
		).toBeVisible();
		await expect(filterTrigger(canvas)).toHaveTextContent(
			"1",
		);
		await expect(clearAll(canvas)).toBeVisible();
	},
};

export const FilterMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await applyClientFilter(canvas, DAAN);

		await expect(
			canvas.getByRole("row", { name: clientChip(DAAN) }),
		).toBeVisible();
		await expect(filterTrigger(canvas)).toHaveTextContent(
			"1",
		);

		await userEvent.click(
			within(
				canvas.getByRole("row", { name: clientChip(DAAN) }),
			).getByRole("button", { name: chipRemover }),
		);

		await isUnfiltered(canvas);
	},
};

export const FilterKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.tab();
		await userEvent.tab();
		await expect(filterTrigger(canvas)).toHaveFocus();
		await userEvent.keyboard("{Enter}");

		const drawer = await screen.findByRole("dialog", {
			name: FILTERS_TITLE,
		});
		await waitFor(() => expect(drawer).toHaveFocus());
		await userEvent.tab();
		await expect(
			screen.getByRole("button", {
				name: CLOSE_LABEL,
			}),
		).toHaveFocus();
		await userEvent.tab();
		const client = screen.getByRole("combobox", {
			name: CLIENT_LABEL,
		});
		await expect(client).toHaveFocus();
		await userEvent.keyboard("{ArrowDown}");
		await screen.findByRole("listbox");
		await userEvent.keyboard(
			"{ArrowDown}{ArrowDown}{Enter}",
		);
		await roleGone("listbox");
		await expect(client).toHaveTextContent(ANNE);

		await userEvent.tab();
		await expect(
			screen.getByRole("button", {
				name: RESET_LABEL,
			}),
		).toHaveFocus();
		await userEvent.tab();
		await expect(
			screen.getByRole("button", {
				name: APPLY_LABEL,
			}),
		).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await roleGone("dialog", { name: FILTERS_TITLE });

		await expect(filterTrigger(canvas)).toHaveFocus();
		await userEvent.tab();
		await expect(
			canvas.getByRole("row", { name: clientChip(ANNE) }),
		).toHaveFocus();
		await userEvent.keyboard("{Backspace}");

		await isUnfiltered(canvas);
	},
};

export const FilterTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await applyClientFilter(canvas, CHRIS);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: within(
				canvas.getByRole("row", {
					name: clientChip(CHRIS),
				}),
			).getByRole("button", { name: chipRemover }),
		});

		await isUnfiltered(canvas);
	},
};

export const CancelledFilter: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(filterTrigger(canvas));
		await pickClient(ANNE);
		await userEvent.click(
			screen.getByRole("button", {
				name: CLOSE_LABEL,
			}),
		);
		await roleGone("dialog", { name: FILTERS_TITLE });

		await isUnfiltered(canvas);

		await userEvent.click(filterTrigger(canvas));
		await expect(
			await screen.findByRole("combobox", {
				name: CLIENT_LABEL,
			}),
		).toHaveTextContent(ALL_CLIENTS);
	},
};

export const Search: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const search = canvas.getByRole("searchbox", {
			name: SEARCH_LABEL,
		});
		await userEvent.type(search, ANNE);

		await expect(clearAll(canvas)).toBeVisible();
		await expect(
			activeFilters(canvas),
		).not.toBeInTheDocument();

		await userEvent.click(
			canvas.getByRole("button", {
				name: CLEAR_ALL_LABEL,
			}),
		);

		await expect(search).toHaveValue("");
		await isUnfiltered(canvas);
	},
};
