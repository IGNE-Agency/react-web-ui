import CalendarTodayIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import ChevronLeftIcon from "@material-design-icons/svg/outlined/chevron_left.svg?react";
import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
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
	DateField,
	type DateFieldProps,
} from "./date-field.tsx";

const DAY = Temporal.PlainDate.from("2026-07-24");
const MONTH_START = DAY.with({ day: 1 });
const MONTH_END = DAY.with({ day: DAY.daysInMonth });
const LABEL = "Treatment date";
const OPEN_CALENDAR = "Open calendar";
const PREVIOUS_MONTH = "Previous month";
const NEXT_MONTH = "Next month";
const TRIGGER_NAME = `${OPEN_CALENDAR} ${LABEL}`;

const FAR_ZONE = "Pacific/Kiritimati";
const NOON_UTC = "2026-07-24T12:30:00Z";
const NOON_UTC_IN_FAR_ZONE = Temporal.Instant.from(NOON_UTC)
	.toZonedDateTimeISO(FAR_ZONE)
	.toPlainDate();

const PlainDateField = (args: DateFieldProps) => (
	<DateField {...args} />
);

const ControlledDateField = (args: DateFieldProps) => {
	const [, updateArgs] = useArgs<DateFieldProps>();

	return (
		<DateField
			{...args}
			onValueChange={value => {
				args.onValueChange?.(value);
				updateArgs({ value });
			}}
		/>
	);
};

const segmentsOf = (elements: readonly HTMLElement[]) => {
	const [month, day, year] = elements;
	if (
		month === undefined ||
		day === undefined ||
		year === undefined
	) {
		throw new Error(
			"expected month, day and year segments",
		);
	}
	return { month, day, year };
};

const meta = {
	component: DateField,
	render: ControlledDateField,
	args: {
		label: LABEL,
		optionalLabel: "optional",
		openCalendarLabel: OPEN_CALENDAR,
		openCalendarIcon: (
			<Icon svg={CalendarTodayIcon} label="" />
		),
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
		value: { control: "text" },
		defaultValue: { control: "text" },
		minValue: { control: "text" },
		maxValue: { control: "text" },
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
		],
		docs: { story: { inline: false, iframeHeight: 480 } },
	},
} satisfies Meta<typeof DateField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: DAY.toString() },
};

export const Disabled: Story = {
	args: { value: DAY.toString(), disabled: true },
};

export const ReadOnly: Story = {
	args: { value: DAY.toString(), readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		value: DAY.toString(),
		errors: ["Enter a valid treatment date."],
	},
};

export const Pending: Story = {
	args: { value: DAY.toString(), pending: true },
};

export const WithDescription: Story = {
	args: {
		description: "The day the treatment took place.",
	},
};

export const Constrained: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: DAY.toString(),
		minValue: MONTH_START.toString(),
		maxValue: MONTH_END.toString(),
		description: "Choose a day in July 2026.",
	},
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: TRIGGER_NAME,
			}),
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
	args: { value: DAY.toString() },
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: TRIGGER_NAME,
			}),
		);

		await expect(
			within(await calendar()).getByRole("gridcell", {
				selected: true,
			}),
		).toHaveTextContent(String(DAY.day));
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainDateField,
	play: async ({ args, canvas }) => {
		const { month, day } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.tab();
		await expect(month).toHaveFocus();

		await userEvent.keyboard("07242026");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(DAY.toString());

		await userEvent.keyboard("{ArrowUp}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			DAY.add({ years: 1 }).toString(),
		);
		await userEvent.keyboard("{ArrowDown}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(DAY.toString());

		await userEvent.keyboard("{ArrowLeft}");
		await expect(day).toHaveFocus();
		await userEvent.keyboard("{ArrowLeft}");
		await expect(month).toHaveFocus();
		await userEvent.keyboard("{ArrowUp}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			DAY.add({ months: 1 }).toString(),
		);

		await userEvent.keyboard("{Backspace}");
		await expect(month).not.toHaveAttribute(
			"aria-valuenow",
		);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			DAY.add({ months: 1 }).toString(),
		);

		await userEvent.keyboard("07");
		await expect(month).toHaveAttribute(
			"aria-valuenow",
			String(DAY.month),
		);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(DAY.toString());
	},
};

export const PickerKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined, defaultValue: DAY.toString() },
	render: PlainDateField,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: TRIGGER_NAME,
		});

		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await calendar();
		await focusedDay(DAY);
		await userEvent.keyboard("{ArrowRight}");
		await focusedDay(DAY.add({ days: 1 }));
		await userEvent.keyboard("{ArrowDown}");
		await focusedDay(DAY.add({ days: 8 }));
		await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
		await focusedDay(DAY);
		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
		await focusReturnsTo(trigger);
		await expect(args.onValueChange).not.toHaveBeenCalled();

		await userEvent.keyboard(" ");
		await calendar();
		await focusedDay(DAY);
		await userEvent.keyboard("{ArrowRight}{Enter}");
		await roleGone("dialog");

		await expect(args.onValueChange).toHaveBeenCalledWith(
			DAY.add({ days: 1 }).toString(),
		);
		await focusReturnsTo(trigger);

		await userEvent.keyboard("{Enter}");
		const popup = await calendar();
		await focusedDay(DAY.add({ days: 1 }));
		await userEvent.tab({ shift: true });
		await expect(
			within(popup).getByRole("button", {
				name: NEXT_MONTH,
			}),
		).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await userEvent.tab();
		await focusedDay(DAY.add({ days: 1, months: 1 }));
		await userEvent.keyboard("{Enter}");
		await roleGone("dialog");

		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			DAY.add({ days: 1, months: 1 }).toString(),
		);
		await focusReturnsTo(trigger);
	},
};

export const PickerMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined, defaultValue: DAY.toString() },
	render: PlainDateField,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: TRIGGER_NAME,
		});

		await userEvent.click(trigger);
		const popup = await calendar();
		await userEvent.click(
			within(popup).getByRole("button", {
				name: NEXT_MONTH,
			}),
		);
		await userEvent.click(
			dayButton(
				popup,
				DAY.add({ months: 1 }).with({ day: 1 }),
			),
		);
		await roleGone("dialog");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			DAY.add({ months: 1 }).with({ day: 1 }).toString(),
		);

		await userEvent.click(trigger);
		const reopened = await calendar();
		await userEvent.click(
			within(reopened).getByRole("button", {
				name: PREVIOUS_MONTH,
			}),
		);
		await userEvent.click(dayButton(reopened, DAY));
		await roleGone("dialog");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(DAY.toString());

		await userEvent.click(trigger);
		await calendar();
		await userEvent.click(document.body);
		await roleGone("dialog");
		await expect(args.onValueChange).toHaveBeenCalledTimes(
			2,
		);
	},
};

export const PickerTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined, defaultValue: DAY.toString() },
	render: PlainDateField,
	play: async ({ args, canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: TRIGGER_NAME,
			}),
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: dayButton(await calendar(), MONTH_END),
		});
		await roleGone("dialog");

		await expect(args.onValueChange).toHaveBeenCalledWith(
			MONTH_END.toString(),
		);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainDateField,
	play: async ({ args, canvas }) => {
		const { month } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.click(month);
		await expect(month).toHaveFocus();

		await userEvent.keyboard("07242026");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(DAY.toString());
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainDateField,
	play: async ({ args, canvas }) => {
		const { month } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: month,
		});
		await expect(month).toHaveFocus();

		await userEvent.keyboard("07242026");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(DAY.toString());
	},
};

export const InstantInFarZone: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: NOON_UTC },
	render: PlainDateField,
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
					"An instant is shown, and picked from, as the day it falls on in the `TimeZoneProvider`'s zone, never the device's.",
			},
		},
	},
	play: async ({ args, canvas }) => {
		const { month, day, year } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);
		await expect(month).toHaveAttribute(
			"aria-valuenow",
			String(NOON_UTC_IN_FAR_ZONE.month),
		);
		await expect(day).toHaveAttribute(
			"aria-valuenow",
			String(NOON_UTC_IN_FAR_ZONE.day),
		);
		await expect(year).toHaveAttribute(
			"aria-valuenow",
			String(NOON_UTC_IN_FAR_ZONE.year),
		);

		await userEvent.click(
			canvas.getByRole("button", { name: TRIGGER_NAME }),
		);
		const popup = await calendar();
		await expect(
			within(popup).getByRole("gridcell", {
				selected: true,
			}),
		).toHaveTextContent(String(NOON_UTC_IN_FAR_ZONE.day));

		const next = NOON_UTC_IN_FAR_ZONE.add({ days: 1 });
		await userEvent.click(dayButton(popup, next));
		await roleGone("dialog");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(next.toString());
	},
};

export const TodayInFarZone: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainDateField,
	decorators: [
		Story => (
			<TimeZoneProvider timeZone={FAR_ZONE}>
				<Story />
			</TimeZoneProvider>
		),
	],
	play: async ({ canvas }) => {
		const today = Temporal.Now.plainDateISO(FAR_ZONE);

		await userEvent.click(
			canvas.getByRole("button", { name: TRIGGER_NAME }),
		);
		const popup = await calendar();

		await focusedDay(today);
		await expect(
			within(popup).getByRole("grid"),
		).toHaveAccessibleName(
			expect.stringContaining(String(today.year)),
		);
	},
};
