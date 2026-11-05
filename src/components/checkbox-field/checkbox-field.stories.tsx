import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	waitFor,
} from "storybook/test";
import { BusyForm } from "../../lib/storybook/busy-form.tsx";
import {
	PENDING_TOGGLE_LABEL,
	PendingToggle,
	pendingOnPress,
} from "../../lib/storybook/pending.tsx";
import {
	CheckboxField,
	type CheckboxFieldProps,
} from "./checkbox-field.tsx";

const LABEL = "I agree to the terms";
const OPTIONAL_LABEL = "optional";
const DESCRIPTION =
	"The terms apply to every declaration you submit.";
const ERROR = "Agree to the terms to continue.";

const checkedChange =
	fn<NonNullable<CheckboxFieldProps["onCheckedChange"]>>();

const ControlledCheckboxField = (
	args: CheckboxFieldProps,
) => {
	const [, updateArgs] = useArgs<CheckboxFieldProps>();

	return (
		<CheckboxField
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
			{ component: "components/checkbox-field" },
			{
				page: "Principles/Interaction",
				section: "The cursor says what happens on click",
			},
		],
	},
	component: CheckboxField,
	render: ControlledCheckboxField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		checked: false,
		onCheckedChange: checkedChange,
	},
} satisfies Meta<typeof CheckboxField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
	args: { checked: true },
};

export const Disabled: Story = {
	args: { checked: true, disabled: true },
};

export const ReadOnly: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: true, readOnly: true },
	play: async ({ canvas }) => {
		const box = canvas.getByRole("checkbox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(box).toHaveFocus();
		await userEvent.keyboard(" ");
		await userEvent.click(canvas.getByText(LABEL));

		await expect(box).toBeChecked();
		await expect(checkedChange).not.toHaveBeenCalled();
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
			canvas.getByRole("checkbox", { name: LABEL }),
		).toHaveAttribute("aria-invalid", "true");
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
	args: { checked: undefined },
	render: args => <CheckboxField {...args} />,
	play: async ({ canvas }) => {
		const box = canvas.getByRole("checkbox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(box).toHaveFocus();

		await userEvent.keyboard(" ");
		await expect(box).toBeChecked();
		await expect(checkedChange).toHaveBeenLastCalledWith(
			true,
			expect.anything(),
		);

		await userEvent.keyboard(" ");
		await expect(box).not.toBeChecked();
		await expect(checkedChange).toHaveBeenLastCalledWith(
			false,
			expect.anything(),
		);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <CheckboxField {...args} />,
	play: async ({ canvas }) => {
		const box = canvas.getByRole("checkbox", {
			name: LABEL,
		});

		await userEvent.click(box);
		await expect(box).toBeChecked();

		await userEvent.click(canvas.getByText(LABEL));
		await expect(box).not.toBeChecked();
		await expect(checkedChange).toHaveBeenCalledTimes(2);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { checked: undefined },
	render: args => <CheckboxField {...args} />,
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

const BusyFormCheckboxField = (
	args: CheckboxFieldProps,
) => (
	<BusyForm>
		<CheckboxField {...args} />
	</BusyForm>
);

export const InBusyForm: Story = {
	tags: ["!dev", "!autodocs"],
	render: BusyFormCheckboxField,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("checkbox", { name: LABEL }),
		).toHaveAttribute("data-disabled");
	},
};

const PendingCheckboxField = (args: CheckboxFieldProps) => (
	<PendingToggle>
		{pending => (
			<CheckboxField {...args} pending={pending} />
		)}
	</PendingToggle>
);

export const PendingWaits: Story = {
	tags: ["!dev", "!autodocs"],
	render: PendingCheckboxField,
	play: async ({ canvas, canvasElement }) => {
		const toggle = canvas.getByRole("button", {
			name: PENDING_TOGGLE_LABEL,
		});

		await expect(
			await pendingOnPress(toggle, canvasElement),
		).toBe(false);
		await waitFor(() =>
			expect(
				canvasElement.querySelector("[data-pending]"),
			).not.toBeNull(),
		);
	},
};
