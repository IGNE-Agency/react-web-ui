import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import {
	NumberField,
	type NumberFieldProps,
	percentFormat,
	unitFormat,
} from "./index.ts";

const SAMPLE_HOURS = 8;
const SAMPLE_PERCENT = 21;
const SAMPLE_KILOMETRES = 12.5;
const PERCENT_MAX = 100;
const KILOMETRE_STEP = 0.5;
const TYPED_HOURS = 12;
const LARGE_STEP = 10;

const LABEL = "Hours";
const OPTIONAL_LABEL = "optional";
const DECREMENT_LABEL = "Decrease";
const INCREMENT_LABEL = "Increase";
const ROLE_DESCRIPTION = "Number field";

const ControlledNumberField = (
	args: NumberFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<NumberFieldProps>();

	return (
		<NumberField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainNumberField = (
	args: NumberFieldProps,
): ReactElement => <NumberField {...args} />;

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
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
	},
	component: NumberField,
	render: ControlledNumberField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		decrementLabel: DECREMENT_LABEL,
		incrementLabel: INCREMENT_LABEL,
		roleDescription: ROLE_DESCRIPTION,
		value: null,
		min: 0,
		onValueChange: fn(),
	},
	argTypes: {
		value: { control: "number" },
	},
} satisfies Meta<typeof NumberField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Placeholder: Story = {
	args: { placeholder: "For example 8" },
};

export const Filled: Story = {
	args: { value: SAMPLE_HOURS },
};

export const Disabled: Story = {
	args: { value: SAMPLE_HOURS, disabled: true },
};

export const ReadOnly: Story = {
	args: { value: SAMPLE_HOURS, readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		errors: ["Enter the hours."],
	},
};

export const Pending: Story = {
	args: { value: SAMPLE_HOURS, pending: true },
};

export const WithDescription: Story = {
	args: { description: "Time spent on the session." },
};

export const WithSuffix: Story = {
	args: {
		value: SAMPLE_HOURS,
		suffix: "hours",
	},
};

export const AtMinimum: Story = {
	args: { value: 0 },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", {
				name: DECREMENT_LABEL,
			}),
		).toBeDisabled();
		await expect(
			canvas.getByRole("button", {
				name: INCREMENT_LABEL,
			}),
		).toBeEnabled();
	},
};

export const PercentFormat: Story = {
	args: {
		label: "VAT rate",
		value: SAMPLE_PERCENT,
		format: percentFormat(),
		max: PERCENT_MAX,
	},
};

export const UnitFormat: Story = {
	args: {
		label: "Distance",
		value: SAMPLE_KILOMETRES,
		format: unitFormat("kilometer"),
		step: KILOMETRE_STEP,
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainNumberField,
	play: async ({ args, canvas }) => {
		const control = canvas.getByRole("textbox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(control).toHaveFocus();
		await expect(control).toHaveAttribute(
			"aria-roledescription",
			ROLE_DESCRIPTION,
		);

		await userEvent.keyboard(String(TYPED_HOURS));
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			TYPED_HOURS,
			expect.anything(),
		);

		await userEvent.keyboard("{ArrowUp}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			TYPED_HOURS + 1,
			expect.anything(),
		);

		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			TYPED_HOURS - 1,
			expect.anything(),
		);

		await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			TYPED_HOURS - 1 + LARGE_STEP,
			expect.anything(),
		);

		await userEvent.keyboard("{Home}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(0, expect.anything());

		await userEvent.keyboard(
			"{Control>}a{/Control}{Delete}",
		);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(null, expect.anything());
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainNumberField,
	play: async ({ args, canvas }) => {
		const control = canvas.getByRole("textbox", {
			name: LABEL,
		});
		const increment = canvas.getByRole("button", {
			name: INCREMENT_LABEL,
		});

		await userEvent.click(increment);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(0, expect.anything());
		await userEvent.click(increment);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(1, expect.anything());

		await userEvent.click(
			canvas.getByRole("button", {
				name: DECREMENT_LABEL,
			}),
		);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(0, expect.anything());

		await userEvent.click(control);
		await expect(control).toHaveFocus();
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainNumberField,
	play: async ({ args, canvas }) => {
		const control = canvas.getByRole("textbox", {
			name: LABEL,
		});
		const increment = canvas.getByRole("button", {
			name: INCREMENT_LABEL,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: increment,
		});
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(0, expect.anything());
		await userEvent.pointer({
			keys: "[TouchA]",
			target: increment,
		});
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(1, expect.anything());

		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: DECREMENT_LABEL,
			}),
		});
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(0, expect.anything());

		await userEvent.pointer({
			keys: "[TouchA]",
			target: control,
		});
		await expect(control).toHaveFocus();
	},
};
