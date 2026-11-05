import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { Accordion } from "./accordion.tsx";

const SECTIONS = [
	{
		value: "fees",
		title: "Fees",
		content: "A declaration costs nothing to send.",
	},
	{
		value: "deadlines",
		title: "Deadlines",
		content:
			"Send a declaration within 30 days of the visit.",
	},
	{
		value: "payment",
		title: "Payment",
		content:
			"Payment follows within two weeks of approval.",
	},
] as const;

const [FEES, DEADLINES] = SECTIONS;

type Canvas = ReturnType<typeof within>;

const trigger = (canvas: Canvas, title: string) =>
	canvas.getByRole("button", { name: title });

const isOpen = async (
	canvas: Canvas,
	section: (typeof SECTIONS)[number],
) => {
	await expect(
		trigger(canvas, section.title),
	).toHaveAttribute("aria-expanded", "true");
	await expect(
		await canvas.findByText(section.content),
	).toBeVisible();
};

const isShut = async (
	canvas: Canvas,
	section: (typeof SECTIONS)[number],
) => {
	await expect(
		trigger(canvas, section.title),
	).toHaveAttribute("aria-expanded", "false");
	await waitFor(() =>
		expect(
			canvas.queryByText(section.content),
		).not.toBeInTheDocument(),
	);
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{
				page: "Foundation/Motion",
				section:
					"Every transition runs only for someone who hasn't asked for less motion",
			},
			{ component: "components/collapsible" },
		],
	},
	component: Accordion.Root,
	args: {
		children: SECTIONS.map(section => (
			<Accordion.Item
				key={section.value}
				value={section.value}>
				<Accordion.Header>
					<Accordion.Trigger>
						{section.title}
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel>{section.content}</Accordion.Panel>
			</Accordion.Item>
		)),
	},
} satisfies Meta<typeof Accordion.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shut: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getAllByRole("heading", { level: 3 }),
		).toHaveLength(SECTIONS.length);
		await isShut(canvas, FEES);
	},
};

export const OneOpen: Story = {
	args: { defaultValue: [FEES.value] },
	play: async ({ canvas }) => {
		await isOpen(canvas, FEES);
	},
};

export const Multiple: Story = {
	args: {
		multiple: true,
		defaultValue: [FEES.value, DEADLINES.value],
	},
	play: async ({ canvas }) => {
		await isOpen(canvas, FEES);
		await isOpen(canvas, DEADLINES);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(trigger(canvas, FEES.title)).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await isOpen(canvas, FEES);

		await userEvent.tab();
		await expect(
			trigger(canvas, DEADLINES.title),
		).toHaveFocus();
		await userEvent.keyboard(" ");
		await isOpen(canvas, DEADLINES);
		await isShut(canvas, FEES);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(trigger(canvas, FEES.title));
		await isOpen(canvas, FEES);

		await userEvent.click(trigger(canvas, FEES.title));
		await isShut(canvas, FEES);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: trigger(canvas, DEADLINES.title),
		});
		await isOpen(canvas, DEADLINES);
	},
};
