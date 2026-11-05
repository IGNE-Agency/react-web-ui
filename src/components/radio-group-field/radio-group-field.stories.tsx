import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import {
	RadioGroupField,
	type RadioGroupFieldProps,
} from "./radio-group-field.tsx";

const LABEL = "Status";
const OPTIONAL_LABEL = "optional";
const DESCRIPTION = "The status the declaration is in now.";
const ERROR = "Choose a status.";

const OPEN = { value: "open", label: "Open" };
const SENT = { value: "sent", label: "Sent" };
const PAID = { value: "paid", label: "Paid" };

const STATUS_OPTIONS = [OPEN, SENT, PAID];

const valueChange =
	fn<NonNullable<RadioGroupFieldProps["onValueChange"]>>();

const ControlledRadioGroupField = (
	args: RadioGroupFieldProps,
) => {
	const [, updateArgs] = useArgs<RadioGroupFieldProps>();

	return (
		<RadioGroupField
			{...args}
			onValueChange={(value, details) => {
				args.onValueChange?.(value, details);
				updateArgs({ value });
			}}
		/>
	);
};

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Interaction",
				section: "The cursor says what happens on click",
			},
			{ component: "components/field" },
		],
	},
	component: RadioGroupField,
	render: ControlledRadioGroupField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		options: STATUS_OPTIONS,
		value: null,
		onValueChange: valueChange,
	},
	argTypes: {
		value: { control: "text" },
	},
} satisfies Meta<typeof RadioGroupField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: "sent" },
};

export const Disabled: Story = {
	args: { value: "sent", disabled: true },
};

export const DisabledOption: Story = {
	args: {
		value: "open",
		options: [OPEN, SENT, { ...PAID, disabled: true }],
	},
};

export const ReadOnly: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: "sent", readOnly: true },
	play: async ({ canvas }) => {
		const sent = canvas.getByRole("radio", {
			name: SENT.label,
		});

		await userEvent.tab();
		await expect(sent).toHaveFocus();
		await userEvent.keyboard("{ArrowDown}");
		await userEvent.click(canvas.getByText(OPEN.label));

		await expect(sent).toBeChecked();
		await expect(valueChange).not.toHaveBeenCalled();
	},
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: { errors: [ERROR] },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("alert"),
		).toHaveTextContent(ERROR);
	},
};

export const WithDescription: Story = {
	args: { description: DESCRIPTION },
};

export const DescriptionAndError: Story = {
	args: { description: DESCRIPTION, errors: [ERROR] },
	play: async ({ canvas }) => {
		const description = canvas.getByText(DESCRIPTION);
		const error = canvas.getByRole("alert");
		await expect(
			description.compareDocumentPosition(error) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: args => <RadioGroupField {...args} />,
	play: async ({ canvas }) => {
		const radio = (name: string) =>
			canvas.getByRole("radio", { name });

		await userEvent.tab();
		await expect(radio(OPEN.label)).toHaveFocus();
		await expect(valueChange).not.toHaveBeenCalled();

		await userEvent.keyboard("{ArrowDown}");
		await expect(radio(SENT.label)).toHaveFocus();
		await expect(radio(SENT.label)).toBeChecked();

		await userEvent.keyboard("{ArrowDown}");
		await expect(radio(PAID.label)).toBeChecked();

		await userEvent.keyboard("{ArrowUp}");
		await expect(radio(SENT.label)).toBeChecked();
		await expect(valueChange).toHaveBeenLastCalledWith(
			"sent",
			expect.anything(),
		);

		await userEvent.tab();
		await expect(
			canvas.getByRole("radiogroup"),
		).not.toContainElement(
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null,
		);

		await userEvent.tab({ shift: true });
		await expect(radio(SENT.label)).toHaveFocus();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: args => <RadioGroupField {...args} />,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByText(PAID.label));

		await expect(
			canvas.getByRole("radio", {
				name: PAID.label,
			}),
		).toBeChecked();
		await expect(valueChange).toHaveBeenCalledWith(
			"paid",
			expect.anything(),
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: args => <RadioGroupField {...args} />,
	play: async ({ canvas }) => {
		const open = canvas.getByRole("radio", {
			name: OPEN.label,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: open,
		});

		await expect(open).toBeChecked();
		await expect(valueChange).toHaveBeenCalledWith(
			"open",
			expect.anything(),
		);
	},
};
