import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import RemoveIcon from "@material-design-icons/svg/outlined/remove.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import { Icon } from "../icon/index.ts";
import {
	Checkbox,
	type CheckboxControlProps,
} from "./checkbox.tsx";

const LABEL = "I agree to the terms";

const checkedChange =
	fn<
		NonNullable<CheckboxControlProps["onCheckedChange"]>
	>();

const Mark = ({
	indeterminate,
}: Readonly<{ indeterminate?: boolean }>) => (
	<Checkbox.Indicator>
		<Icon
			svg={indeterminate === true ? RemoveIcon : CheckIcon}
			label=""
		/>
	</Checkbox.Indicator>
);

const PlainCheckbox = (args: CheckboxControlProps) => (
	<Checkbox.Control {...args}>
		<Mark indeterminate={args.indeterminate} />
	</Checkbox.Control>
);

const ControlledCheckbox = (args: CheckboxControlProps) => {
	const [, updateArgs] = useArgs<CheckboxControlProps>();

	return (
		<Checkbox.Control
			{...args}
			onCheckedChange={(checked, details) => {
				args.onCheckedChange?.(checked, details);
				updateArgs({ checked, indeterminate: false });
			}}>
			<Mark indeterminate={args.indeterminate} />
		</Checkbox.Control>
	);
};

const LabelledCheckbox = (args: CheckboxControlProps) => {
	const [, updateArgs] = useArgs<CheckboxControlProps>();

	return (
		<Checkbox.Root filled={args.checked === true}>
			<Checkbox.Label>
				<Checkbox.Control
					{...args}
					aria-label={undefined}
					onCheckedChange={(checked, details) => {
						args.onCheckedChange?.(checked, details);
						updateArgs({ checked, indeterminate: false });
					}}>
					<Mark indeterminate={args.indeterminate} />
				</Checkbox.Control>
				{LABEL}
			</Checkbox.Label>
		</Checkbox.Root>
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
	component: Checkbox.Control,
	render: ControlledCheckbox,
	args: {
		"aria-label": LABEL,
		checked: false,
		onCheckedChange: checkedChange,
	},
} satisfies Meta<typeof Checkbox.Control>;

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

export const Labelled: Story = {
	render: LabelledCheckbox,
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: PlainCheckbox,
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
	render: PlainCheckbox,
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
	render: PlainCheckbox,
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
