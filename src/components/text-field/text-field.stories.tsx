import LanguageIcon from "@material-design-icons/svg/outlined/language.svg?react";
import PersonIcon from "@material-design-icons/svg/outlined/person.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	spyOn,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import {
	TextField,
	type TextFieldCopyProps,
	type TextFieldProps,
} from "./index.ts";

const COUNTER_MAX = 40;
const LABEL = "Name";
const OPTIONAL_LABEL = "optional";
const VALUE = "Anna de Vries";
const WEBSITE_LABEL = "Website";
const WEBSITE_VALUE = "example";
const PREFIX = "https://";
const SUFFIX = ".nl";
const CLEAR_LABEL = "Clear";
const COPY_LABEL = "Copy";
const COPIED_LABEL = "Copied";
const COPY_FAILED_LABEL =
	"Couldn't copy automatically. Text selected, copy it manually.";

const COPY_LABELS: TextFieldCopyProps = {
	copyable: true,
	copyLabel: COPY_LABEL,
	copiedLabel: COPIED_LABEL,
	copyFailedLabel: COPY_FAILED_LABEL,
};

const ControlledTextField = (
	args: TextFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<TextFieldProps>();

	return (
		<TextField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainTextField = (
	args: TextFieldProps,
): ReactElement => <TextField {...args} />;

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{
				page: "Principles/Accessibility",
				section:
					"A counter and a pending state do not announce per keystroke",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Focus returns after a part removes itself",
			},
			{ component: "components/field" },
		],
	},
	component: TextField,
	render: ControlledTextField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		value: "",
		onValueChange: fn(),
	},
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const textbox = (canvas: Canvas) =>
	canvas.getByRole("textbox", { name: LABEL });

export const Empty: Story = {};

export const Placeholder: Story = {
	args: { placeholder: "For example Anna de Vries" },
};

export const Filled: Story = {
	args: { value: VALUE },
};

export const Disabled: Story = {
	args: {
		value: VALUE,
		disabled: true,
	},
};

export const ReadOnly: Story = {
	args: {
		value: VALUE,
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
		errors: ["Enter a name."],
	},
};

export const Pending: Story = {
	args: {
		value: VALUE,
		pending: true,
	},
};

export const WithDescription: Story = {
	args: {
		description: "As it appears on the client's ID.",
	},
};

export const LabelHidden: Story = {
	args: { labelHidden: true },
};

export const WithIcon: Story = {
	args: { icon: PersonIcon },
};

export const WithAffixes: Story = {
	args: {
		label: WEBSITE_LABEL,
		value: WEBSITE_VALUE,
		prefix: PREFIX,
		suffix: SUFFIX,
	},
};

export const WithCounter: Story = {
	args: {
		value: VALUE,
		maxLength: COUNTER_MAX,
	},
};

export const CounterNearLimit: Story = {
	args: {
		value: VALUE,
		maxLength: VALUE.length,
	},
};

export const CounterOverLimit: Story = {
	args: {
		value: VALUE,
		maxLength: VALUE.length - 1,
	},
};

export const Clearable: Story = {
	args: {
		value: VALUE,
		clearable: true,
		clearLabel: CLEAR_LABEL,
	},
};

export const Copyable: Story = {
	args: {
		value: VALUE,
		...COPY_LABELS,
	},
};

export const AllInlays: Story = {
	args: {
		label: WEBSITE_LABEL,
		value: WEBSITE_VALUE,
		icon: LanguageIcon,
		prefix: PREFIX,
		suffix: SUFFIX,
		maxLength: COUNTER_MAX,
		clearable: true,
		clearLabel: CLEAR_LABEL,
		...COPY_LABELS,
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTextField,
	play: async ({ args, canvas }) => {
		const input = textbox(canvas);

		await userEvent.tab();
		await expect(input).toHaveFocus();

		await userEvent.keyboard(VALUE);
		await expect(input).toHaveValue(VALUE);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(VALUE, expect.anything());

		await userEvent.keyboard("{Backspace}");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(
			VALUE.slice(0, -1),
			expect.anything(),
		);

		await userEvent.keyboard(
			"{Control>}a{/Control}{Delete}",
		);
		await expect(input).toHaveValue("");
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith("", expect.anything());
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTextField,
	play: async ({ args, canvas }) => {
		const input = textbox(canvas);

		await userEvent.click(input);
		await expect(input).toHaveFocus();

		await userEvent.keyboard(VALUE);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(VALUE, expect.anything());
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainTextField,
	play: async ({ args, canvas }) => {
		const input = textbox(canvas);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: input,
		});
		await expect(input).toHaveFocus();

		await userEvent.keyboard(VALUE);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(VALUE, expect.anything());
	},
};

const clearButton = (canvas: Canvas) =>
	canvas.getByRole("button", { name: CLEAR_LABEL });

export const ClearKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: VALUE,
		clearable: true,
		clearLabel: CLEAR_LABEL,
	},
	render: PlainTextField,
	play: async ({ args, canvas }) => {
		const input = textbox(canvas);
		const clear = clearButton(canvas);

		await userEvent.tab();
		await expect(input).toHaveFocus();
		await userEvent.tab();
		await expect(clear).toHaveFocus();

		await userEvent.keyboard("{Enter}");

		await expect(args.onValueChange).toHaveBeenCalledWith(
			"",
		);
		await expect(input).toHaveFocus();
	},
};

export const ClearMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: VALUE,
		clearable: true,
		clearLabel: CLEAR_LABEL,
	},
	render: PlainTextField,
	play: async ({ args, canvas }) => {
		await userEvent.click(clearButton(canvas));

		await expect(args.onValueChange).toHaveBeenCalledWith(
			"",
		);
		await expect(textbox(canvas)).toHaveFocus();
	},
};

export const ClearTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: VALUE,
		clearable: true,
		clearLabel: CLEAR_LABEL,
	},
	render: PlainTextField,
	play: async ({ args, canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: clearButton(canvas),
		});

		await expect(args.onValueChange).toHaveBeenCalledWith(
			"",
		);
		await expect(textbox(canvas)).toHaveFocus();
	},
};

export const Copy: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: VALUE,
		...COPY_LABELS,
	},
	play: async ({ canvas }) => {
		const writeText = spyOn(
			navigator.clipboard,
			"writeText",
		).mockResolvedValue();

		await userEvent.click(
			canvas.getByRole("button", { name: COPY_LABEL }),
		);

		await expect(writeText).toHaveBeenCalledWith(VALUE);
		await waitFor(() =>
			expect(
				canvas.getByRole("button", { name: COPIED_LABEL }),
			).toBeInTheDocument(),
		);
		await expect(
			canvas.getByRole("status"),
		).toHaveTextContent(COPIED_LABEL);
	},
};

const expectSelectedByHand = async (canvas: Canvas) => {
	const input = textbox(canvas);
	await waitFor(() =>
		expect(
			canvas.getByRole("button", {
				name: COPY_FAILED_LABEL,
			}),
		).toBeInTheDocument(),
	);
	await expect(
		canvas.getByRole("status"),
	).toHaveTextContent(COPY_FAILED_LABEL);
	await expect(input).toHaveFocus();
	await expect(input).toHaveProperty("selectionStart", 0);
	await expect(input).toHaveProperty(
		"selectionEnd",
		VALUE.length,
	);
};

export const CopyRefused: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: VALUE,
		...COPY_LABELS,
	},
	play: async ({ canvas }) => {
		spyOn(
			navigator.clipboard,
			"writeText",
		).mockRejectedValue(
			new DOMException(
				"Write permission denied.",
				"NotAllowedError",
			),
		);

		await userEvent.click(
			canvas.getByRole("button", { name: COPY_LABEL }),
		);

		await expectSelectedByHand(canvas);
	},
};

export const CopyUnavailable: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		value: VALUE,
		...COPY_LABELS,
	},
	beforeEach: () => {
		Object.defineProperty(navigator, "clipboard", {
			value: undefined,
			configurable: true,
		});
		return () => {
			Reflect.deleteProperty(navigator, "clipboard");
		};
	},
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: COPY_LABEL }),
		);

		await expectSelectedByHand(canvas);
	},
};
