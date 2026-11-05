import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import { Temporal } from "temporal-polyfill";
import {
	TimeField,
	type TimeFieldProps,
} from "./time-field.tsx";

const TIME = Temporal.PlainTime.from("09:30");

const isoTime = (time: Temporal.PlainTime) =>
	time.toString({ smallestUnit: "minute" });

const PlainTimeField = (args: TimeFieldProps) => (
	<TimeField {...args} />
);

const ControlledTimeField = (args: TimeFieldProps) => {
	const [, updateArgs] = useArgs<TimeFieldProps>();

	return (
		<TimeField
			{...args}
			onValueChange={value => {
				args.onValueChange?.(value);
				updateArgs({ value });
			}}
		/>
	);
};

const segmentsOf = (elements: readonly HTMLElement[]) => {
	const [hour, minute, dayPeriod] = elements;
	if (
		hour === undefined ||
		minute === undefined ||
		dayPeriod === undefined
	) {
		throw new Error(
			"expected hour, minute and day-period segments",
		);
	}
	return { hour, minute, dayPeriod };
};

const meta = {
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
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/field" },
		],
	},
	component: TimeField,
	render: ControlledTimeField,
	args: {
		label: "Start time",
		optionalLabel: "optional",
		value: null,
		onValueChange: fn(),
	},
	argTypes: {
		value: { control: "text" },
		defaultValue: { control: "text" },
	},
} satisfies Meta<typeof TimeField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: isoTime(TIME) },
};

export const Disabled: Story = {
	args: { value: isoTime(TIME), disabled: true },
};

export const ReadOnly: Story = {
	args: { value: isoTime(TIME), readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		value: isoTime(TIME),
		errors: ["Enter a valid start time."],
	},
};

export const Pending: Story = {
	args: { value: isoTime(TIME), pending: true },
};

export const WithDescription: Story = {
	args: { description: "The time the session started." },
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTimeField,
	play: async ({ args, canvas }) => {
		const { hour, minute, dayPeriod } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.tab();
		await expect(hour).toHaveFocus();

		await userEvent.keyboard("0930");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(isoTime(TIME));
		await expect(dayPeriod).toHaveFocus();

		await userEvent.keyboard("{ArrowLeft}");
		await expect(minute).toHaveFocus();

		await userEvent.keyboard("{ArrowUp}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			isoTime(TIME.add({ minutes: 1 })),
		);
		await userEvent.keyboard("{ArrowDown}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(isoTime(TIME));

		await userEvent.keyboard("{ArrowLeft}");
		await expect(hour).toHaveFocus();
		await userEvent.keyboard("{ArrowUp}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			isoTime(TIME.add({ hours: 1 })),
		);

		await userEvent.keyboard("{Backspace}{Backspace}");
		await expect(hour).not.toHaveAttribute("aria-valuenow");

		await userEvent.keyboard("09");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(isoTime(TIME));
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTimeField,
	play: async ({ args, canvas }) => {
		const { hour } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.click(hour);
		await expect(hour).toHaveFocus();

		await userEvent.keyboard("0930");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(isoTime(TIME));
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTimeField,
	play: async ({ args, canvas }) => {
		const { hour } = segmentsOf(
			canvas.getAllByRole("spinbutton"),
		);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: hour,
		});
		await expect(hour).toHaveFocus();

		await userEvent.keyboard("0930");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(isoTime(TIME));
	},
};
