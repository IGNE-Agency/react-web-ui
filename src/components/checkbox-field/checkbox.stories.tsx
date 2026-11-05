import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import {
	Checkbox,
	type CheckboxProps,
} from "./checkbox.tsx";

const LABEL = "I agree to the terms";

const checkedChange =
	fn<NonNullable<CheckboxProps["onCheckedChange"]>>();

const ControlledCheckbox = (args: CheckboxProps) => {
	const [, updateArgs] = useArgs<CheckboxProps>();

	return (
		<Checkbox
			{...args}
			onCheckedChange={(checked, details) => {
				args.onCheckedChange?.(checked, details);
				updateArgs({ checked, indeterminate: false });
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
				page: "Principles/Separation",
				section: "The four cases that justify a line",
			},
		],
	},
	component: Checkbox,
	render: ControlledCheckbox,
	args: {
		"aria-label": LABEL,
		checked: false,
		onCheckedChange: checkedChange,
	},
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
	args: { checked: true },
};

export const Indeterminate: Story = {
	args: { indeterminate: true },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("checkbox", {
				name: LABEL,
			}),
		).toBePartiallyChecked();
	},
};

export const Disabled: Story = {
	args: { checked: true, disabled: true },
};

export const ReadOnly: Story = {
	args: { checked: true, readOnly: true },
};

export const Invalid: Story = {
	args: { "aria-invalid": true },
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <Checkbox {...args} />,
	play: async ({ canvas }) => {
		const box = canvas.getByRole("checkbox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(box).toHaveFocus();
		await userEvent.keyboard(" ");

		await expect(box).toBeChecked();
		await expect(checkedChange).toHaveBeenCalledWith(
			true,
			expect.anything(),
		);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <Checkbox {...args} />,
	play: async ({ canvas }) => {
		const box = canvas.getByRole("checkbox", {
			name: LABEL,
		});

		await userEvent.click(box);

		await expect(box).toBeChecked();
		await expect(checkedChange).toHaveBeenCalledWith(
			true,
			expect.anything(),
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <Checkbox {...args} />,
	play: async ({ canvas }) => {
		const box = canvas.getByRole("checkbox", {
			name: LABEL,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: box,
		});

		await expect(box).toBeChecked();
		await expect(checkedChange).toHaveBeenCalledWith(
			true,
			expect.anything(),
		);
	},
};
