import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	waitFor,
} from "storybook/test";
import {
	PhoneField,
	type PhoneFieldProps,
} from "./index.ts";

const LABEL = "Phone number";
const OPTIONAL_LABEL = "optional";
const CLEAR_LABEL = "Clear";
const FORMAT =
	"For example 06 12 34 56 78 or +31 6 12 34 56 78";
const ERROR = "This is not a valid phone number.";
const VALID = "06 12 34 56 78";
const INVALID = "06 123";

const ControlledPhoneField = (
	args: PhoneFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<PhoneFieldProps>();

	return (
		<PhoneField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainPhoneField = (
	args: PhoneFieldProps,
): ReactElement => <PhoneField {...args} />;

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{ component: "components/text-field" },
			{
				page: "Principles/Accessibility",
				section:
					"An accessible name is never only a placeholder",
			},
		],
	},
	component: PhoneField,
	render: ControlledPhoneField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		description: FORMAT,
		value: "",
		onValueChange: fn(),
	},
} satisfies Meta<typeof PhoneField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Valid: Story = {
	args: { value: VALID },
};

export const Invalid: Story = {
	args: {
		value: INVALID,
		errors: [ERROR],
	},
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(canvas.getByText(ERROR)).toBeVisible(),
		);
	},
};

export const Disabled: Story = {
	args: { value: VALID, disabled: true },
};

export const ReadOnly: Story = {
	args: { value: VALID, readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Pending: Story = {
	args: { value: VALID, pending: true },
};

export const OwnNumber: Story = {
	args: { autoComplete: "tel" },
};

export const Clearable: Story = {
	args: {
		value: VALID,
		clearable: true,
		clearLabel: CLEAR_LABEL,
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainPhoneField,
	play: async ({ args, canvas }) => {
		const input = canvas.getByRole("textbox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(input).toHaveFocus();
		await expect(input).toHaveAttribute("type", "tel");
		await expect(input).toHaveAttribute("inputmode", "tel");
		await expect(input).not.toHaveAttribute("autocomplete");

		await userEvent.keyboard(VALID);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(VALID, expect.anything());
	},
};
