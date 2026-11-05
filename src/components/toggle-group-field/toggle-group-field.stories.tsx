import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import { BusyForm } from "../../lib/storybook/busy-form.tsx";
import {
	PENDING_TOGGLE_LABEL,
	PendingToggle,
	pendingOnPress,
} from "../../lib/storybook/pending.tsx";
import {
	ToggleGroupField,
	type ToggleGroupFieldProps,
} from "./toggle-group-field.tsx";

const LABEL = "Statuses";
const OPTIONAL_LABEL = "optional";
const OPEN = { value: "open", label: "Open" };
const SENT = { value: "sent", label: "Sent" };
const PAID = { value: "paid", label: "Paid" };
const STATUS_OPTIONS = [OPEN, SENT, PAID];

const valueChange =
	fn<(value: readonly string[]) => void>().mockName(
		"onValueChange",
	);

const ControlledToggleGroupField = (
	args: ToggleGroupFieldProps,
) => {
	const [, updateArgs] = useArgs<ToggleGroupFieldProps>();

	return (
		<ToggleGroupField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainToggleGroupField = (
	args: ToggleGroupFieldProps,
) => <ToggleGroupField {...args} />;

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/segmented-control-field" },
		],
	},
	component: ToggleGroupField,
	render: ControlledToggleGroupField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		options: STATUS_OPTIONS,
		value: [],
		onValueChange: valueChange,
	},
	argTypes: {
		value: { control: "object" },
	},
} satisfies Meta<typeof ToggleGroupField>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const option = (
	canvas: Canvas,
	name: string,
): HTMLElement => canvas.getByRole("button", { name });

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: [OPEN.value, PAID.value] },
};

export const Disabled: Story = {
	args: { value: [SENT.value], disabled: true },
};

const BusyFormToggleGroupField = (
	args: ToggleGroupFieldProps,
) => (
	<BusyForm>
		<ToggleGroupField {...args} />
	</BusyForm>
);

export const InBusyForm: Story = {
	tags: ["!dev", "!autodocs"],
	render: BusyFormToggleGroupField,
	play: async ({ canvas }) => {
		await Promise.all(
			STATUS_OPTIONS.map(({ label }) =>
				expect(
					canvas.getByRole("button", { name: label }),
				).toHaveAttribute("data-disabled"),
			),
		);
	},
};

const PendingToggleGroupField = (
	args: ToggleGroupFieldProps,
) => (
	<PendingToggle>
		{pending => (
			<ToggleGroupField {...args} pending={pending} />
		)}
	</PendingToggle>
);

export const PendingWaits: Story = {
	tags: ["!dev", "!autodocs"],
	render: PendingToggleGroupField,
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

export const DisabledOption: Story = {
	args: {
		value: [OPEN.value],
		options: [OPEN, SENT, { ...PAID, disabled: true }],
	},
};

export const Vertical: Story = {
	args: { value: [SENT.value], orientation: "vertical" },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		value: [SENT.value],
		errors: ["Choose at least two statuses."],
	},
};

export const WithDescription: Story = {
	args: {
		description: "Shows invoices with any of these.",
	},
};

export const ReadOnly: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: [SENT.value], readOnly: true },
	play: async ({ canvas }) => {
		await userEvent.tab();
		await userEvent.keyboard(" ");
		await userEvent.keyboard("{ArrowRight}{Enter}");

		await expect(
			option(canvas, SENT.label),
		).toHaveAttribute("aria-pressed", "true");
		await expect(valueChange).not.toHaveBeenCalled();
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainToggleGroupField,
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(option(canvas, OPEN.label)).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(valueChange).toHaveBeenLastCalledWith([
			OPEN.value,
		]);

		await userEvent.keyboard("{ArrowRight}{ArrowRight}");
		await expect(option(canvas, PAID.label)).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(valueChange).toHaveBeenLastCalledWith([
			PAID.value,
		]);

		await userEvent.tab();
		await expect(
			option(canvas, PAID.label),
		).not.toHaveFocus();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: [OPEN.value] },
	render: PlainToggleGroupField,
	play: async ({ canvas }) => {
		await userEvent.click(option(canvas, PAID.label));
		await expect(valueChange).toHaveBeenLastCalledWith([
			OPEN.value,
			PAID.value,
		]);

		await userEvent.click(option(canvas, OPEN.label));
		await expect(valueChange).toHaveBeenLastCalledWith([]);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainToggleGroupField,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: option(canvas, SENT.label),
		});

		await expect(valueChange).toHaveBeenCalledWith([
			SENT.value,
		]);
	},
};
