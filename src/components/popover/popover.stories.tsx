import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import {
	useOpenArg,
	useOverlayFrame,
	withOverlayFrame,
} from "../../lib/storybook/overlay-frame.tsx";
import { roleGone } from "../../lib/storybook/waits.ts";
import { Button } from "../button/button.tsx";
import { Popover } from "./popover.tsx";
import styles from "./popover.stories.module.scss";

const SHOW_DETAILS = "Show client details";
const LOADING = "Loading client details";
const CLIENT_NAME = "Jan de Vries";
const INDUSTRY = "Hospitality and leisure";

type PopoverExampleProps = ComponentProps<
	typeof Popover.Root
>;

const ROWS = [
	{
		label: "KvK number:",
		value: "12345678",
		numeric: true,
	},
	{
		label: "Debtor number:",
		value: "123456789",
		numeric: true,
	},
	{ label: "Purchase order required:", value: "Yes" },
	{ label: "Rate card:", value: "RC05" },
	{ label: "Industry:", value: INDUSTRY },
	{
		label: "Engagement:",
		value: "Retainer for design and strategy work",
	},
];

const intent = fn().mockName("intent");

const PopoverParts = ({
	loading,
	onIntent,
}: Readonly<{
	loading: boolean;
	onIntent?: () => void;
}>) => {
	const { container } = useOverlayFrame();

	return (
		<>
			<Button
				render={<Popover.Trigger onIntent={onIntent} />}>
				{SHOW_DETAILS}
			</Button>
			<Popover.Content
				container={container}
				loading={loading}
				loadingLabel={LOADING}>
				<Popover.Arrow />
				<Popover.Title>
					<Popover.Skeleton>{CLIENT_NAME}</Popover.Skeleton>
				</Popover.Title>
				<Popover.Rows>
					{ROWS.map(row => (
						<Popover.Row key={row.label}>
							<Popover.RowLabel>
								{row.label}
							</Popover.RowLabel>
							<Popover.RowValue numeric={row.numeric}>
								<Popover.Skeleton>
									{row.value}
								</Popover.Skeleton>
							</Popover.RowValue>
						</Popover.Row>
					))}
				</Popover.Rows>
			</Popover.Content>
		</>
	);
};

const PopoverExample = (props: PopoverExampleProps) => (
	<Popover.Root {...props}>
		<PopoverParts loading={false} />
	</Popover.Root>
);

const LoadingPopover = (props: PopoverExampleProps) => (
	<Popover.Root {...props}>
		<PopoverParts loading />
	</Popover.Root>
);

const IntentPopover = (props: PopoverExampleProps) => (
	<Popover.Root {...props}>
		<PopoverParts loading={false} onIntent={intent} />
	</Popover.Root>
);

const EDGE_PADDING_PX = 64;

const EdgePaddingPopover = (props: PopoverExampleProps) => (
	<div className={styles.atStartEdge}>
		<PopoverExample {...props} />
	</div>
);

const ControlledPopover = (args: PopoverExampleProps) => {
	const setOpen = useOpenArg();

	return (
		<PopoverExample
			{...args}
			onOpenChange={(open, details) => {
				args.onOpenChange?.(open, details);
				setOpen(open);
			}}
		/>
	);
};

const popover = () =>
	screen.findByRole("dialog", {
		name: CLIENT_NAME,
	});

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Above the page" },
			{
				page: "Foundation/Elevation",
				section:
					"A popup with an arrow casts one shadow around the whole silhouette",
			},
			{
				page: "Principles/Separation",
				section:
					"An arrow on an unoutlined popup has no stroke",
			},
		],
	},
	component: Popover.Root,
	render: ControlledPopover,
	decorators: [withOverlayFrame("medium")],
	args: {
		open: true,
		onOpenChange: fn(),
	},
	argTypes: {
		open: { control: "boolean" },
	},
} satisfies Meta<typeof Popover.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
	play: async () => {
		await expect(await popover()).toHaveTextContent(
			INDUSTRY,
		);
	},
};

export const Loading: Story = {
	render: LoadingPopover,
	play: async () => {
		await expect(
			await screen.findByRole("status"),
		).toHaveTextContent(LOADING);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: PopoverExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: SHOW_DETAILS,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		const popup = await popover();
		await waitFor(() =>
			expect(popup.contains(document.activeElement)).toBe(
				true,
			),
		);
		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
		await expect(trigger).toHaveFocus();

		await userEvent.keyboard(" ");
		await popover();
		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
		await expect(trigger).toHaveFocus();

		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			4,
		);
		await expect(
			args.onOpenChange,
		).toHaveBeenLastCalledWith(false, expect.anything());
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: PopoverExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: SHOW_DETAILS,
		});

		await userEvent.click(trigger);
		await popover();
		await userEvent.click(trigger);
		await roleGone("dialog");

		await userEvent.click(trigger);
		await popover();
		await userEvent.click(document.body);
		await roleGone("dialog");

		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			4,
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: PopoverExample,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: SHOW_DETAILS,
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: trigger,
		});
		await popover();
		await userEvent.pointer({
			keys: "[TouchA]",
			target: document.body,
		});
		await roleGone("dialog");

		await expect(args.onOpenChange).toHaveBeenCalledTimes(
			2,
		);
	},
};

export const Intent: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: undefined },
	render: IntentPopover,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: SHOW_DETAILS,
		});

		await userEvent.hover(trigger);
		await waitFor(() =>
			expect(intent).toHaveBeenCalledOnce(),
		);
		await userEvent.unhover(trigger);

		await userEvent.tab();
		await expect(trigger).toHaveFocus();
		await expect(intent).toHaveBeenCalledTimes(2);
	},
};

export const EdgePadding: Story = {
	tags: ["!dev", "!autodocs"],
	render: EdgePaddingPopover,
	parameters: {
		docs: {
			description: {
				story:
					"The positioner keeps the `--popup-edge-padding` knob's distance from the viewport's edges, read at runtime.",
			},
		},
	},
	beforeEach: () => {
		const root = document.documentElement;
		root.style.setProperty(
			"--popup-edge-padding",
			`${EDGE_PADDING_PX}px`,
		);
		return () => {
			root.style.removeProperty("--popup-edge-padding");
		};
	},
	play: async () => {
		const popup = await popover();

		await waitFor(() =>
			expect(
				Math.round(popup.getBoundingClientRect().left),
			).toBeGreaterThanOrEqual(EDGE_PADDING_PX),
		);
	},
};
