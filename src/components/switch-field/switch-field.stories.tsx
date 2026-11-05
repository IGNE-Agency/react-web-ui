import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent } from "storybook/test";
import {
	SwitchField,
	type SwitchFieldProps,
} from "./switch-field.tsx";

const LABEL = "Email me about new messages";
const OPTIONAL_LABEL = "optional";

const checkedChange =
	fn<NonNullable<SwitchFieldProps["onCheckedChange"]>>();

const ControlledSwitchField = (args: SwitchFieldProps) => {
	const [, updateArgs] = useArgs<SwitchFieldProps>();

	return (
		<SwitchField
			{...args}
			onCheckedChange={(checked, details) => {
				args.onCheckedChange?.(checked, details);
				updateArgs({ checked });
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
	component: SwitchField,
	render: ControlledSwitchField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		checked: false,
		onCheckedChange: checkedChange,
	},
} satisfies Meta<typeof SwitchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
	args: { checked: true },
};

export const Disabled: Story = {
	args: { checked: true, disabled: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		errors: ["Turn on notifications to continue."],
	},
};

export const WithDescription: Story = {
	args: {
		description:
			"You can change this later in your settings.",
	},
};

export const DescriptionAndError: Story = {
	args: {
		description:
			"You can change this later in your settings.",
		errors: ["Turn on notifications to continue."],
	},
	play: async ({ canvas }) => {
		const description = canvas.getByText(
			"You can change this later in your settings.",
		);
		const error = canvas.getByRole("alert");
		await expect(
			description.compareDocumentPosition(error) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		await expect(
			canvas.getByRole("switch", { name: LABEL }),
		).toHaveAttribute("aria-invalid", "true");
	},
};

export const ReadOnly: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: true, readOnly: true },
	play: async ({ canvas }) => {
		const control = canvas.getByRole("switch", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(control).toHaveFocus();
		await userEvent.keyboard(" ");
		await userEvent.click(canvas.getByText(LABEL));

		await expect(control).toBeChecked();
		await expect(checkedChange).not.toHaveBeenCalled();
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <SwitchField {...args} />,
	play: async ({ canvas }) => {
		const control = canvas.getByRole("switch", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(control).toHaveFocus();

		await userEvent.keyboard(" ");
		await expect(control).toBeChecked();
		await expect(checkedChange).toHaveBeenLastCalledWith(
			true,
			expect.anything(),
		);

		await userEvent.keyboard("{Enter}");
		await expect(control).not.toBeChecked();
		await expect(checkedChange).toHaveBeenLastCalledWith(
			false,
			expect.anything(),
		);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <SwitchField {...args} />,
	play: async ({ canvas }) => {
		const control = canvas.getByRole("switch", {
			name: LABEL,
		});

		await userEvent.click(control);
		await expect(control).toBeChecked();

		await userEvent.click(canvas.getByText(LABEL));
		await expect(control).not.toBeChecked();
		await expect(checkedChange).toHaveBeenCalledTimes(2);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <SwitchField {...args} />,
	play: async ({ canvas }) => {
		const control = canvas.getByRole("switch", {
			name: LABEL,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: control,
		});

		await expect(control).toBeChecked();
		await expect(checkedChange).toHaveBeenCalledWith(
			true,
			expect.anything(),
		);
	},
};
