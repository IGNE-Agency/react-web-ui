import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import ChevronLeftIcon from "@material-design-icons/svg/outlined/chevron_left.svg?react";
import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import DateRangeIcon from "@material-design-icons/svg/outlined/date_range.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../icon/index.ts";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	within,
} from "storybook/test";
import {
	calendar,
	dayButton,
	focusedDay,
	focusReturnsTo,
} from "../../lib/storybook/calendar.ts";
import { roleGone } from "../../lib/storybook/waits.ts";
import { Temporal } from "temporal-polyfill";
import { TimeZoneProvider } from "../time-zone-provider/index.ts";
import {
	DateRangeField,
	type DateRangeFieldProps,
} from "./date-range-field.tsx";

const MONTH_START = Temporal.PlainDate.from("2026-07-01");
const MONTH_END = MONTH_START.with({
	day: MONTH_START.daysInMonth,
});
const RANGE = {
	start: MONTH_START.toString(),
	end: MONTH_END.toString(),
};
const LABEL = "Invoice period";
const OPEN_CALENDAR = "Open calendar";
const PREVIOUS_MONTH = "Previous month";
const NEXT_MONTH = "Next month";
const TRIGGER_NAME = `${OPEN_CALENDAR} ${LABEL}`;

const FAR_ZONE = "Pacific/Kiritimati";
const INSTANTS = {
	start: "2026-06-30T12:00:00Z",
	end: "2026-07-30T12:00:00Z",
};

const PlainDateRangeField = (args: DateRangeFieldProps) => (
	<DateRangeField {...args} />
);

const ControlledDateRangeField = (
	args: DateRangeFieldProps,
) => {
	const [, updateArgs] = useArgs<DateRangeFieldProps>();

	return (
		<DateRangeField
			{...args}
			onValueChange={value => {
				args.onValueChange?.(value);
				updateArgs({ value });
			}}
		/>
	);
};

const segmentsOf = (elements: readonly HTMLElement[]) => {
	const [startMonth, , , endMonth] = elements;
	if (startMonth === undefined || endMonth === undefined) {
		throw new Error("expected start and end segments");
	}
	return { startMonth, endMonth };
};

const meta = {
	component: DateRangeField,
	render: ControlledDateRangeField,
	args: {
		label: LABEL,
		optionalLabel: "optional",
		openCalendarLabel: OPEN_CALENDAR,
		openCalendarIcon: <Icon svg={DateRangeIcon} label="" />,
		previousIcon: <Icon svg={ChevronLeftIcon} label="" />,
		nextIcon: <Icon svg={ChevronRightIcon} label="" />,
		checkIcon: <Icon svg={CheckIcon} label="" />,
		expandIcon: <Icon svg={ExpandMoreIcon} label="" />,
		previousMonthLabel: PREVIOUS_MONTH,
		nextMonthLabel: NEXT_MONTH,
		monthLabel: "Month",
		yearLabel: "Year",
		noMatchingYearLabel: "No matching year.",
		value: null,
		onValueChange: fn(),
	},
	argTypes: {
		value: { control: "object" },
		defaultValue: { control: "object" },
		minValue: { control: "text" },
		maxValue: { control: "text" },
		visibleMonths: { control: { type: "number", min: 1 } },
	},
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Accessibility",
				section:
					"Every control has a name, from exactly one mechanism",
			},
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/field" },
			{ component: "components/date-field" },
		],
		docs: { story: { inline: false, iframeHeight: 480 } },
	},
} satisfies Meta<typeof DateRangeField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: RANGE },
};

export const Disabled: Story = {
	args: { value: RANGE, disabled: true },
};

export const ReadOnly: Story = {
	args: { value: RANGE, readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		value: RANGE,
		errors: ["Enter a valid invoice period."],
	},
};

export const Pending: Story = {
	args: { value: RANGE, pending: true },
};

export const WithDescription: Story = {
	args: {
		description:
			"From the first through the last day of work.",
	},
};

export const Constrained: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: RANGE,
		minValue: MONTH_START.toString(),
		maxValue: MONTH_END.toString(),
		description: "Choose days in July 2026.",
	},
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: TRIGGER_NAME }),
		);
		const popup = await calendar();

		await expect(
			within(popup).getByRole("button", {
				name: PREVIOUS_MONTH,
			}),
		).toBeDisabled();
		await expect(
			within(popup).getByRole("button", {
				name: NEXT_MONTH,
			}),
		).toBeDisabled();
	},
};

export const CalendarOpen: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: RANGE },
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: TRIGGER_NAME }),
		);

		await expect(
			within(await calendar()).getAllByRole("gridcell", {
				selected: true,
			}),
		).toHaveLength(MONTH_START.daysInMonth);
	},
};

export const TwoMonths: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: RANGE, visibleMonths: 2 },
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: TRIGGER_NAME }),
		);

		await expect(
			within(await calendar()).getAllByRole("grid"),
		).toHaveLength(2);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainDateRangeField,
	play: async ({ args, canvas }) => {
		const { startMonth, endMonth } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.tab();
		await expect(startMonth).toHaveFocus();

		await userEvent.keyboard("07012026");
		await expect(endMonth).toHaveFocus();
		await expect(args.onValueChange).not.toHaveBeenCalled();

		await userEvent.keyboard("07312026");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(RANGE);

		await userEvent.keyboard("{ArrowUp}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith({
			start: RANGE.start,
			end: MONTH_END.add({ years: 1 }).toString(),
		});
	},
};

export const PickerKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined, defaultValue: RANGE },
	render: PlainDateRangeField,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: TRIGGER_NAME,
		});

		await userEvent.keyboard("{Tab>7/}");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await calendar();
		await focusedDay(MONTH_START);
		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
		await focusReturnsTo(trigger);
		await expect(args.onValueChange).not.toHaveBeenCalled();

		await userEvent.keyboard(" ");
		await calendar();
		await focusedDay(MONTH_START);
		await userEvent.keyboard("{ArrowRight}");
		await focusedDay(MONTH_START.add({ days: 1 }));
		await userEvent.keyboard("{Enter}");
		await focusedDay(MONTH_START.add({ days: 2 }));
		await userEvent.keyboard("{ArrowDown}");
		await focusedDay(MONTH_START.add({ days: 9 }));
		await userEvent.keyboard("{ArrowDown}");
		await focusedDay(MONTH_START.add({ days: 16 }));
		await userEvent.keyboard("{Enter}");
		await roleGone("dialog");

		await expect(args.onValueChange).toHaveBeenCalledWith({
			start: MONTH_START.add({ days: 1 }).toString(),
			end: MONTH_START.add({ days: 16 }).toString(),
		});
		await focusReturnsTo(trigger);
	},
};

export const PickerMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined, defaultValue: RANGE },
	render: PlainDateRangeField,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: TRIGGER_NAME,
		});
		const start = MONTH_START.with({ day: 10 });
		const end = MONTH_START.add({ months: 1 }).with({
			day: 20,
		});

		await userEvent.click(trigger);
		const popup = await calendar();
		await userEvent.click(dayButton(popup, start));
		await userEvent.click(
			within(popup).getByRole("button", {
				name: NEXT_MONTH,
			}),
		);
		await userEvent.click(dayButton(popup, end));
		await roleGone("dialog");

		await expect(args.onValueChange).toHaveBeenCalledWith({
			start: start.toString(),
			end: end.toString(),
		});
	},
};

export const PickerTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined, defaultValue: RANGE },
	render: PlainDateRangeField,
	play: async ({ args, canvas }) => {
		const start = MONTH_START.with({ day: 6 });
		const end = MONTH_START.with({ day: 12 });

		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: TRIGGER_NAME,
			}),
		});
		const popup = await calendar();
		await userEvent.pointer({
			keys: "[TouchA]",
			target: dayButton(popup, start),
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: dayButton(popup, end),
		});
		await roleGone("dialog");

		await expect(args.onValueChange).toHaveBeenCalledWith({
			start: start.toString(),
			end: end.toString(),
		});
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainDateRangeField,
	play: async ({ args, canvas }) => {
		const { startMonth } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.click(startMonth);
		await expect(startMonth).toHaveFocus();

		await userEvent.keyboard("0701202607312026");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(RANGE);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainDateRangeField,
	play: async ({ args, canvas }) => {
		const { startMonth } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: startMonth,
		});
		await expect(startMonth).toHaveFocus();

		await userEvent.keyboard("0701202607312026");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(RANGE);
	},
};

export const InstantsInFarZone: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: INSTANTS },
	render: PlainDateRangeField,
	decorators: [
		Story => (
			<TimeZoneProvider timeZone={FAR_ZONE}>
				<Story />
			</TimeZoneProvider>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					"Instants are shown, and picked from, as the days they fall on in the `TimeZoneProvider`'s zone, never the device's.",
			},
		},
	},
	play: async ({ args, canvas }) => {
		const spinbuttons = canvas.getAllByRole("spinbutton");
		await expect(
			spinbuttons.map(segment =>
				segment.getAttribute("aria-valuenow"),
			),
		).toEqual(
			[MONTH_START, MONTH_END].flatMap(date => [
				String(date.month),
				String(date.day),
				String(date.year),
			]),
		);

		await userEvent.click(
			canvas.getByRole("button", { name: TRIGGER_NAME }),
		);
		const popup = await calendar();
		await expect(
			within(popup).getAllByRole("gridcell", {
				selected: true,
			}),
		).toHaveLength(MONTH_START.daysInMonth);

		const end = MONTH_START.with({ day: 2 });
		await userEvent.click(dayButton(popup, MONTH_START));
		await userEvent.click(dayButton(popup, end));
		await roleGone("dialog");
		await expect(args.onValueChange).toHaveBeenCalledWith({
			start: MONTH_START.toString(),
			end: end.toString(),
		});
	},
};
