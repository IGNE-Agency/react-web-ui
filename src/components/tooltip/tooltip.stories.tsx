import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { textGone } from "../../lib/storybook/waits.ts";
import {
	useOverlayFrame,
	withOverlayFrame,
} from "../../lib/storybook/overlay-frame.tsx";
import { Button } from "../button/button.tsx";
import { Tooltip, type TooltipProps } from "./tooltip.tsx";

const TOOLTIP_CONTENT =
	"Downloads the selected declarations as a spreadsheet.";
const TRIGGER_LABEL = "Export";

const PAST_HOVER_DELAY_MS = 1000;

const intent = fn().mockName("intent");

const tooltipShown = () =>
	waitFor(() =>
		expect(screen.getByText(TOOLTIP_CONTENT)).toBeVisible(),
	);

const OpenTooltip = ({
	content,
	children,
	side = "top",
	sideOffset,
}: TooltipProps) => {
	const { container } = useOverlayFrame();

	return (
		<Tooltip.Root open>
			<Tooltip.Trigger render={children} />
			<Tooltip.Portal container={container}>
				<Tooltip.Positioner
					side={side}
					sideOffset={sideOffset}>
					<Tooltip.Popup>{content}</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	);
};

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{ page: "Patterns", section: "Above the page" },
			{
				page: "Principles/Interaction",
				section: "Never use the title attribute",
			},
		],
	},
	component: Tooltip,
	render: OpenTooltip,
	decorators: [withOverlayFrame("small")],
	args: {
		content: TOOLTIP_CONTENT,
		children: <Button>{TRIGGER_LABEL}</Button>,
	},
	argTypes: {
		children: { control: false },
	},
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
	play: tooltipShown,
};

export const Bottom: Story = {
	args: { side: "bottom" },
	play: tooltipShown,
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	render: Tooltip,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: TRIGGER_LABEL,
		});

		await userEvent.tab();
		await expect(trigger).toHaveFocus();
		await tooltipShown();

		await userEvent.keyboard("{Escape}");
		await textGone(TOOLTIP_CONTENT);
		await expect(trigger).toHaveFocus();

		await userEvent.tab({ shift: true });
		await expect(trigger).not.toHaveFocus();
		await textGone(TOOLTIP_CONTENT);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: Tooltip,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: TRIGGER_LABEL,
		});

		await userEvent.hover(trigger);
		await tooltipShown();

		await userEvent.unhover(trigger);
		await textGone(TOOLTIP_CONTENT);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	render: Tooltip,
	parameters: {
		docs: {
			description: {
				story:
					"Touch never opens a tooltip: base-ui opens on mouse hover and keyboard focus only, so a tap activates the trigger without a hint.",
			},
		},
	},
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: TRIGGER_LABEL,
			}),
		});

		await new Promise(resolve => {
			setTimeout(resolve, PAST_HOVER_DELAY_MS);
		});

		await expect(
			screen.queryByText(TOOLTIP_CONTENT),
		).not.toBeInTheDocument();
	},
};

export const Intent: Story = {
	tags: ["!dev", "!autodocs"],
	args: { onIntent: intent },
	render: Tooltip,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: TRIGGER_LABEL,
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
