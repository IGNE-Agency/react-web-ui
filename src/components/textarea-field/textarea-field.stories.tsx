import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import {
	TextareaField,
	type TextareaFieldProps,
} from "./index.ts";

const COUNTER_MAX = 200;
const MAX_ROWS = 8;
const LABEL = "Note";
const OPTIONAL_LABEL = "optional";
const VALUE =
	"The client asked to move the next session to the afternoon.";

const ControlledTextareaField = (
	args: TextareaFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<TextareaFieldProps>();

	return (
		<TextareaField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainTextareaField = (
	args: TextareaFieldProps,
): ReactElement => <TextareaField {...args} />;

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{
				page: "Principles/Accessibility",
				section:
					"A counter and a pending state do not announce per keystroke",
			},
			{ component: "components/text-field" },
		],
	},
	component: TextareaField,
	render: ControlledTextareaField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		value: "",
		maxRows: MAX_ROWS,
		onValueChange: fn(),
	},
} satisfies Meta<typeof TextareaField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Placeholder: Story = {
	args: { placeholder: "Add a note for the practitioner" },
};

export const Filled: Story = {
	args: { value: VALUE },
};

export const Disabled: Story = {
	args: { value: VALUE, disabled: true },
};

export const ReadOnly: Story = {
	args: { value: VALUE, readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		errors: ["Enter a note."],
	},
};

export const Pending: Story = {
	args: { value: VALUE, pending: true },
};

export const WithDescription: Story = {
	args: {
		description: "Only your team can see this note.",
	},
};

export const WithCounter: Story = {
	args: {
		value: VALUE,
		maxLength: COUNTER_MAX,
	},
};

export const CounterOverLimit: Story = {
	args: {
		value: VALUE,
		maxLength: VALUE.length - 1,
	},
};

export const ScrollsPastMaxRows: Story = {
	args: {
		value: Array.from(
			{ length: MAX_ROWS * 2 },
			() => VALUE,
		).join("\n"),
	},
	play: async ({ canvas }) => {
		const textarea = canvas.getByRole("textbox", {
			name: LABEL,
		});

		await expect(textarea.scrollHeight).toBeGreaterThan(
			textarea.clientHeight,
		);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTextareaField,
	play: async ({ args, canvas }) => {
		const textarea = canvas.getByRole("textbox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(textarea).toHaveFocus();

		await userEvent.keyboard(
			`${VALUE}{Enter}{Enter}{Enter}${VALUE}`,
		);

		const typed = `${VALUE}\n\n\n${VALUE}`;
		await expect(textarea).toHaveValue(typed);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(typed, expect.anything());

		await userEvent.keyboard(
			"{Control>}a{/Control}{Delete}",
		);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith("", expect.anything());
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTextareaField,
	play: async ({ args, canvas }) => {
		const textarea = canvas.getByRole("textbox", {
			name: LABEL,
		});

		await userEvent.click(textarea);
		await expect(textarea).toHaveFocus();

		await userEvent.keyboard(VALUE);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(VALUE, expect.anything());
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTextareaField,
	play: async ({ args, canvas }) => {
		const textarea = canvas.getByRole("textbox", {
			name: LABEL,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: textarea,
		});
		await expect(textarea).toHaveFocus();

		await userEvent.keyboard(VALUE);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(VALUE, expect.anything());
	},
};
