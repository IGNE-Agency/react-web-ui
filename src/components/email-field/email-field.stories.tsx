import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../icon/index.ts";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	waitFor,
} from "storybook/test";
import {
	EmailField,
	type EmailFieldProps,
} from "./index.ts";

const LABEL = "Email address";
const OPTIONAL_LABEL = "optional";
const CLEAR_LABEL = "Clear";
const ERROR = "This is not a valid email address.";
const VALID = "anna@voorbeeld.nl";
const INVALID = "anna.voorbeeld.nl";

const ControlledEmailField = (
	args: EmailFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<EmailFieldProps>();

	return (
		<EmailField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainEmailField = (
	args: EmailFieldProps,
): ReactElement => <EmailField {...args} />;

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{ component: "components/text-field" },
		],
	},
	component: EmailField,
	render: ControlledEmailField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		icon: <Icon svg={MailIcon} label="" />,
		value: "",
		onValueChange: fn(),
	},
} satisfies Meta<typeof EmailField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Valid: Story = {
	args: { value: VALID },
};

export const Invalid: Story = {
	args: {
		value: INVALID,
		errors: [ERROR],
	},
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(canvas.getByText(ERROR)).toBeVisible(),
		);
	},
};

export const Disabled: Story = {
	args: { value: VALID, disabled: true },
};

export const ReadOnly: Story = {
	args: { value: VALID, readOnly: true },
};

export const Required: Story = {
	args: { requiredness: "required" },
};

export const Optional: Story = {
	args: { requiredness: "optional" },
};

export const Pending: Story = {
	args: { value: VALID, pending: true },
};

export const WithDescription: Story = {
	args: {
		description: "We send the invoice to this address.",
	},
};

export const Clearable: Story = {
	args: {
		value: VALID,
		clearable: true,
		clearLabel: CLEAR_LABEL,
		clearIcon: <Icon svg={CloseIcon} label="" />,
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainEmailField,
	play: async ({ args, canvas }) => {
		const input = canvas.getByRole("textbox", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(input).toHaveFocus();
		await expect(input).toHaveAttribute("type", "email");
		await expect(input).toHaveAttribute(
			"autocomplete",
			"email",
		);

		await userEvent.keyboard(VALID);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(VALID, expect.anything());
	},
};
