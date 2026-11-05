import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../icon/index.ts";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	userEvent,
	type within,
} from "storybook/test";
import {
	SearchField,
	type SearchFieldProps,
} from "./index.ts";

const LABEL = "Search clients";
const OPTIONAL_LABEL = "optional";
const CLEAR_LABEL = "Clear search";
const PLACEHOLDER = "Name or citizen service number";
const QUERY = "de Vries";

const ControlledSearchField = (
	args: SearchFieldProps,
): ReactElement => {
	const [, updateArgs] = useArgs<SearchFieldProps>();

	return (
		<SearchField
			{...args}
			onValueChange={value => {
				args.onValueChange(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainSearchField = (
	args: SearchFieldProps,
): ReactElement => <SearchField {...args} />;

const meta = {
	parameters: {
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{ component: "components/text-field" },
			{
				page: "Principles/Accessibility",
				section: "Decoration is `aria-hidden`",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Focus returns after a part removes itself",
			},
		],
	},
	component: SearchField,
	render: ControlledSearchField,
	args: {
		label: LABEL,
		optionalLabel: OPTIONAL_LABEL,
		clearLabel: CLEAR_LABEL,
		clearIcon: <Icon svg={CloseIcon} label="" />,
		icon: <Icon svg={SearchIcon} label="" />,
		value: "",
		onValueChange: fn(),
	},
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const searchbox = (canvas: Canvas) =>
	canvas.getByRole("searchbox", { name: LABEL });

const clearButton = (canvas: Canvas) =>
	canvas.getByRole("button", { name: CLEAR_LABEL });

export const Empty: Story = {};

export const Placeholder: Story = {
	args: { placeholder: PLACEHOLDER },
};

export const Filled: Story = {
	args: { value: QUERY },
};

export const Disabled: Story = {
	args: {
		value: QUERY,
		disabled: true,
	},
};

export const Pending: Story = {
	args: {
		value: QUERY,
		pending: true,
	},
};

export const WithDescription: Story = {
	args: {
		description:
			"Searches by name and citizen service number.",
	},
};

export const LabelHidden: Story = {
	args: {
		labelHidden: true,
		placeholder: PLACEHOLDER,
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainSearchField,
	play: async ({ args, canvas }) => {
		const input = searchbox(canvas);

		await userEvent.tab();
		await expect(input).toHaveFocus();

		await userEvent.keyboard(QUERY);
		await expect(
			args.onValueChange,
		).toHaveBeenLastCalledWith(QUERY, expect.anything());
	},
};

export const ClearKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: QUERY },
	render: PlainSearchField,
	play: async ({ args, canvas }) => {
		const input = searchbox(canvas);

		await userEvent.tab();
		await expect(input).toHaveFocus();
		await userEvent.tab();
		await expect(clearButton(canvas)).toHaveFocus();

		await userEvent.keyboard(" ");

		await expect(args.onValueChange).toHaveBeenCalledWith(
			"",
		);
		await expect(input).toHaveFocus();
	},
};

export const ClearMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: QUERY },
	render: PlainSearchField,
	play: async ({ args, canvas }) => {
		await userEvent.click(clearButton(canvas));

		await expect(args.onValueChange).toHaveBeenCalledWith(
			"",
		);
		await expect(searchbox(canvas)).toHaveFocus();
	},
};

export const ClearTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: QUERY },
	render: PlainSearchField,
	play: async ({ args, canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: clearButton(canvas),
		});

		await expect(args.onValueChange).toHaveBeenCalledWith(
			"",
		);
		await expect(searchbox(canvas)).toHaveFocus();
	},
};
