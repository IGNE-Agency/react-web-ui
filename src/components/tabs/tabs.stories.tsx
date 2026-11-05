import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import {
	expect,
	fn,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import {
	type Tab,
	Tabs,
	type TabsRootProps,
} from "./tabs.tsx";

const BAR_LABEL = "Declaration";
const DETAILS = "Details";
const HISTORY = "History";
const NOTES = "Notes";

const TABS: readonly Tab[] = [
	{ value: "details", label: DETAILS },
	{ value: "history", label: HISTORY },
	{ value: "notes", label: NOTES },
];

const COUNTED_TABS: readonly Tab[] = [
	{ value: "details", label: DETAILS },
	{ value: "history", label: HISTORY, count: 12 },
	{ value: "notes", label: NOTES, count: 3 },
];

const changed = fn().mockName("onValueChange");

const TabsExample = (args: TabsRootProps): ReactElement => (
	<Tabs.Root {...args}>
		<Tabs.Bar label={BAR_LABEL} />
		{args.tabs.map(tab => (
			<Tabs.Panel key={tab.value} value={tab.value}>
				<p>{`${tab.label} of declaration 2041.`}</p>
			</Tabs.Panel>
		))}
	</Tabs.Root>
);

type Canvas = ReturnType<typeof within>;

const tab = (canvas: Canvas, name: string) =>
	canvas.getByRole("tab", { name });

const selected = (element: HTMLElement) =>
	waitFor(() =>
		expect(element).toHaveAttribute(
			"aria-selected",
			"true",
		),
	);

const panelShows = (canvas: Canvas, label: string) =>
	waitFor(() =>
		expect(canvas.getByRole("tabpanel")).toHaveTextContent(
			`${label} of declaration 2041.`,
		),
	);

const meta = {
	parameters: {
		layout: "padded",
		designSystem: [
			{ page: "Patterns", section: "Finding your way" },
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/nav" },
		],
		test: { clearMocks: true },
	},
	component: Tabs.Root,
	render: TabsExample,
	args: {
		tabs: TABS,
		defaultValue: "details",
		onValueChange: changed,
		children: null,
	},
} satisfies Meta<typeof Tabs.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("tablist", { name: BAR_LABEL }),
		).toBeInTheDocument();
		await selected(tab(canvas, DETAILS));
		await panelShows(canvas, DETAILS);
	},
};

export const SecondOpen: Story = {
	args: { defaultValue: "history" },
};

export const WithCounts: Story = {
	args: { tabs: COUNTED_TABS },
};

export const WithDisabledTab: Story = {
	args: {
		tabs: [
			...TABS.slice(0, 2),
			{ value: "notes", label: NOTES, disabled: true },
		],
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const details = tab(canvas, DETAILS);
		const history = tab(canvas, HISTORY);
		const notes = tab(canvas, NOTES);

		await userEvent.tab();
		await expect(details).toHaveFocus();

		await userEvent.keyboard("{ArrowRight}");
		await expect(history).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await selected(history);
		await panelShows(canvas, HISTORY);
		await expect(changed).toHaveBeenLastCalledWith(
			"history",
		);

		await userEvent.keyboard("{ArrowRight}");
		await expect(notes).toHaveFocus();
		await userEvent.keyboard(" ");
		await selected(notes);

		await userEvent.keyboard("{ArrowRight}");
		await expect(details).toHaveFocus();
		await userEvent.keyboard("{ArrowLeft}");
		await expect(notes).toHaveFocus();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const history = tab(canvas, HISTORY);

		await userEvent.click(history);

		await selected(history);
		await panelShows(canvas, HISTORY);
		await expect(changed).toHaveBeenCalledWith("history");
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const notes = tab(canvas, NOTES);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: notes,
		});

		await selected(notes);
		await panelShows(canvas, NOTES);
	},
};
