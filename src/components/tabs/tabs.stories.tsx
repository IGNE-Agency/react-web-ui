import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import {
	expect,
	fn,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { Tabs, type TabsRootProps } from "./tabs.tsx";

const BAR_LABEL = "Invoice";
const DETAILS = "Details";
const HISTORY = "History";
const NOTES = "Notes";

const PANELS = [
	{ value: "details", label: DETAILS },
	{ value: "history", label: HISTORY },
	{ value: "notes", label: NOTES },
] as const;

const changed = fn().mockName("onValueChange");

const TabsPanels = (): ReactElement => (
	<>
		{PANELS.map(panel => (
			<Tabs.Panel key={panel.value} value={panel.value}>
				<p>{`${panel.label} of invoice 2041.`}</p>
			</Tabs.Panel>
		))}
	</>
);

const TabsExample = (args: TabsRootProps): ReactElement => (
	<Tabs.Root {...args}>
		<Tabs.List label={BAR_LABEL}>
			<Tabs.Tab value="details">{DETAILS}</Tabs.Tab>
			<Tabs.Tab value="history">{HISTORY}</Tabs.Tab>
			<Tabs.Tab value="notes">{NOTES}</Tabs.Tab>
			<Tabs.Indicator />
		</Tabs.List>
		<TabsPanels />
	</Tabs.Root>
);

const CountedTabs = (args: TabsRootProps): ReactElement => (
	<Tabs.Root {...args}>
		<Tabs.List label={BAR_LABEL}>
			<Tabs.Tab value="details">{DETAILS}</Tabs.Tab>
			<Tabs.Tab value="history">
				{HISTORY}
				<Tabs.Count>12</Tabs.Count>
			</Tabs.Tab>
			<Tabs.Tab value="notes">
				{NOTES}
				<Tabs.Count>3</Tabs.Count>
			</Tabs.Tab>
			<Tabs.Indicator />
		</Tabs.List>
		<TabsPanels />
	</Tabs.Root>
);

const DisabledTab = (args: TabsRootProps): ReactElement => (
	<Tabs.Root {...args}>
		<Tabs.List label={BAR_LABEL}>
			<Tabs.Tab value="details">{DETAILS}</Tabs.Tab>
			<Tabs.Tab value="history">{HISTORY}</Tabs.Tab>
			<Tabs.Tab value="notes" disabled>
				{NOTES}
			</Tabs.Tab>
			<Tabs.Indicator />
		</Tabs.List>
		<TabsPanels />
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
			`${label} of invoice 2041.`,
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
	render: CountedTabs,
};

export const WithDisabledTab: Story = {
	render: DisabledTab,
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
