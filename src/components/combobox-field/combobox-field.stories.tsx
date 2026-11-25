import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	queryOptions,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { type ReactElement, useRef, useState } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { OPTIONS_LOADS } from "../../lib/storybook/options-load.ts";
import { STORY_COPY } from "../../lib/storybook/story-providers.tsx";
import {
	optionHighlighted,
	roleGone,
} from "../../lib/storybook/waits.ts";
import { Field } from "../field/index.ts";
import { Icon } from "../icon/index.ts";
import {
	Combobox,
	ComboboxField,
	type ComboboxFieldProps,
} from "./index.ts";
import { ComboboxItemQueries } from "./react-query.tsx";
import { TSFComboboxField } from "./tsf-combobox-field.tsx";

const LABEL = "Status";
const MULTIPLE_LABEL = "Statuses";
const SELECTED_LABEL = "Selected statuses";
const PLACEHOLDER = "Choose…";
const DESCRIPTION = "The status the invoice is in now.";
const REJECTED_ERROR =
	"A rejected invoice needs a new number.";

const MULTIPLE_COPY = {
	selectedLabel: SELECTED_LABEL,
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

const ComposedCombobox = (): ReactElement => {
	const anchorRef = useRef<HTMLDivElement>(null);
	const [value, setValue] = useState<string | null>(null);

	return (
		<Combobox.Root
			items={STATUSES}
			itemToStringLabel={statusLabel}
			value={value}
			onValueChange={next => {
				setValue(next);
			}}
			errors={
				value === "rejected" ? [REJECTED_ERROR] : undefined
			}
			requiredness="required">
			<Combobox.Label>
				{LABEL} <Field.Requiredness />
			</Combobox.Label>
			<Combobox.Control ref={anchorRef}>
				<Combobox.Trigger>
					<Combobox.TriggerValue>
						{value === null
							? PLACEHOLDER
							: statusLabel(value)}
					</Combobox.TriggerValue>
					<Combobox.Icon>
						<Icon svg={ExpandMoreIcon} label="" />
					</Combobox.Icon>
				</Combobox.Trigger>
			</Combobox.Control>
			<Combobox.Portal>
				<Combobox.Positioner anchor={anchorRef}>
					<Combobox.Popup aria-label={LABEL}>
						<Combobox.Search />
						<Combobox.List>
							{(status: string) => (
								<Combobox.Option
									key={status}
									value={status}>
									<Combobox.OptionIndicator>
										<Icon svg={CheckIcon} label="" />
									</Combobox.OptionIndicator>
									<Combobox.OptionText>
										{statusLabel(status)}
									</Combobox.OptionText>
								</Combobox.Option>
							)}
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
			<Combobox.Description>
				{DESCRIPTION}
			</Combobox.Description>
			<Combobox.Error />
		</Combobox.Root>
	);
};

const tag = (name: string) =>
	screen.getByRole("row", { name });

const searchBox = () =>
	screen.findByRole("combobox", {
		name: STORY_COPY.options.search,
	});

const searchFocused = () =>
	waitFor(() =>
		expect(
			screen.getByRole("combobox", {
				name: STORY_COPY.options.search,
			}),
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
			{
				component: "components/field",
				section:
					"Every control comes in three tiers, and the primitive draws the field frame",
			},
		],
		tiers: {
			primitive: {
				"Combobox.Root": Combobox.Root,
			},
			connector: { TSFComboboxField },
		},
	},
	component: ComboboxField<string>,
	render: ControlledComboboxField,
	args: {
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
		description: DESCRIPTION,
	},
};

export const Composed: Story = {
	tags: ["!dev", "!autodocs"],
	render: ComposedCombobox,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("combobox", {
			name: LABEL,
		});

		await expect(trigger).toHaveAccessibleName(LABEL);
		await expect(trigger).toHaveAccessibleDescription(
			DESCRIPTION,
		);
		await expect(trigger).toHaveAttribute(
			"aria-required",
			"true",
		);

		await userEvent.click(trigger);
		await userEvent.click(
			await screen.findByRole("option", {
				name: statusLabel("rejected"),
			}),
		);
		await roleGone("listbox");

		const error = await canvas.findByRole("alert");
		await expect(error).toHaveTextContent(REJECTED_ERROR);
		await expect(
			trigger.getAttribute("aria-describedby")?.split(" "),
		).toContain(error.id);
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
			expect(
				screen.getByText(STORY_COPY.options.loading),
			).toBeVisible(),
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
				screen.getByText(STORY_COPY.options.empty),
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
				screen.getByText(STORY_COPY.options.noResults),
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
				screen.getByText(STORY_COPY.options.loadFailed),
			).toBeVisible(),
		);

		await userEvent.click(
			screen.getByRole("button", {
				name: STORY_COPY.retry,
			}),
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
				screen.getByText(STORY_COPY.options.loadBroken),
			).toBeVisible(),
		);
		await expect(
			screen.queryByRole("button", {
				name: STORY_COPY.retry,
			}),
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
				name: `${STORY_COPY.remove} ${statusLabel("sent")}`,
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
			expect(
				screen.getByText(STORY_COPY.options.results(30)),
			).toBeVisible(),
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
			{...MULTIPLE_COPY}
			multiple
			label={PEOPLE_LABEL}
			items={PEOPLE.slice(0, 5)}
			defaultValue={[GONE]}
			retryable={error => !(error instanceof GoneError)}
			itemQuery={personQuery}
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
		await expect(
			await canvas.findByText(
				STORY_COPY.options.unavailableCount(1),
				{ selector: "[role=status]" },
			),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole("combobox", { name: PEOPLE_LABEL }),
		).toHaveTextContent(
			STORY_COPY.options.unavailableName("Cy 01"),
		);
	},
};
