import ArrowDownwardIcon from "@material-design-icons/svg/outlined/arrow_downward.svg?react";
import ArrowUpwardIcon from "@material-design-icons/svg/outlined/arrow_upward.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import ChevronLeftIcon from "@material-design-icons/svg/outlined/chevron_left.svg?react";
import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import FilterIcon from "@material-design-icons/svg/outlined/filter_alt.svg?react";
import FilterOffIcon from "@material-design-icons/svg/outlined/filter_alt_off.svg?react";
import FirstPageIcon from "@material-design-icons/svg/outlined/first_page.svg?react";
import LastPageIcon from "@material-design-icons/svg/outlined/last_page.svg?react";
import RemoveIcon from "@material-design-icons/svg/outlined/remove.svg?react";
import RestoreIcon from "@material-design-icons/svg/outlined/restore.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import UnfoldMoreIcon from "@material-design-icons/svg/outlined/unfold_more.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	QueryClient,
	queryOptions,
} from "@tanstack/react-query";
import {
	type ColumnDef,
	type SortingState,
	useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import { z } from "zod";
import { describeValue } from "../components/active-filters/active-filter-describers.ts";
import { ActiveFilters } from "../components/active-filters/active-filters.tsx";
import { Button } from "../components/button/button.tsx";
import { Drawer } from "../components/drawer/drawer.tsx";
import { FilterBar } from "../components/filter-bar/filter-bar.tsx";
import { Icon } from "../components/icon/icon.tsx";
import { useLocale } from "../components/locale-provider/index.ts";
import type { PaginationPage } from "../components/pagination/pagination.tsx";
import { SelectField } from "../components/select-field/select-field.tsx";
import { Stale } from "../components/stale/stale.tsx";
import {
	type DataViewQueryParams,
	useDataView,
} from "../data-view/use-data-view.ts";
import { useRowSelection } from "../lib/hooks/use-row-selection.ts";
import { memoryStorage } from "../lib/storybook/memory-storage.ts";
import { roleGone } from "../lib/storybook/waits.ts";
import { withQueryClient } from "../lib/storybook/with-query-client.tsx";
import {
	storedPageSize,
	tableStoredValue,
} from "../lib/table-storage.ts";
import {
	DataTable,
	type DataTableRootProps,
} from "./data-table.tsx";
import { useDataTable } from "./data-table-context.tsx";
import { useDataTableView } from "./data-table-parts.tsx";
import { selectionColumn } from "./data-table-selection.tsx";
import {
	dataTableFeatures,
	type DataTableFeatures,
	EMPTY_ROWS,
	PAGE_SIZE_OPTIONS,
} from "./table-features.ts";

type Declaration = Readonly<{
	id: string;
	client: string;
	code: string;
	amount: number;
}>;

const CLIENT_HEADER = "Client";
const CODE_HEADER = "Performance code";
const AMOUNT_HEADER = "Amount (€)";
const CLIENT_FILTER_LABEL = "Client";
const REOPEN_LABEL = "Reopen the table";

const EMPTY_STATE = "No declarations yet.";
const ERROR_LABEL = "The declarations could not be loaded.";
const LOADING_LABEL = "Loading declarations";
const SLOW_LABEL = "This is taking longer than usual.";
const RETRY_LABEL = "Try again";
const PAGE_SIZE_LABEL = "Rows per page";
const FIRST_LABEL = "First page";
const PREVIOUS_LABEL = "Previous page";
const NEXT_LABEL = "Next page";
const LAST_LABEL = "Last page";
const SELECT_PAGE_LABEL = "Select page";
const SELECT_ROW_LABEL = "Select row";
const CLEAR_SELECTION_LABEL = "Clear selection";
const FILTERS_LABEL = "Filters";
const FILTERS_TITLE = "Filter declarations";
const APPLY_LABEL = "Apply";
const CLEAR_ALL_LABEL = "Clear filters";

const pageText = (page: number, pageCount: number) =>
	`Page ${page} of ${pageCount}`;

const indexLabel = ({
	pageIndex,
	pageCount,
}: PaginationPage) => pageText(pageIndex + 1, pageCount);

const selectedLabel = (selected: number, total: number) =>
	`${selected} of ${total} selected`;

const selectAllLabel = (total: number) =>
	`Select all ${total}`;

const declarationsTotal = (count: number) =>
	`${count} declarations`;

const CLIENTS = [
	"Chris Bakker",
	"Anne de Vries",
	"Daan Smit",
	"Bram Jansen",
] as const;

const DECLARATIONS: readonly Declaration[] = Array.from(
	{ length: 30 },
	(_, index) => ({
		id: `declaration-${index + 1}`,
		client: CLIENTS[index % CLIENTS.length] ?? CLIENTS[0],
		code: String(1001 + index),
		amount: 45 + index * 5,
	}),
);

const PAGE_SIZE = 10;

const sortedRows = (
	rows: readonly Declaration[],
	sorting: SortingState,
): readonly Declaration[] => {
	const [sort] = sorting;
	if (sort === undefined) {
		return rows;
	}
	const direction = sort.desc ? -1 : 1;
	return [...rows].sort(
		(a, b) =>
			direction *
			(sort.id === "amount"
				? a.amount - b.amount
				: a.client.localeCompare(b.client)),
	);
};

const AmountCell = ({
	amount,
}: Readonly<{ amount: number }>) =>
	new Intl.NumberFormat(useLocale(), {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);

const clientColumn: ColumnDef<
	DataTableFeatures,
	Declaration
> = {
	accessorKey: "client",
	header: () => CLIENT_HEADER,
	enableSorting: true,
};

const codeColumn: ColumnDef<
	DataTableFeatures,
	Declaration
> = {
	accessorKey: "code",
	header: () => CODE_HEADER,
	enableSorting: false,
};

const amountColumn = (
	enableSorting: boolean,
): ColumnDef<DataTableFeatures, Declaration> => ({
	accessorKey: "amount",
	header: () => AMOUNT_HEADER,
	enableSorting,
	meta: { numeric: true },
	cell: ({ row }) => (
		<AmountCell amount={row.original.amount} />
	),
});

const dataColumns: Array<
	ColumnDef<DataTableFeatures, Declaration>
> = [clientColumn, codeColumn, amountColumn(true)];

const selectColumn = selectionColumn<Declaration>({
	sticky: "start",
	selectPageLabel: SELECT_PAGE_LABEL,
	selectRowLabel: SELECT_ROW_LABEL,
	checkIcon: <Icon svg={CheckIcon} label="" />,
	indeterminateIcon: <Icon svg={RemoveIcon} label="" />,
});

const selectableColumns = [selectColumn, ...dataColumns];

const dataViewColumns = [
	selectColumn,
	clientColumn,
	codeColumn,
	amountColumn(false),
];

const sortAscendingIcon = (
	<Icon svg={ArrowUpwardIcon} label="" />
);
const sortDescendingIcon = (
	<Icon svg={ArrowDownwardIcon} label="" />
);
const unsortedIcon = <Icon svg={UnfoldMoreIcon} label="" />;

const TableContent = () => (
	<DataTable.Content
		emptyState={EMPTY_STATE}
		errorLabel={ERROR_LABEL}
		loadingLabel={LOADING_LABEL}
		slowLabel={SLOW_LABEL}
		retryLabel={RETRY_LABEL}
		sortAscendingIcon={sortAscendingIcon}
		sortDescendingIcon={sortDescendingIcon}
		unsortedIcon={unsortedIcon}
	/>
);

const TableParts = () => {
	const { table, onRetry } = useDataTable<Declaration>();
	const { view } = useDataTableView();

	return (
		<DataTable.Frame>
			<DataTable.Scroller>
				<DataTable.Table>
					<DataTable.LoadingCaption>
						{LOADING_LABEL}
					</DataTable.LoadingCaption>
					<DataTable.Head>
						{table.getHeaderGroups().map(headerGroup => (
							<DataTable.HeaderRow key={headerGroup.id}>
								{headerGroup.headers.map(header => (
									<DataTable.HeaderCell
										key={header.id}
										header={header}>
										{header.column.getCanSort() ? (
											<DataTable.SortButton
												header={header}
												sortAscendingIcon={
													sortAscendingIcon
												}
												sortDescendingIcon={
													sortDescendingIcon
												}
											/>
										) : undefined}
									</DataTable.HeaderCell>
								))}
							</DataTable.HeaderRow>
						))}
					</DataTable.Head>
					<DataTable.Body>
						{view === "ready" ? (
							table.getRowModel().rows.map(row => (
								<DataTable.Row key={row.id} row={row}>
									{row.getAllCells().map(cell => (
										<DataTable.Cell
											key={cell.id}
											cell={cell}
										/>
									))}
								</DataTable.Row>
							))
						) : view === "loading" ? (
							<DataTable.PlaceholderRows />
						) : (
							<DataTable.StateRow>
								{view === "error" ? (
									<DataTable.ErrorMessage>
										{ERROR_LABEL}
									</DataTable.ErrorMessage>
								) : (
									EMPTY_STATE
								)}
							</DataTable.StateRow>
						)}
					</DataTable.Body>
				</DataTable.Table>
			</DataTable.Scroller>
			<DataTable.StaleOverlay>
				<Stale.Message>{SLOW_LABEL}</Stale.Message>
				{onRetry ? (
					<Stale.Retry onRetry={onRetry}>
						{RETRY_LABEL}
					</Stale.Retry>
				) : null}
			</DataTable.StaleOverlay>
		</DataTable.Frame>
	);
};

const TablePagination = () => (
	<DataTable.Pagination
		pageSizeLabel={PAGE_SIZE_LABEL}
		indexLabel={indexLabel}
		firstLabel={FIRST_LABEL}
		previousLabel={PREVIOUS_LABEL}
		nextLabel={NEXT_LABEL}
		lastLabel={LAST_LABEL}
		firstIcon={<Icon svg={FirstPageIcon} label="" />}
		previousIcon={<Icon svg={ChevronLeftIcon} label="" />}
		nextIcon={<Icon svg={ChevronRightIcon} label="" />}
		lastIcon={<Icon svg={LastPageIcon} label="" />}
		checkIcon={<Icon svg={CheckIcon} label="" />}
		expandIcon={<Icon svg={ExpandMoreIcon} label="" />}
	/>
);

type SelectionBarProps = Readonly<{ totalRows: number }>;

const SelectionBar = ({ totalRows }: SelectionBarProps) => (
	<DataTable.SelectionBar
		totalRows={totalRows}
		total={declarationsTotal(totalRows)}
		countLabel={selectedLabel}
		clearLabel={CLEAR_SELECTION_LABEL}
		selectAllLabel={selectAllLabel}
	/>
);

type DataTableExampleProps = Pick<
	DataTableRootProps<Declaration>,
	"status" | "isFetching" | "onRetry"
>;

type DeclarationTableProps = DataTableExampleProps &
	Readonly<{
		rows: readonly Declaration[];
		selectable: boolean;
		composed?: boolean;
	}>;

const DeclarationTable = ({
	status,
	isFetching,
	onRetry,
	rows,
	selectable,
	composed = false,
}: DeclarationTableProps) => {
	const selection = useRowSelection();
	const table = useTable<DataTableFeatures, Declaration>({
		features: dataTableFeatures,
		data: EMPTY_ROWS,
		columns: selectable ? selectableColumns : dataColumns,
		getRowId: row => row.id,
		manualPagination: true,
		manualSorting: true,
		initialState: {
			pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
		},
	});
	const { pagination, sorting } = table.state;
	const start = pagination.pageIndex * pagination.pageSize;

	table.setOptions(prev => ({
		...prev,
		data: sortedRows(rows, sorting).slice(
			start,
			start + pagination.pageSize,
		),
		rowCount: rows.length,
	}));

	return (
		<DataTable.Root
			table={table}
			selection={selectable ? selection : undefined}
			status={status}
			isFetching={isFetching}
			onRetry={onRetry}>
			{selectable ? (
				<SelectionBar totalRows={rows.length} />
			) : null}
			{composed ? <TableParts /> : <TableContent />}
			<TablePagination />
		</DataTable.Root>
	);
};

const DataTableExample = (props: DataTableExampleProps) => (
	<DeclarationTable
		{...props}
		rows={DECLARATIONS}
		selectable={false}
	/>
);

const EmptyDataTable = (props: DataTableExampleProps) => (
	<DeclarationTable
		{...props}
		rows={EMPTY_ROWS}
		selectable={false}
	/>
);

const ComposedDataTable = (
	props: DataTableExampleProps,
) => (
	<DeclarationTable
		{...props}
		rows={DECLARATIONS}
		selectable={false}
		composed
	/>
);

const SelectableDataTable = (
	props: DataTableExampleProps,
) => (
	<DeclarationTable
		{...props}
		rows={DECLARATIONS}
		selectable
	/>
);

const DATA_VIEW_TABLE_ID = "story-data-table";

const [CHRIS, ANNE, DAAN] = CLIENTS;

type ClientFilters = Readonly<{ client?: string }>;

const storage = memoryStorage();

const storedFilters = tableStoredValue<ClientFilters>(
	DATA_VIEW_TABLE_ID,
	"filters",
	{
		schema: z.object({ client: z.string().optional() }),
		fallback: {},
	},
	storage,
);

const storedSize = storedPageSize(
	DATA_VIEW_TABLE_ID,
	PAGE_SIZE_OPTIONS,
	PAGE_SIZE,
	storage,
);

const freshStorage = () => {
	storedSize.clear();
	storedFilters.clear();
};

const rowsOf = (client: string) =>
	DECLARATIONS.filter(row => row.client === client).length;

type DeclarationPage = Readonly<{
	items: Declaration[];
	totalCount: number;
}>;

const declarationPage = ({
	filters,
	search,
	pagination,
	sorting,
}: DataViewQueryParams<ClientFilters>): DeclarationPage => {
	const matches = DECLARATIONS.filter(
		row =>
			(filters.client === undefined ||
				row.client === filters.client) &&
			row.client.includes(search),
	);
	const start = pagination.pageIndex * pagination.pageSize;
	return {
		items: sortedRows(matches, sorting).slice(
			start,
			start + pagination.pageSize,
		),
		totalCount: matches.length,
	};
};

const CLIENT_OPTIONS = [
	{ value: "", label: "All clients" },
	...CLIENTS.map(client => ({
		value: client,
		label: client,
	})),
];

type DataViewTableProps = Readonly<{
	failingPage?: number;
}>;

const DataViewTable = ({
	failingPage,
}: DataViewTableProps) => {
	const { filters, table, query, selection } = useDataView({
		tableId: DATA_VIEW_TABLE_ID,
		initialFilters: {},
		storedFilters,
		storage,
		columns: dataViewColumns,
		getRowId: row => row.id,
		initialPagination: {
			pageIndex: 0,
			pageSize: PAGE_SIZE,
		},
		queryOptions: params =>
			queryOptions({
				queryKey: [DATA_VIEW_TABLE_ID, params],
				queryFn: () =>
					params.pagination.pageIndex + 1 === failingPage
						? Promise.reject(new Error(DATA_VIEW_TABLE_ID))
						: Promise.resolve(declarationPage(params)),
			}),
		getRows: data => data.items,
		getRowCount: data => data.totalCount,
	});

	return (
		<>
			<FilterBar.Root filters={filters}>
				<FilterBar.Search
					label="Search by client"
					clearLabel="Clear search"
					clearIcon={<Icon svg={CloseIcon} label="" />}
					icon={<Icon svg={SearchIcon} label="" />}
					optionalLabel="optional"
				/>
				<FilterBar.Drawer swipeDirection="right">
					<FilterBar.Trigger
						icon={<Icon svg={FilterIcon} label="" />}>
						{FILTERS_LABEL}
						<FilterBar.Badge />
					</FilterBar.Trigger>
					<FilterBar.Content>
						<Drawer.Header>
							<Drawer.Title>{FILTERS_TITLE}</Drawer.Title>
							<Drawer.CloseButton
								closeLabel="Close"
								icon={<Icon svg={CloseIcon} label="" />}
							/>
						</Drawer.Header>
						<FilterBar.Fields>
							<SelectField
								label={CLIENT_FILTER_LABEL}
								optionalLabel="optional"
								options={CLIENT_OPTIONS}
								value={filters.draft.client ?? ""}
								loadingLabel="Loading clients…"
								loadFailedLabel="Clients could not be loaded."
								loadBrokenLabel="Clients could not be loaded, and trying again won't help."
								retryLabel={RETRY_LABEL}
								noOptionsLabel="No clients."
								checkIcon={<Icon svg={CheckIcon} label="" />}
								onValueChange={next => {
									filters.setDraft(
										"client",
										next === "" ? undefined : next,
									);
								}}
							/>
						</FilterBar.Fields>
						<FilterBar.Footer>
							<FilterBar.Reset
								icon={<Icon svg={RestoreIcon} label="" />}>
								Reset
							</FilterBar.Reset>
							<FilterBar.Apply
								icon={<Icon svg={CheckIcon} label="" />}>
								{APPLY_LABEL}
							</FilterBar.Apply>
						</FilterBar.Footer>
					</FilterBar.Content>
				</FilterBar.Drawer>
				<FilterBar.Active>
					<ActiveFilters
						filters={filters}
						describe={{
							client: describeValue({
								label: CLIENT_FILTER_LABEL,
							}),
						}}
						label="Active filters"
						removeLabel="Remove"
						removeIcon={<Icon svg={CloseIcon} label="" />}
					/>
					<FilterBar.ClearAll
						icon={<Icon svg={FilterOffIcon} label="" />}>
						{CLEAR_ALL_LABEL}
					</FilterBar.ClearAll>
				</FilterBar.Active>
			</FilterBar.Root>
			<DataTable.Root
				table={table}
				selection={selection}
				status={query.status}
				isFetching={query.isFetching}
				onRetry={() => void query.refetch()}>
				<SelectionBar totalRows={table.getRowCount()} />
				<TableContent />
				<TablePagination />
			</DataTable.Root>
		</>
	);
};

const DataViewExample = () => {
	const [opened, setOpened] = useState(0);

	return (
		<>
			<Button
				onClick={() => {
					setOpened(count => count + 1);
				}}>
				{REOPEN_LABEL}
			</Button>
			<DataViewTable key={opened} />
		</>
	);
};

const FailingPageExample = () => (
	<DataViewTable failingPage={2} />
);

type Canvas = ReturnType<typeof within>;

const bodyRows = (canvas: Canvas) =>
	canvas.getAllByRole("row").slice(1);

const firstRow = (canvas: Canvas) => {
	const [row] = bodyRows(canvas);
	if (row === undefined) {
		throw new Error("The table renders no body rows.");
	}
	return row;
};

const rowCheckbox = (canvas: Canvas, code: string) =>
	within(
		canvas.getByRole("row", { name: new RegExp(code) }),
	).getByRole("checkbox", {
		name: SELECT_ROW_LABEL,
	});

const pageCheckbox = (canvas: Canvas) =>
	canvas.getByRole("checkbox", {
		name: SELECT_PAGE_LABEL,
	});

const selectionBarStatus = (canvas: Canvas) => {
	const [status] = canvas.getAllByRole("status");
	if (status === undefined) {
		throw new Error("The table renders no selection bar.");
	}
	return status;
};

const selectionStatus = (
	canvas: Canvas,
	selected: number,
) =>
	waitFor(() =>
		expect(selectionBarStatus(canvas)).toHaveTextContent(
			selectedLabel(selected, DECLARATIONS.length),
		),
	);

const sortButton = (canvas: Canvas) =>
	canvas.getByRole("button", {
		name: CLIENT_HEADER,
	});

const clientHeader = (canvas: Canvas) =>
	canvas.getByRole("columnheader", {
		name: CLIENT_HEADER,
	});

const pageStatus = async (canvas: Canvas, page: number) => {
	const index = canvas.getByText(pageText(page, 3));
	await expect(index).toBeVisible();
	await expect(index).toHaveAttribute("role", "status");
};

const unavailable = (button: HTMLElement) =>
	expect(button).toHaveAttribute("aria-disabled", "true");

const tableRows = (canvas: Canvas) =>
	within(canvas.getByRole("table"))
		.getAllByRole("row")
		.slice(1);

const showsRows = (canvas: Canvas, count: number) =>
	waitFor(() =>
		expect(tableRows(canvas)).toHaveLength(count),
	);

const everyRowIs = (canvas: Canvas, client: string) =>
	waitFor(() =>
		expect(
			tableRows(canvas).every(row =>
				row.textContent.includes(client),
			),
		).toBe(true),
	);

const totalIs = (canvas: Canvas, count: number) =>
	waitFor(() =>
		expect(selectionBarStatus(canvas)).toHaveTextContent(
			declarationsTotal(count),
		),
	);

const clientChip = (client: string) =>
	`${CLIENT_FILTER_LABEL}: ${client}`;

const filterTrigger = (canvas: Canvas) =>
	canvas.getByRole("button", {
		name: (name: string) =>
			name.startsWith(FILTERS_LABEL) &&
			name !== CLEAR_ALL_LABEL,
	});

const applyClientFilter = async (
	canvas: Canvas,
	client: string,
) => {
	await userEvent.click(filterTrigger(canvas));
	await userEvent.click(
		await screen.findByRole("combobox", {
			name: CLIENT_FILTER_LABEL,
		}),
	);
	await userEvent.click(
		await screen.findByRole("option", { name: client }),
	);
	await roleGone("listbox");
	await userEvent.click(
		screen.getByRole("button", { name: APPLY_LABEL }),
	);
	await roleGone("dialog");
};

const reopen = (canvas: Canvas) =>
	userEvent.click(
		canvas.getByRole("button", {
			name: REOPEN_LABEL,
		}),
	);

const retry = fn().mockName("retry");

const meta = {
	title: "components/data-table",
	parameters: {
		layout: "padded",
		test: { clearMocks: true },
		designSystem: [
			{
				page: "Foundation/Motion",
				section:
					"A wait whose shape is known ahead of its content is drawn as that shape",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Inert beats disabled for content that is only stale",
			},
			{ component: "components/pagination" },
		],
	},
	component: DataTable.Root,
	render: DataTableExample,
	args: {
		table: undefined,
		children: null,
		status: "success",
		isFetching: false,
		onRetry: retry,
	},
	argTypes: {
		table: { control: false },
		selection: { control: false },
		children: { control: false },
		status: {
			control: "radio",
			options: ["pending", "error", "success"],
		},
	},
} satisfies Meta<typeof DataTable.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
	play: async ({ canvas }) => {
		await expect(bodyRows(canvas)).toHaveLength(PAGE_SIZE);
		await expect(firstRow(canvas)).toHaveTextContent(CHRIS);
		await pageStatus(canvas, 1);
	},
};

export const Loading: Story = {
	args: { status: "pending" },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("table")).toHaveAttribute(
			"aria-busy",
			"true",
		);
		await expect(
			canvas.getByText(LOADING_LABEL),
		).toBeInTheDocument();
	},
};

export const Empty: Story = {
	render: EmptyDataTable,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText(EMPTY_STATE),
		).toBeVisible();
	},
};

export const Failed: Story = {
	args: { status: "error" },
	render: EmptyDataTable,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("alert"),
		).toHaveTextContent(ERROR_LABEL);
	},
};

export const Refreshing: Story = {
	parameters: {
		a11y: {
			config: {
				rules: [
					{
						id: "color-contrast-apca-bronze",
						enabled: false,
					},
					{
						id: "color-contrast-apca-custom",
						enabled: false,
					},
				],
			},
		},
		docs: {
			description: {
				story:
					"Busy content is dimmed on purpose; it is not meant to be read while the refresh runs.",
			},
		},
	},
	args: { isFetching: true },
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(
				canvas.getByRole("table").closest("[aria-busy]"),
			).toHaveAttribute("aria-busy", "true"),
		);
	},
};

export const RefreshFailed: Story = {
	tags: ["!dev", "!autodocs"],
	args: { status: "error" },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("alert"),
		).toHaveTextContent(ERROR_LABEL);
		await expect(bodyRows(canvas)).toHaveLength(PAGE_SIZE);

		await userEvent.click(
			canvas.getByRole("button", {
				name: RETRY_LABEL,
			}),
		);

		await expect(retry).toHaveBeenCalledOnce();
	},
};

export const ComposedParts: Story = {
	render: ComposedDataTable,
	play: async ({ canvas }) => {
		await expect(bodyRows(canvas)).toHaveLength(PAGE_SIZE);
		await expect(firstRow(canvas)).toHaveTextContent(CHRIS);
		await expect(sortButton(canvas)).toBeVisible();
	},
};

export const ComposedSortMouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: ComposedDataTable,
	play: async ({ canvas }) => {
		await userEvent.click(sortButton(canvas));
		await expect(clientHeader(canvas)).toHaveAttribute(
			"aria-sort",
			"ascending",
		);
		await expect(firstRow(canvas)).toHaveTextContent(ANNE);
	},
};

export const Selectable: Story = {
	render: SelectableDataTable,
	play: async ({ canvas }) => {
		await expect(
			selectionBarStatus(canvas),
		).toHaveTextContent(
			declarationsTotal(DECLARATIONS.length),
		);
		await expect(pageCheckbox(canvas)).not.toBeChecked();
	},
};

export const SelectMouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: SelectableDataTable,
	play: async ({ canvas }) => {
		await userEvent.click(rowCheckbox(canvas, "1001"));
		await selectionStatus(canvas, 1);
		await expect(pageCheckbox(canvas)).toHaveAttribute(
			"aria-checked",
			"mixed",
		);

		await userEvent.click(pageCheckbox(canvas));
		await selectionStatus(canvas, PAGE_SIZE);
		await expect(pageCheckbox(canvas)).toBeChecked();

		await userEvent.click(
			await canvas.findByRole("button", {
				name: selectAllLabel(DECLARATIONS.length),
			}),
		);
		await selectionStatus(canvas, DECLARATIONS.length);

		await userEvent.click(
			canvas.getByRole("button", {
				name: NEXT_LABEL,
			}),
		);
		await expect(rowCheckbox(canvas, "1011")).toBeChecked();

		await userEvent.click(rowCheckbox(canvas, "1011"));
		await selectionStatus(canvas, DECLARATIONS.length - 1);

		await userEvent.click(
			canvas.getByRole("button", {
				name: CLEAR_SELECTION_LABEL,
			}),
		);
		await waitFor(() =>
			expect(selectionBarStatus(canvas)).toHaveTextContent(
				declarationsTotal(DECLARATIONS.length),
			),
		);
		await expect(
			rowCheckbox(canvas, "1012"),
		).not.toBeChecked();
	},
};

export const SelectKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	render: SelectableDataTable,
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(pageCheckbox(canvas)).toHaveFocus();
		await userEvent.keyboard(" ");
		await selectionStatus(canvas, PAGE_SIZE);

		await userEvent.keyboard(" ");
		await waitFor(() =>
			expect(pageCheckbox(canvas)).not.toBeChecked(),
		);

		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();
		await expect(rowCheckbox(canvas, "1001")).toHaveFocus();
		await userEvent.keyboard(" ");
		await selectionStatus(canvas, 1);
	},
};

export const SelectTouch: Story = {
	tags: ["!dev", "!autodocs"],
	render: SelectableDataTable,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: rowCheckbox(canvas, "1002"),
		});
		await selectionStatus(canvas, 1);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: rowCheckbox(canvas, "1002"),
		});
		await expect(
			rowCheckbox(canvas, "1002"),
		).not.toBeChecked();
	},
};

export const SortMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(sortButton(canvas));
		await expect(clientHeader(canvas)).toHaveAttribute(
			"aria-sort",
			"ascending",
		);
		await expect(firstRow(canvas)).toHaveTextContent(ANNE);

		await userEvent.click(sortButton(canvas));
		await expect(clientHeader(canvas)).toHaveAttribute(
			"aria-sort",
			"descending",
		);
		await expect(firstRow(canvas)).toHaveTextContent(DAAN);
	},
};

export const SortKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(sortButton(canvas)).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await expect(clientHeader(canvas)).toHaveAttribute(
			"aria-sort",
			"ascending",
		);
		await userEvent.keyboard(" ");
		await expect(clientHeader(canvas)).toHaveAttribute(
			"aria-sort",
			"descending",
		);
		await expect(firstRow(canvas)).toHaveTextContent(DAAN);
	},
};

export const SortTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: sortButton(canvas),
		});

		await expect(clientHeader(canvas)).toHaveAttribute(
			"aria-sort",
			"ascending",
		);
	},
};

export const Paging: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const pageButton = (name: string) =>
			canvas.getByRole("button", { name });
		const first = pageButton(FIRST_LABEL);
		const previous = pageButton(PREVIOUS_LABEL);
		const next = pageButton(NEXT_LABEL);
		const last = pageButton(LAST_LABEL);
		await unavailable(first);
		await unavailable(previous);

		await userEvent.click(next);
		await pageStatus(canvas, 2);
		await expect(firstRow(canvas)).toHaveTextContent(
			"1011",
		);

		await userEvent.click(next);
		await pageStatus(canvas, 3);
		await unavailable(next);
		await unavailable(last);
		await expect(next).toHaveFocus();

		await userEvent.click(first);
		await pageStatus(canvas, 1);

		await userEvent.click(last);
		await pageStatus(canvas, 3);

		await userEvent.click(previous);
		await pageStatus(canvas, 2);

		await userEvent.click(
			canvas.getByRole("combobox", {
				name: PAGE_SIZE_LABEL,
			}),
		);
		await userEvent.click(
			await screen.findByRole("option", { name: "25" }),
		);
		await waitFor(() =>
			expect(
				canvas.getByText(pageText(1, 2)),
			).toBeVisible(),
		);
		await expect(bodyRows(canvas)).toHaveLength(25);
		await roleGone("listbox");
	},
};

export const StoredPageSize: Story = {
	tags: ["!dev", "!autodocs"],
	render: DataViewExample,
	beforeEach: freshStorage,
	play: async ({ canvas }) => {
		await showsRows(canvas, PAGE_SIZE);
		await userEvent.click(
			canvas.getByRole("combobox", {
				name: PAGE_SIZE_LABEL,
			}),
		);
		await userEvent.click(
			await screen.findByRole("option", { name: "25" }),
		);
		await roleGone("listbox");
		await showsRows(canvas, 25);

		await reopen(canvas);

		await showsRows(canvas, 25);
		await expect(
			canvas.getByRole("combobox", {
				name: PAGE_SIZE_LABEL,
			}),
		).toHaveTextContent("25");
	},
};

export const Sorting: Story = {
	tags: ["!dev", "!autodocs"],
	render: DataViewExample,
	beforeEach: freshStorage,
	play: async ({ canvas }) => {
		await showsRows(canvas, PAGE_SIZE);
		await expect(
			canvas.queryByRole("button", {
				name: CODE_HEADER,
			}),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByRole("button", {
				name: AMOUNT_HEADER,
			}),
		).not.toBeInTheDocument();

		await userEvent.click(sortButton(canvas));

		await expect(clientHeader(canvas)).toHaveAttribute(
			"aria-sort",
			"ascending",
		);
		await waitFor(() =>
			expect(tableRows(canvas)[0]).toHaveTextContent(ANNE),
		);
	},
};

export const SelectionResetsOnFilter: Story = {
	tags: ["!dev", "!autodocs"],
	render: DataViewExample,
	beforeEach: freshStorage,
	play: async ({ canvas }) => {
		await showsRows(canvas, PAGE_SIZE);
		await userEvent.click(pageCheckbox(canvas));
		await selectionStatus(canvas, PAGE_SIZE);

		await applyClientFilter(canvas, ANNE);

		await everyRowIs(canvas, ANNE);
		await totalIs(canvas, rowsOf(ANNE));
		await expect(pageCheckbox(canvas)).not.toBeChecked();
	},
};

export const FilterResetsPageAndIsStored: Story = {
	tags: ["!dev", "!autodocs"],
	render: DataViewExample,
	beforeEach: freshStorage,
	play: async ({ canvas }) => {
		await showsRows(canvas, PAGE_SIZE);
		await userEvent.click(
			canvas.getByRole("button", {
				name: NEXT_LABEL,
			}),
		);
		await waitFor(() => pageStatus(canvas, 2));

		await applyClientFilter(canvas, DAAN);

		await everyRowIs(canvas, DAAN);
		await expect(
			canvas.getByText(pageText(1, 1)),
		).toBeVisible();

		await reopen(canvas);

		await expect(
			await canvas.findByRole("row", {
				name: clientChip(DAAN),
			}),
		).toBeVisible();
		await everyRowIs(canvas, DAAN);
		await totalIs(canvas, rowsOf(DAAN));
	},
};

export const PageFails: Story = {
	tags: ["!dev", "!autodocs"],
	render: FailingPageExample,
	beforeEach: freshStorage,
	decorators: [
		withQueryClient(
			() =>
				new QueryClient({
					defaultOptions: { queries: { retry: false } },
				}),
		),
	],
	play: async ({ canvas }) => {
		await showsRows(canvas, PAGE_SIZE);
		await userEvent.click(
			canvas.getByRole("button", {
				name: NEXT_LABEL,
			}),
		);

		await expect(
			await canvas.findByRole("alert"),
		).toHaveTextContent(ERROR_LABEL);
		await expect(
			canvas.getByRole("button", {
				name: RETRY_LABEL,
			}),
		).toBeVisible();
		await showsRows(canvas, PAGE_SIZE);
		await expect(tableRows(canvas)[0]).toHaveTextContent(
			"1001",
		);
	},
};
