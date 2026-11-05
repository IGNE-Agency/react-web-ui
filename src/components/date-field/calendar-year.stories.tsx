import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { roleGone } from "../../lib/storybook/waits.ts";
import { DateField } from "./date-field.tsx";

const OPEN_CALENDAR = "Open calendar";
const NEXT_MONTH = "Next month";
const YEAR = "Year";
const NO_MATCHING_YEAR = "No matching year.";

type Canvas = ReturnType<typeof within>;

const calendarTrigger = (canvas: Canvas) =>
	canvas.getByRole("button", {
		name: (name: string) => name.startsWith(OPEN_CALENDAR),
	});

const yearInput = () =>
	screen.findByRole("combobox", { name: YEAR });

const openCalendar = async (canvas: Canvas) => {
	await userEvent.click(calendarTrigger(canvas));
	return yearInput();
};

const yearOption = (year: string) =>
	screen.findByRole("option", { name: year });

const showsYear = (year: string) =>
	waitFor(() =>
		expect(screen.getByRole("grid")).toHaveAccessibleName(
			expect.stringContaining(year),
		),
	);

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Patterns",
				section:
					"Every popup that lists things shares one surface and one row",
			},
			{ component: "components/date-field" },
		],
	},
	component: DateField,
	args: {
		label: "Appointment date",
		optionalLabel: "optional",
		openCalendarLabel: OPEN_CALENDAR,
		previousMonthLabel: "Previous month",
		nextMonthLabel: NEXT_MONTH,
		monthLabel: "Month",
		yearLabel: YEAR,
		noMatchingYearLabel: NO_MATCHING_YEAR,
		defaultValue: "2026-07-24",
		onValueChange: fn(),
	},
} satisfies Meta<typeof DateField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FocusedYear: Story = {
	tags: ["!autodocs"],
	play: async ({ canvas }) => {
		await expect(await openCalendar(canvas)).toHaveValue(
			"2026",
		);
		await showsYear("2026");
	},
};

export const Open: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(await openCalendar(canvas));

		const selected = await yearOption("2026");
		await expect(selected).toHaveAttribute(
			"aria-selected",
			"true",
		);
		await waitFor(() => expect(selected).toBeVisible());
		await expect(
			screen.queryByRole("option", { name: "1" }),
		).not.toBeInTheDocument();
		await expect(
			screen.queryByRole("option", { name: "9999" }),
		).not.toBeInTheDocument();
	},
};

export const Bounded: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		minValue: "2020-01-01",
		maxValue: "2030-12-31",
	},
	play: async ({ canvas }) => {
		await userEvent.click(await openCalendar(canvas));
		await yearOption("2026");

		const options = screen.getAllByRole("option");
		await expect(options).toHaveLength(11);
		await expect(options.at(0)).toHaveAccessibleName(
			"2020",
		);
		await expect(options.at(-1)).toHaveAccessibleName(
			"2030",
		);
	},
};

export const NoMatch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(await openCalendar(canvas));
		await userEvent.keyboard("0000");

		const empty = await screen.findByText(NO_MATCHING_YEAR);
		await waitFor(() => expect(empty).toBeVisible());
		await expect(
			screen.queryByRole("option"),
		).not.toBeInTheDocument();
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ args, canvas }) => {
		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();
		await expect(calendarTrigger(canvas)).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const input = await yearInput();
		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: NEXT_MONTH }),
			).toBeVisible(),
		);

		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });
		await expect(input).toHaveFocus();

		await userEvent.keyboard("1999");
		const match = await yearOption("1999");
		await waitFor(() => expect(match).toBeVisible());
		await expect(
			screen.getAllByRole("option"),
		).toHaveLength(1);

		await userEvent.keyboard("{ArrowDown}{Enter}");
		await roleGone("listbox");

		await expect(input).toHaveValue("1999");
		await showsYear("1999");

		await userEvent.keyboard("{ArrowDown}");
		await expect(await yearOption("1999")).toHaveAttribute(
			"aria-selected",
			"true",
		);
		await userEvent.keyboard("{Escape}");
		await roleGone("listbox");
		await expect(input).toHaveValue("1999");
		await expect(args.onValueChange).not.toHaveBeenCalled();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const input = await openCalendar(canvas);

		await userEvent.click(input);
		await userEvent.click(await yearOption("2024"));
		await roleGone("listbox");

		await expect(input).toHaveValue("2024");
		await showsYear("2024");
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const input = await openCalendar(canvas);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: input,
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await yearOption("2028"),
		});
		await roleGone("listbox");

		await expect(input).toHaveValue("2028");
		await showsYear("2028");
	},
};
