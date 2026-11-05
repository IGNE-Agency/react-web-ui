import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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
	SegmentedControlField,
	type SegmentedControlFieldProps,
} from "./segmented-control-field.tsx";

const LABEL = "Status";
const OPTIONAL_LABEL = "optional";
const OPEN = { value: "open", label: "Open" };
const SENT = { value: "sent", label: "Sent" };
const PAID = { value: "paid", label: "Paid" };
const STATUS_OPTIONS = [OPEN, SENT, PAID];

const valueChange =
	fn<(value: string | null) => void>().mockName(
		"onValueChange",
	);

const ControlledSegmentedControlField = (
	args: SegmentedControlFieldProps,
) => {
	const [, updateArgs] =
		useArgs<SegmentedControlFieldProps>();

	return (
		<SegmentedControlField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const StatefulSegmentedControlField = (
	args: SegmentedControlFieldProps,
) => {
	const [value, setValue] = useState(args.value);

	return (
		<SegmentedControlField
			{...args}
			value={value}
			onValueChange={next => {
				args.onValueChange(next);
				setValue(next);
			}}
		/>
	);
};

const PlainSegmentedControlField = (
	args: SegmentedControlFieldProps,
) => <SegmentedControlField {...args} />;

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
			{ component: "components/toggle-group-field" },
		],
	},
	component: SegmentedControlField,
	render: ControlledSegmentedControlField,
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
} satisfies Meta<typeof SegmentedControlField>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const option = (
	canvas: Canvas,
	name: string,
): HTMLElement => canvas.getByRole("button", { name });

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: SENT.value },
};

export const Disabled: Story = {
	args: { value: SENT.value, disabled: true },
};

const BusyFormSegmentedControlField = (
	args: SegmentedControlFieldProps,
) => (
	<BusyForm>
		<SegmentedControlField {...args} />
	</BusyForm>
);

export const InBusyForm: Story = {
	tags: ["!dev", "!autodocs"],
	render: BusyFormSegmentedControlField,
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

const PendingSegmentedControlField = (
	args: SegmentedControlFieldProps,
) => (
	<PendingToggle>
		{pending => (
			<SegmentedControlField {...args} pending={pending} />
		)}
	</PendingToggle>
);

export const PendingWaits: Story = {
	tags: ["!dev", "!autodocs"],
	render: PendingSegmentedControlField,
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
		value: OPEN.value,
		options: [OPEN, SENT, { ...PAID, disabled: true }],
	},
};

export const Vertical: Story = {
	args: { value: SENT.value, orientation: "vertical" },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: { errors: ["Choose a status."] },
};

export const WithDescription: Story = {
	args: {
		description:
			"Shows only declarations with this status.",
	},
};

export const ReadOnly: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: SENT.value, readOnly: true },
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

export const IndicatorFollows: Story = {
	tags: ["!dev", "!autodocs"],
	render: StatefulSegmentedControlField,
	play: async ({ canvas }) => {
		const paid = option(canvas, PAID.label);
		const indicator =
			paid.parentElement?.querySelector<HTMLElement>(
				'[aria-hidden="true"]',
			) ?? null;
		await expect(indicator).not.toBeNull();
		if (indicator === null) {
			return;
		}
		await expect(indicator).toHaveAttribute("data-empty");

		await userEvent.click(paid);

		await waitFor(() =>
			expect(indicator).not.toHaveAttribute("data-empty"),
		);
		await expect(
			indicator.style.getPropertyValue(
				"--active-item-left",
			),
		).toBe(`${paid.offsetLeft}px`);
		await expect(
			indicator.style.getPropertyValue(
				"--active-item-width",
			),
		).toBe(`${paid.offsetWidth}px`);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainSegmentedControlField,
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(option(canvas, OPEN.label)).toHaveFocus();

		await userEvent.keyboard("{ArrowRight}");
		await expect(option(canvas, SENT.label)).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(valueChange).toHaveBeenLastCalledWith(
			SENT.value,
		);

		await userEvent.keyboard("{ArrowRight}{Enter}");
		await expect(valueChange).toHaveBeenLastCalledWith(
			PAID.value,
		);

		await userEvent.keyboard("{ArrowRight}");
		await expect(option(canvas, OPEN.label)).toHaveFocus();
		await userEvent.keyboard("{ArrowLeft}");
		await expect(option(canvas, PAID.label)).toHaveFocus();

		await userEvent.tab();
		await expect(
			option(canvas, PAID.label),
		).not.toHaveFocus();
		await expect(valueChange).toHaveBeenCalledTimes(2);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainSegmentedControlField,
	play: async ({ canvas }) => {
		await userEvent.click(option(canvas, PAID.label));

		await expect(valueChange).toHaveBeenCalledWith(
			PAID.value,
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainSegmentedControlField,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: option(canvas, OPEN.label),
		});

		await expect(valueChange).toHaveBeenCalledWith(
			OPEN.value,
		);
	},
};
