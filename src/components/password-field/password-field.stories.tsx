import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import {
	PasswordField,
	type PasswordFieldProps,
	type PasswordFieldStrengthProps,
} from "./index.ts";

const LABEL = "Password";
const OPTIONAL_LABEL = "optional";
const SHOW_LABEL = "Show password";
const HIDE_LABEL = "Hide password";
const STRENGTH_LABEL = "Password strength";
const ERROR = "Choose a stronger password.";
const STRONG_PASSWORD = "Correct-Horse-Battery-9";
const WEAK_PASSWORD = "password";

const STRENGTH: PasswordFieldStrengthProps = {
	strength: true,
	strengthLabel: STRENGTH_LABEL,
	scoreLabels: {
		0: "Very weak",
		1: "Weak",
		2: "Fair",
		3: "Strong",
		4: "Very strong",
	},
};

const ControlledPasswordField = (
	args: PasswordFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<PasswordFieldProps>();

	return (
		<PasswordField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const TypedPasswordField = (
	args: PasswordFieldProps,
): ReactElement => {
	const [value, setValue] = useState(args.value);

	return (
		<PasswordField
			{...args}
			value={value}
			onValueChange={next => {
				args.onValueChange(next);
				setValue(next);
			}}
		/>
	);
};

type Canvas = ReturnType<typeof within>;

const input = (canvas: Canvas) =>
	canvas.getByLabelText(LABEL, {
		selector: "input",
	});

const loadedInput = (canvas: Canvas) =>
	canvas.findByLabelText(LABEL, {
		selector: "input",
	});

const strengthMeter = (canvas: Canvas) =>
	canvas.findByRole("meter", { name: STRENGTH_LABEL });

const score = (canvas: Canvas) =>
	Number(
		canvas
			.getByRole("meter", { name: STRENGTH_LABEL })
			.getAttribute("aria-valuenow"),
	);

const showToggle = (canvas: Canvas) =>
	canvas.getByRole("button", { name: SHOW_LABEL });

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/text-field" },
		],
	},
	component: PasswordField,
	render: ControlledPasswordField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		showPasswordLabel: SHOW_LABEL,
		hidePasswordLabel: HIDE_LABEL,
		value: "",
		autoComplete: "new-password",
		onValueChange: fn(),
	},
} satisfies Meta<typeof PasswordField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { value: STRONG_PASSWORD },
};

export const Disabled: Story = {
	args: {
		value: STRONG_PASSWORD,
		disabled: true,
	},
	play: async ({ canvas }) => {
		await expect(input(canvas)).toBeDisabled();
		await expect(showToggle(canvas)).toBeDisabled();
	},
};

export const ReadOnly: Story = {
	args: {
		value: STRONG_PASSWORD,
		readOnly: true,
	},
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Invalid: Story = {
	args: {
		value: WEAK_PASSWORD,
		errors: [ERROR],
	},
	play: async ({ canvas }) => {
		await expect(input(canvas)).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await waitFor(() =>
			expect(canvas.getByText(ERROR)).toBeVisible(),
		);
	},
};

export const Pending: Story = {
	args: { value: STRONG_PASSWORD, pending: true },
};

export const WithDescription: Story = {
	args: { description: "At least twelve characters." },
};

export const Weak: Story = {
	args: { value: WEAK_PASSWORD, ...STRENGTH },
	play: async ({ canvas }) => {
		const meter = await strengthMeter(canvas);

		await expect(
			Number(meter.getAttribute("aria-valuenow")),
		).toBeLessThanOrEqual(1);
	},
};

export const Strong: Story = {
	args: {
		value: STRONG_PASSWORD,
		...STRENGTH,
	},
	play: async ({ canvas }) => {
		const meter = await strengthMeter(canvas);

		await expect(meter).toHaveAttribute(
			"aria-valuenow",
			"4",
		);
		await expect(meter).toHaveAttribute(
			"aria-valuetext",
			"Very strong",
		);
	},
};

export const StrengthWhileTyping: Story = {
	tags: ["!dev", "!autodocs"],
	args: STRENGTH,
	render: TypedPasswordField,
	play: async ({ args, canvas }) => {
		const field = await loadedInput(canvas);
		await expect(
			canvas.queryByRole("meter"),
		).not.toBeInTheDocument();

		await userEvent.type(field, WEAK_PASSWORD);
		await waitFor(() =>
			expect(score(canvas)).toBeLessThanOrEqual(1),
		);

		await userEvent.clear(input(canvas));
		await waitFor(() =>
			expect(
				canvas.queryByRole("meter"),
			).not.toBeInTheDocument(),
		);

		await userEvent.paste(STRONG_PASSWORD);
		await waitFor(() => expect(score(canvas)).toBe(4));
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(STRONG_PASSWORD);
	},
};

export const RevealKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: STRONG_PASSWORD },
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(input(canvas)).toHaveFocus();
		await expect(input(canvas)).toHaveAttribute(
			"type",
			"password",
		);

		await userEvent.tab();
		const toggle = showToggle(canvas);
		await expect(toggle).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await expect(input(canvas)).toHaveAttribute(
			"type",
			"text",
		);
		await expect(toggle).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		await expect(toggle).toHaveAccessibleName(HIDE_LABEL);

		await userEvent.keyboard(" ");
		await expect(input(canvas)).toHaveAttribute(
			"type",
			"password",
		);
		await expect(toggle).toHaveAttribute(
			"aria-pressed",
			"false",
		);
	},
};

export const RevealMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: STRONG_PASSWORD },
	play: async ({ canvas }) => {
		await userEvent.click(showToggle(canvas));
		await expect(input(canvas)).toHaveAttribute(
			"type",
			"text",
		);

		await userEvent.click(
			canvas.getByRole("button", { name: HIDE_LABEL }),
		);
		await expect(input(canvas)).toHaveAttribute(
			"type",
			"password",
		);
	},
};

export const RevealTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: STRONG_PASSWORD },
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: showToggle(canvas),
		});
		await expect(input(canvas)).toHaveAttribute(
			"type",
			"text",
		);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: HIDE_LABEL,
			}),
		});
		await expect(input(canvas)).toHaveAttribute(
			"type",
			"password",
		);
	},
};
