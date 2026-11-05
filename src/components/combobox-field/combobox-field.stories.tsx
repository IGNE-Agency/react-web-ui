import BlockIcon from "@material-design-icons/svg/outlined/block.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	queryOptions,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { type ReactElement, useState } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import {
	OPTIONS_LOAD_LABELS,
	OPTIONS_LOADS,
} from "../../lib/storybook/options-load.ts";
import {
	optionHighlighted,
	roleGone,
} from "../../lib/storybook/waits.ts";
import { Icon } from "../icon/index.ts";
import {
	ComboboxField,
	type ComboboxFieldProps,
} from "./index.ts";
import { ComboboxItemQueries } from "./react-query.tsx";

const LABEL = "Status";
const MULTIPLE_LABEL = "Statuses";
const SEARCH_LABEL = "Search";
const {
	loadingLabel: LOADING_LABEL,
	loadFailedLabel: LOAD_FAILED_LABEL,
	loadBrokenLabel: LOAD_BROKEN_LABEL,
	retryLabel: RETRY_LABEL,
	noOptionsLabel: NO_OPTIONS_LABEL,
} = OPTIONS_LOAD_LABELS;
const NO_RESULTS_LABEL = "No results.";
const SELECTED_LABEL = "Selected statuses";
const PLACEHOLDER = "Choose…";

const COPY = {
	optionalLabel: "optional",
	...OPTIONS_LOAD_LABELS,
	noResultsLabel: NO_RESULTS_LABEL,
	searchLabel: SEARCH_LABEL,
	loadingMoreLabel: "Loading more options…",
	resultsLabel: (count: number) => `${count} results`,
	icon: <Icon svg={ExpandMoreIcon} label="" />,
	checkIcon: <Icon svg={CheckIcon} label="" />,
} as const;

const MULTIPLE_COPY = {
	selectedLabel: SELECTED_LABEL,
	removeLabel: "Remove",
	removeHint: (itemLabel: string) => `Remove ${itemLabel}`,
	removeIcon: (
		<Icon svg={CloseIcon} label="" size={0.875} />
	),
} as const;

const STATUS_LABEL: Readonly<Record<string, string>> = {
	open: "Open",
	sent: "Sent",
	paid: "Paid",
	rejected: "Rejected",
};

const STATUSES = Object.keys(STATUS_LABEL);

const statusLabel = (status: string): string =>
	STATUS_LABEL[status] ?? status;

const valueChanged =
	fn<
		(value: string | readonly string[] | null) => void
	>().mockName("valueChanged");

type StatusComboboxProps = ComboboxFieldProps<string>;

const ControlledComboboxField = (
	args: StatusComboboxProps,
): ReactElement => {
	const [, updateArgs] = useArgs();
	const record = (
		value: string | readonly string[] | null,
	) => {
		valueChanged(value);
		updateArgs({ value });
	};

	return <ComboboxField {...args} onValueChange={record} />;
};

const UncontrolledComboboxField = (
	args: StatusComboboxProps,
): ReactElement => <ComboboxField {...args} />;

const tag = (name: string) =>
	screen.getByRole("row", { name });

const searchBox = () =>
	screen.findByRole("combobox", { name: SEARCH_LABEL });

const searchFocused = () =>
	waitFor(() =>
		expect(
			screen.getByRole("combobox", { name: SEARCH_LABEL }),
		).toHaveFocus(),
	);

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Patterns",
				section:
					"Every popup that lists things shares one surface and one row",
			},
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/field" },
		],
	},
	component: ComboboxField<string>,
	render: ControlledComboboxField,
	args: {
		...COPY,
		label: LABEL,
		placeholder: PLACEHOLDER,
		items: STATUSES,
		itemKey: status => status,
		itemToStringLabel: statusLabel,
		children: statusLabel,
		value: null,
		load: mappedArg(OPTIONS_LOADS, "loaded"),
		onValueChange: valueChanged,
	},
	argTypes: {
		value: { control: "object" },
		load: {
			options: Object.keys(OPTIONS_LOADS),
			mapping: OPTIONS_LOADS,
			control: "radio",
		},
	},
} satisfies Meta<typeof ComboboxField<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

const MULTIPLE = {
	...MULTIPLE_COPY,
	multiple: true,
	label: MULTIPLE_LABEL,
	value: [],
} as const;

export const Placeholder: Story = {};

export const Filled: Story = {
	args: { value: "sent" },
};

export const Disabled: Story = {
	args: { value: "sent", disabled: true },
};

export const ReadOnly: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: "sent", readOnly: true },
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("combobox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();
		await userEvent.keyboard("{ArrowDown}");
		await userEvent.click(trigger);

		await expect(
			screen.queryByRole("listbox"),
		).not.toBeInTheDocument();
		await expect(valueChanged).not.toHaveBeenCalled();
	},
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: { errors: ["Choose a status."] },
};

export const Pending: Story = {
	args: { value: "sent", pending: true },
};

export const WithDescription: Story = {
	args: {
		description: "The status the declaration is in now.",
	},
};

export const Open: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: "sent" },
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: LABEL }),
		);

		await expect(
			await screen.findByRole("option", {
				name: statusLabel("sent"),
			}),
		).toHaveAttribute("aria-selected", "true");
		await searchFocused();
	},
};

export const Loading: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		items: [],
		load: mappedArg(OPTIONS_LOADS, "loading"),
	},
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: LABEL }),
		);

		await waitFor(() =>
			expect(screen.getByText(LOADING_LABEL)).toBeVisible(),
		);
	},
};

export const Empty: Story = {
	tags: ["!dev", "!autodocs"],
	args: { items: [] },
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: LABEL }),
		);

		await waitFor(() =>
			expect(
				screen.getByText(NO_OPTIONS_LABEL),
			).toBeVisible(),
		);
	},
};

export const NoResults: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: LABEL }),
		);
		await userEvent.type(await searchBox(), "xyz");

		await waitFor(() =>
			expect(
				screen.getByText(NO_RESULTS_LABEL),
			).toBeVisible(),
		);
		await expect(
			screen.queryByRole("option"),
		).not.toBeInTheDocument();
	},
};

export const Failed: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		items: [],
		load: mappedArg(OPTIONS_LOADS, "failed"),
	},
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: LABEL }),
		);
		await waitFor(() =>
			expect(
				screen.getByText(LOAD_FAILED_LABEL),
			).toBeVisible(),
		);

		await userEvent.click(
			screen.getByRole("button", { name: RETRY_LABEL }),
		);

		await expect(
			OPTIONS_LOADS.failed.retry,
		).toHaveBeenCalledOnce();
		await searchFocused();
	},
};

export const Broken: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		items: [],
		load: mappedArg(OPTIONS_LOADS, "broken"),
	},
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: LABEL }),
		);

		await waitFor(() =>
			expect(
				screen.getByText(LOAD_BROKEN_LABEL),
			).toBeVisible(),
		);
		await expect(
			screen.queryByRole("button", { name: RETRY_LABEL }),
		).not.toBeInTheDocument();
	},
};

export const Multiple: Story = {
	args: MULTIPLE,
};

export const MultipleFilled: Story = {
	args: { ...MULTIPLE, value: ["open", "paid"] },
};

export const MultipleReadOnly: Story = {
	args: {
		...MULTIPLE,
		value: ["open", "paid"],
		readOnly: true,
	},
};

export const ValueSpoken: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: "sent" },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("combobox", { name: LABEL }),
		).toHaveTextContent(statusLabel("sent"));
	},
};

export const MultipleValueSpoken: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...MULTIPLE, value: ["open", "paid"] },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("combobox", {
				name: MULTIPLE_LABEL,
			}),
		).toHaveTextContent(
			`${statusLabel("open")}, ${statusLabel("paid")}`,
		);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: UncontrolledComboboxField,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("combobox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{ArrowDown}");
		await searchFocused();
		await optionHighlighted(statusLabel("open"));

		await userEvent.keyboard("{Escape}");
		await roleGone("listbox");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await searchFocused();
		await userEvent.keyboard(
			statusLabel("paid").slice(0, 3),
		);
		await waitFor(() =>
			expect(screen.getAllByRole("option")).toHaveLength(1),
		);
		await optionHighlighted(statusLabel("paid"));

		await userEvent.keyboard("{Backspace>3/}");
		await waitFor(() =>
			expect(screen.getAllByRole("option")).toHaveLength(
				STATUSES.length,
			),
		);
		await optionHighlighted(statusLabel("open"));
		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await optionHighlighted(statusLabel("paid"));
		await userEvent.keyboard("{ArrowUp}");
		await optionHighlighted(statusLabel("sent"));
		await searchFocused();

		await userEvent.keyboard("{Enter}");
		await roleGone("listbox");

		await expect(trigger).toHaveFocus();
		await expect(
			canvas.getByText(statusLabel("sent")),
		).toBeVisible();
		await expect(valueChanged).toHaveBeenCalledOnce();
		await expect(valueChanged).toHaveBeenCalledWith("sent");
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: UncontrolledComboboxField,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: LABEL }),
		);
		await userEvent.click(
			await screen.findByRole("option", {
				name: statusLabel("paid"),
			}),
		);
		await roleGone("listbox");

		await expect(
			canvas.getByText(statusLabel("paid")),
		).toBeVisible();
		await expect(valueChanged).toHaveBeenCalledWith("paid");
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: UncontrolledComboboxField,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("combobox", {
				name: LABEL,
			}),
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await screen.findByRole("option", {
				name: statusLabel("open"),
			}),
		});
		await roleGone("listbox");

		await expect(
			canvas.getByText(statusLabel("open")),
		).toBeVisible();
		await expect(valueChanged).toHaveBeenCalledWith("open");
	},
};

export const MultipleKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...MULTIPLE, value: undefined },
	render: UncontrolledComboboxField,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("combobox", {
			name: MULTIPLE_LABEL,
		});

		await userEvent.tab();
		await userEvent.keyboard("{ArrowDown}");
		await searchFocused();
		await optionHighlighted(statusLabel("open"));
		await userEvent.keyboard(
			"{Enter}{ArrowDown}{ArrowDown}",
		);
		await optionHighlighted(statusLabel("paid"));
		await userEvent.keyboard("{Enter}");
		await expect(valueChanged).toHaveBeenLastCalledWith([
			"open",
			"paid",
		]);

		await userEvent.keyboard("{Escape}");
		await roleGone("listbox");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{ArrowLeft}");
		await expect(tag(statusLabel("paid"))).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(trigger).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(tag(statusLabel("open"))).toHaveFocus();

		await userEvent.keyboard("{Backspace}");
		await expect(valueChanged).toHaveBeenLastCalledWith([
			"paid",
		]);
		await waitFor(() =>
			expect(tag(statusLabel("paid"))).toHaveFocus(),
		);

		await userEvent.keyboard("{Delete}");
		await expect(valueChanged).toHaveBeenLastCalledWith([]);
		await expect(trigger).toHaveFocus();
	},
};

export const MultipleMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		...MULTIPLE,
		value: undefined,
		defaultValue: ["sent"],
	},
	render: UncontrolledComboboxField,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: `Remove ${statusLabel("sent")}`,
			}),
		);

		await expect(valueChanged).toHaveBeenLastCalledWith([]);
		await expect(
			screen.queryByRole("row", {
				name: statusLabel("sent"),
			}),
		).not.toBeInTheDocument();
		await expect(
			canvas.getByRole("combobox", {
				name: MULTIPLE_LABEL,
			}),
		).toHaveFocus();
	},
};

export const MultipleTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...MULTIPLE, value: undefined },
	render: UncontrolledComboboxField,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("combobox", {
				name: MULTIPLE_LABEL,
			}),
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await screen.findByRole("option", {
				name: statusLabel("paid"),
			}),
		});

		await expect(valueChanged).toHaveBeenLastCalledWith([
			"paid",
		]);
	},
};

export const MultipleTab: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...MULTIPLE, value: ["open", "paid"] },
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(tag(statusLabel("open"))).toHaveFocus();
		await expect(
			canvas.getByRole("grid", { name: SELECTED_LABEL }),
		).toBeInTheDocument();
		await userEvent.tab();
		await expect(
			canvas.getByRole("combobox", {
				name: MULTIPLE_LABEL,
			}),
		).toHaveFocus();
	},
};

const PEOPLE_LABEL = "Reviewer";
const PAGE_SIZE = 20;
const SERVER_DELAY_MS = 50;

type Person = Readonly<{ id: string; name: string }>;

const PEOPLE: readonly Person[] = ["Ada", "Bo"].flatMap(
	first =>
		Array.from({ length: 30 }, (_, index) => {
			const number = String(index + 1).padStart(2, "0");
			return {
				id: `${first}-${number}`,
				name: `${first} ${number}`,
			};
		}),
);

const personChanged =
	fn<(person: Person | null) => void>().mockName(
		"personChanged",
	);

const serverDelay = () =>
	new Promise(resolve => {
		setTimeout(resolve, SERVER_DELAY_MS);
	});

const searchPeople = async (
	search: string,
	page: number,
) => {
	await serverDelay();
	const matches = PEOPLE.filter(person =>
		person.name
			.toLowerCase()
			.includes(search.toLowerCase()),
	);
	return {
		items: matches.slice(
			page * PAGE_SIZE,
			(page + 1) * PAGE_SIZE,
		),
		totalCount: matches.length,
		page,
	};
};

const PagedPeople = (): ReactElement => {
	const [search, setSearch] = useState("");
	const query = useInfiniteQuery({
		queryKey: ["people", search],
		queryFn: ({ pageParam }) =>
			searchPeople(search, pageParam),
		initialPageParam: 0,
		getNextPageParam: last =>
			(last.page + 1) * PAGE_SIZE < last.totalCount
				? last.page + 1
				: undefined,
	});

	return (
		<ComboboxField
			{...COPY}
			label={PEOPLE_LABEL}
			query={query}
			onSearchChange={setSearch}
			searchDelay={0}
			itemKey={person => person.id}
			itemToStringLabel={person => person.name}
			onValueChange={personChanged}>
			{person => person.name}
		</ComboboxField>
	);
};

export const ServerPaging: Story = {
	tags: ["!dev", "!autodocs"],
	render: () => <PagedPeople />,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: PEOPLE_LABEL }),
		);
		await userEvent.type(await searchBox(), "Ada");

		await waitFor(() =>
			expect(screen.getByText("30 results")).toBeVisible(),
		);
		await expect(
			screen.queryByRole("option", { name: "Bo 01" }),
		).not.toBeInTheDocument();
		await expect(
			screen.queryByRole("option", { name: "Ada 25" }),
		).not.toBeInTheDocument();

		const list = screen.getByRole("listbox");
		list.scrollTop = list.scrollHeight;
		list.dispatchEvent(new Event("scroll"));

		await userEvent.click(
			await screen.findByRole("option", { name: "Ada 25" }),
		);

		await roleGone("listbox");
		await expect(personChanged).toHaveBeenLastCalledWith({
			id: "Ada-25",
			name: "Ada 25",
		});
		await expect(
			canvas.getByRole("combobox", { name: PEOPLE_LABEL }),
		).toHaveTextContent("Ada 25");
	},
};

const GONE: Person = { id: "gone", name: "Cy 01" };
const UNAVAILABLE_LABEL = "unavailable";

class GoneError extends Error {}

const personQuery = (id: string) =>
	queryOptions({
		queryKey: ["person", id],
		queryFn: async (): Promise<Person> => {
			await serverDelay();
			const person = PEOPLE.find(each => each.id === id);
			if (person === undefined) {
				throw new GoneError(id);
			}
			return person;
		},
		retry: false,
	});

const LookedUpPeople = (): ReactElement => (
	<ComboboxItemQueries>
		<ComboboxField
			{...COPY}
			{...MULTIPLE_COPY}
			multiple
			label={PEOPLE_LABEL}
			items={PEOPLE.slice(0, 5)}
			defaultValue={[GONE]}
			retryable={error => !(error instanceof GoneError)}
			itemQuery={personQuery}
			valueUnavailableLabel={UNAVAILABLE_LABEL}
			unavailableIcon={<Icon svg={BlockIcon} label="" />}
			valueUnavailableName={itemLabel =>
				`${itemLabel}, ${UNAVAILABLE_LABEL}`
			}
			valuesUnavailableLabel={count =>
				`${count} selected value is no longer available.`
			}
			itemKey={person => person.id}
			itemToStringLabel={person => person.name}>
			{person => person.name}
		</ComboboxField>
	</ComboboxItemQueries>
);

export const ValueUnavailable: Story = {
	tags: ["!autodocs"],
	render: () => <LookedUpPeople />,
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(canvas.getByRole("status")).toHaveTextContent(
				"1 selected value is no longer available.",
			),
		);
		await expect(
			canvas.getByRole("combobox", { name: PEOPLE_LABEL }),
		).toHaveTextContent(`Cy 01, ${UNAVAILABLE_LABEL}`);
	},
};
