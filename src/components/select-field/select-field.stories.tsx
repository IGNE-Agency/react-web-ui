import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	within,
} from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { OPTIONS_LOADS } from "../../lib/storybook/options-load.ts";
import { STORY_COPY } from "../../lib/storybook/story-providers.tsx";
import {
	optionFocused,
	optionHighlighted,
	roleGone,
} from "../../lib/storybook/waits.ts";
import { Field } from "../field/index.ts";
import { Icon } from "../icon/index.ts";
import { Select } from "./select.tsx";
import {
	SelectField,
	type SelectFieldProps,
} from "./select-field.tsx";
import { TSFSelectField } from "./tsf-select-field.tsx";

const LABEL = "Status";
const OPEN_LABEL = "Open";
const SENT_LABEL = "Sent";
const PAID_LABEL = "Paid";
const DESCRIPTION = "The status the invoice is in now.";
const PAID_ERROR =
	"A paid invoice cannot be reopened here.";

const STATUS_OPTIONS = [
	{ value: "open", label: OPEN_LABEL },
	{ value: "sent", label: SENT_LABEL },
	{ value: "paid", label: PAID_LABEL },
];

const valueChange =
	fn<(value: string) => void>().mockName("valueChange");
const blurred = fn().mockName("blurred");

const ControlledSelectField = (
	args: SelectFieldProps<string>,
) => {
	const [, updateArgs] =
		useArgs<SelectFieldProps<string>>();

	return (
		<SelectField
			{...args}
			onValueChange={value => {
				args.onValueChange?.(value);
				updateArgs({ value });
			}}
		/>
	);
};

const PlainSelectField = (
	args: SelectFieldProps<string>,
) => <SelectField {...args} />;

const ComposedSelect = () => {
	const [value, setValue] = useState<string | null>(null);

	return (
		<Select.Root
			options={STATUS_OPTIONS}
			value={value}
			onValueChange={setValue}
			errors={value === "paid" ? [PAID_ERROR] : undefined}
			requiredness="required">
			<Select.Label>
				{LABEL} <Field.Requiredness />
			</Select.Label>
			<Select.Trigger>
				<Select.Value placeholder="Choose a status" />
				<Select.Icon>
					<Icon svg={ExpandMoreIcon} label="" />
				</Select.Icon>
			</Select.Trigger>
			<Select.Portal>
				<Select.Positioner>
					<Select.Popup>
						<Select.List>
							<Select.Items />
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
			<Select.Description>{DESCRIPTION}</Select.Description>
			<Select.Error />
		</Select.Root>
	);
};

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Where you type" },
			{
				page: "Patterns",
				section:
					"Every popup that lists things shares one surface and one row",
			},
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
			{
				component: "components/field",
				section:
					"Every control comes in three tiers, and the primitive draws the field frame",
			},
		],
		tiers: {
			primitive: {
				"Select.Root": Select.Root,
			},
			connector: { TSFSelectField },
		},
	},
	component: SelectField,
	render: ControlledSelectField,
	args: {
		label: LABEL,
		placeholder: "Choose a status",
		options: STATUS_OPTIONS,
		value: null,
		load: mappedArg(OPTIONS_LOADS, "loaded"),
		onValueChange: valueChange,
		onBlur: blurred,
	},
	argTypes: {
		value: { control: "text" },
		load: {
			options: Object.keys(OPTIONS_LOADS),
			mapping: OPTIONS_LOADS,
			control: "radio",
		},
	},
} satisfies Meta<typeof SelectField<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const trigger = (canvas: Canvas) =>
	canvas.getByRole("combobox", { name: LABEL });

export const Placeholder: Story = {};

export const Filled: Story = {
	args: { value: "sent" },
};

export const Disabled: Story = {
	args: { value: "sent", disabled: true },
};

export const ReadOnly: Story = {
	args: { value: "sent", readOnly: true },
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

export const Pending: Story = {
	args: { value: "sent", pending: true },
};

export const WithDescription: Story = {
	args: {
		description: DESCRIPTION,
	},
};

export const Composed: Story = {
	tags: ["!dev", "!autodocs"],
	render: ComposedSelect,
	play: async ({ canvas }) => {
		const control = trigger(canvas);

		await expect(control).toHaveAccessibleName(LABEL);
		await expect(control).toHaveAccessibleDescription(
			DESCRIPTION,
		);
		await expect(control).toHaveAttribute(
			"aria-required",
			"true",
		);

		await userEvent.click(control);
		await userEvent.click(
			await screen.findByRole("option", {
				name: PAID_LABEL,
			}),
		);
		await roleGone("listbox");

		const error = await canvas.findByRole("alert");
		await expect(error).toHaveTextContent(PAID_ERROR);
		await expect(
			control.getAttribute("aria-describedby")?.split(" "),
		).toContain(error.id);
	},
};

export const Open: Story = {
	tags: ["!autodocs"],
	args: { value: "sent" },
	play: async ({ canvas }) => {
		await expect(trigger(canvas)).toHaveTextContent(
			SENT_LABEL,
		);

		await userEvent.click(trigger(canvas));

		await expect(
			await screen.findByRole("option", {
				name: SENT_LABEL,
			}),
		).toHaveAttribute("aria-selected", "true");
	},
};

export const Loading: Story = {
	tags: ["!autodocs"],
	args: {
		options: [],
		load: mappedArg(OPTIONS_LOADS, "loading"),
	},
	play: async ({ canvas }) => {
		await userEvent.click(trigger(canvas));

		await expect(
			await screen.findByRole("status"),
		).toHaveTextContent(STORY_COPY.options.loading);
	},
};

export const Empty: Story = {
	tags: ["!autodocs"],
	args: { options: [] },
	play: async ({ canvas }) => {
		await userEvent.click(trigger(canvas));

		await expect(
			await screen.findByRole("status"),
		).toHaveTextContent(STORY_COPY.options.empty);
	},
};

export const Failed: Story = {
	tags: ["!autodocs"],
	args: {
		options: [],
		load: mappedArg(OPTIONS_LOADS, "failed"),
	},
	play: async ({ canvas }) => {
		await userEvent.click(trigger(canvas));

		await expect(
			await screen.findByRole("status"),
		).toHaveTextContent(STORY_COPY.options.loadFailed);
	},
};

export const Retry: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		options: [],
		load: mappedArg(OPTIONS_LOADS, "failed"),
	},
	play: async ({ canvas }) => {
		await userEvent.click(trigger(canvas));
		await userEvent.click(
			await screen.findByRole("button", {
				name: STORY_COPY.retry,
			}),
		);

		await expect(
			OPTIONS_LOADS.failed.retry,
		).toHaveBeenCalledOnce();
	},
};

export const Broken: Story = {
	tags: ["!autodocs"],
	args: {
		options: [],
		load: mappedArg(OPTIONS_LOADS, "broken"),
	},
	play: async ({ canvas }) => {
		await userEvent.click(trigger(canvas));

		await expect(
			await screen.findByRole("status"),
		).toHaveTextContent(STORY_COPY.options.loadBroken);
		await expect(
			screen.queryByRole("button", {
				name: STORY_COPY.retry,
			}),
		).not.toBeInTheDocument();
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainSelectField,
	play: async ({ canvas }) => {
		const control = trigger(canvas);

		await userEvent.tab();
		await expect(control).toHaveFocus();

		await userEvent.keyboard("{ArrowDown}");
		await optionFocused(OPEN_LABEL);
		await userEvent.keyboard("{ArrowDown}");
		await optionHighlighted(SENT_LABEL);
		await userEvent.keyboard("{Escape}");
		await roleGone("listbox");
		await expect(control).toHaveFocus();

		await userEvent.keyboard(" ");
		await optionFocused(OPEN_LABEL);
		await userEvent.keyboard("{Escape}");
		await roleGone("listbox");
		await expect(valueChange).not.toHaveBeenCalled();

		await userEvent.keyboard("{Enter}");
		await optionFocused(OPEN_LABEL);
		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await optionHighlighted(PAID_LABEL);
		await userEvent.keyboard("{ArrowUp}");
		await optionHighlighted(SENT_LABEL);
		await userEvent.keyboard("{Enter}");
		await roleGone("listbox");

		await expect(control).toHaveFocus();
		await expect(control).toHaveTextContent(SENT_LABEL);
		await expect(valueChange).toHaveBeenCalledWith("sent");
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainSelectField,
	play: async ({ canvas }) => {
		const control = trigger(canvas);

		await userEvent.click(control);
		await userEvent.click(
			await screen.findByRole("option", {
				name: PAID_LABEL,
			}),
		);
		await roleGone("listbox");

		await expect(control).toHaveTextContent(PAID_LABEL);
		await expect(valueChange).toHaveBeenCalledWith("paid");
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainSelectField,
	play: async ({ canvas }) => {
		const control = trigger(canvas);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: control,
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await screen.findByRole("option", {
				name: OPEN_LABEL,
			}),
		});
		await roleGone("listbox");

		await expect(control).toHaveTextContent(OPEN_LABEL);
		await expect(valueChange).toHaveBeenCalledWith("open");
	},
};

export const BlurOnLeave: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainSelectField,
	play: async ({ canvas }) => {
		const control = trigger(canvas);

		await userEvent.tab();
		await expect(control).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await optionFocused(OPEN_LABEL);
		await userEvent.keyboard("{Enter}");
		await roleGone("listbox");
		await expect(control).toHaveFocus();
		await expect(blurred).not.toHaveBeenCalled();

		await userEvent.tab();
		await expect(control).not.toHaveFocus();
		await expect(blurred).toHaveBeenCalledOnce();
	},
};

export const BlurOnPressAway: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainSelectField,
	play: async ({ canvas, canvasElement }) => {
		const control = trigger(canvas);

		await userEvent.click(control);
		await userEvent.click(
			await screen.findByRole("option", {
				name: PAID_LABEL,
			}),
		);
		await roleGone("listbox");
		await expect(control).toHaveFocus();
		await expect(blurred).not.toHaveBeenCalled();

		await userEvent.click(canvasElement);

		await expect(control).not.toHaveFocus();
		await waitFor(() =>
			expect(blurred).toHaveBeenCalledOnce(),
		);
	},
};

const nextFrame = () =>
	new Promise(resolve => {
		requestAnimationFrame(resolve);
	});

const blurOnceClosed = (control: HTMLElement) =>
	new Promise<void>(resolve => {
		const observer = new MutationObserver(() => {
			if (
				screen.queryByRole("listbox") === null &&
				document.activeElement === control
			) {
				observer.disconnect();
				control.blur();
				resolve();
			}
		});
		observer.observe(document.body, {
			subtree: true,
			childList: true,
			attributes: true,
		});
	});

export const BlurInTheFrameItCloses: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: undefined },
	render: PlainSelectField,
	play: async ({ canvas }) => {
		const control = trigger(canvas);

		await userEvent.click(control);
		const option = await screen.findByRole("option", {
			name: PAID_LABEL,
		});
		const left = blurOnceClosed(control);
		await userEvent.click(option);
		await left;
		await nextFrame();
		await nextFrame();

		await expect(control).not.toHaveFocus();
		await expect(blurred).toHaveBeenCalledOnce();
	},
};
