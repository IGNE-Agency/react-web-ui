import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	type within,
} from "storybook/test";
import {
	OtpField,
	type OtpFieldProps,
	type OtpSlotLabel,
} from "./index.ts";

const LENGTH = 6;
const SAMPLE_CODE = "123456";
const PARTIAL_CODE = "123";
const PASTED_CODE = "654321";
const REPLACEMENT = "9";
const REPLACED_CODE = "193";
const LABEL = "Verification code";
const OPTIONAL_LABEL = "optional";

const slotLabel: OtpSlotLabel = (index, total) =>
	`character ${index} of ${total}`;

const slotName = (index: number) =>
	index === 0 ? LABEL : slotLabel(index + 1, LENGTH);

const ControlledOtpField = (
	args: OtpFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<OtpFieldProps>();

	return (
		<OtpField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainOtpField = (
	args: OtpFieldProps,
): ReactElement => <OtpField {...args} />;

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Accessibility",
				section:
					"Every control has a name, from exactly one mechanism",
			},
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/field" },
		],
	},
	component: OtpField,
	render: ControlledOtpField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		slotLabel,
		value: "",
		length: LENGTH,
		onValueChange: fn(),
		onValueComplete: fn(),
	},
} satisfies Meta<typeof OtpField>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const slotOf = (canvas: Canvas) => (index: number) =>
	canvas.getByRole("textbox", { name: slotName(index) });

export const Empty: Story = {};

export const Partial: Story = {
	args: { value: PARTIAL_CODE },
};

export const Filled: Story = {
	args: { value: SAMPLE_CODE },
};

export const Masked: Story = {
	args: { value: SAMPLE_CODE, mask: true },
};

export const Disabled: Story = {
	args: { value: SAMPLE_CODE, disabled: true },
};

export const ReadOnly: Story = {
	args: { value: SAMPLE_CODE, readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		value: SAMPLE_CODE,
		errors: ["This code is incorrect."],
	},
};

export const WithDescription: Story = {
	args: {
		description:
			"Enter the 6-digit code from your authenticator app.",
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainOtpField,
	play: async ({ args, canvas }) => {
		const slot = slotOf(canvas);

		await userEvent.tab();
		await expect(slot(0)).toHaveFocus();

		await userEvent.keyboard("a");
		await expect(args.onValueChange).not.toHaveBeenCalled();
		await expect(slot(0)).toHaveFocus();

		await userEvent.keyboard(PARTIAL_CODE);
		await expect(slot(PARTIAL_CODE.length)).toHaveFocus();
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			PARTIAL_CODE,
			expect.anything(),
		);

		await userEvent.keyboard("{Backspace}");
		await expect(
			slot(PARTIAL_CODE.length - 1),
		).toHaveFocus();
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			PARTIAL_CODE.slice(0, -1),
			expect.anything(),
		);

		await userEvent.keyboard("{ArrowLeft}");
		await expect(
			slot(PARTIAL_CODE.length - 2),
		).toHaveFocus();

		await userEvent.keyboard("{Home}");
		await expect(slot(0)).toHaveFocus();

		await userEvent.paste(PASTED_CODE);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			PASTED_CODE,
			expect.anything(),
		);
		await expect(args.onValueComplete).toHaveBeenCalledWith(
			PASTED_CODE,
			expect.anything(),
		);
		await expect(slot(LENGTH - 1)).toHaveFocus();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainOtpField,
	play: async ({ args, canvas }) => {
		const slot = slotOf(canvas);

		await userEvent.click(slot(LENGTH - 1));
		await expect(slot(0)).toHaveFocus();

		await userEvent.keyboard(PARTIAL_CODE);
		await userEvent.click(slot(1));
		await expect(slot(1)).toHaveFocus();

		await userEvent.keyboard(REPLACEMENT);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			REPLACED_CODE,
			expect.anything(),
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainOtpField,
	play: async ({ args, canvas }) => {
		const slot = slotOf(canvas);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: slot(LENGTH - 1),
		});
		await expect(slot(0)).toHaveFocus();

		await userEvent.keyboard(PARTIAL_CODE);
		await userEvent.pointer({
			keys: "[TouchA]",
			target: slot(1),
		});
		await expect(slot(1)).toHaveFocus();

		await userEvent.keyboard(REPLACEMENT);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			REPLACED_CODE,
			expect.anything(),
		);
	},
};
