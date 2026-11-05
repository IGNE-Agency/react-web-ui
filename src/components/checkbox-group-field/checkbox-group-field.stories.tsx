import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import {
	CheckboxGroupField,
	type CheckboxGroupFieldProps,
} from "./checkbox-group-field.tsx";

const LABEL = "Statuses";
const OPTIONAL_LABEL = "optional";
const OPEN_LABEL = "Open";
const SENT_LABEL = "Sent";
const PAID_LABEL = "Paid";
const DESCRIPTION =
	"Shows only declarations with these statuses.";
const ERROR = "Choose at least one status.";

const STATUS_ITEMS = [
	{ value: "open", label: OPEN_LABEL },
	{ value: "sent", label: SENT_LABEL },
	{ value: "paid", label: PAID_LABEL },
] as const;

const valueChange =
	fn<
		NonNullable<CheckboxGroupFieldProps["onValueChange"]>
	>();

const ControlledCheckboxGroupField = (
	args: CheckboxGroupFieldProps,
) => {
	const [, updateArgs] = useArgs<CheckboxGroupFieldProps>();

	return (
		<CheckboxGroupField
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
			{ component: "components/checkbox-field" },
			{
				page: "Principles/Interaction",
				section: "The cursor says what happens on click",
			},
		],
	},
	component: CheckboxGroupField,
	render: ControlledCheckboxGroupField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		items: STATUS_ITEMS,
		value: [],
		onValueChange: valueChange,
	},
} satisfies Meta<typeof CheckboxGroupField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: ["open", "paid"] },
};

export const Disabled: Story = {
	args: { value: ["sent"], disabled: true },
};

export const ReadOnly: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: ["sent"], readOnly: true },
	play: async ({ canvas }) => {
		await userEvent.tab();
		await userEvent.keyboard(" ");
		await userEvent.click(canvas.getByText(PAID_LABEL));

		await expect(
			canvas.getByRole("checkbox", {
				name: OPEN_LABEL,
			}),
		).not.toBeChecked();
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
		await expect(
			canvas.getByRole("checkbox", { name: OPEN_LABEL }),
		).toHaveAttribute("aria-invalid", "true");
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
	render: args => <CheckboxGroupField {...args} />,
	play: async ({ canvas }) => {
		const box = (name: string) =>
			canvas.getByRole("checkbox", { name });

		await userEvent.tab();
		await expect(box(OPEN_LABEL)).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(valueChange).toHaveBeenLastCalledWith(
			["open"],
			expect.anything(),
		);

		await userEvent.tab();
		await userEvent.tab();
		await expect(box(PAID_LABEL)).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(valueChange).toHaveBeenLastCalledWith(
			["open", "paid"],
			expect.anything(),
		);

		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });
		await userEvent.keyboard(" ");
		await expect(box(OPEN_LABEL)).not.toBeChecked();
		await expect(valueChange).toHaveBeenLastCalledWith(
			["paid"],
			expect.anything(),
		);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: args => <CheckboxGroupField {...args} />,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByText(SENT_LABEL));
		await userEvent.click(
			canvas.getByRole("checkbox", {
				name: PAID_LABEL,
			}),
		);

		await expect(valueChange).toHaveBeenLastCalledWith(
			["sent", "paid"],
			expect.anything(),
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: args => <CheckboxGroupField {...args} />,
	play: async ({ canvas }) => {
		const sent = canvas.getByRole("checkbox", {
			name: SENT_LABEL,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: sent,
		});

		await expect(sent).toBeChecked();
		await expect(valueChange).toHaveBeenCalledWith(
			["sent"],
			expect.anything(),
		);
	},
};
