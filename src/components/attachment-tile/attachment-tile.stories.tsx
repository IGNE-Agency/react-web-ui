import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	TagGroup as AriaTagGroup,
	TagList as AriaTagList,
} from "react-aria-components";
import {
	expect,
	fn,
	userEvent,
	within,
} from "storybook/test";
import {
	pdfFile,
	pngFile,
} from "../../lib/storybook/files.ts";
import {
	AttachmentTile,
	type AttachmentTileProps,
	SentAttachmentTile,
} from "./attachment-tile.tsx";

const TILE_ID = "invoice";
const REMOVE = "Remove";
const FILES = "Attachments";

const INVOICE = pdfFile("invoice-july.pdf");

const SCAN = pngFile("referral-letter.png");

const removed =
	fn<(keys: Set<unknown>) => void>().mockName("removed");

const InTagList = (args: AttachmentTileProps) => (
	<AriaTagGroup aria-label={FILES} onRemove={removed}>
		<AriaTagList>
			<AttachmentTile {...args} />
		</AriaTagList>
	</AriaTagGroup>
);

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
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
			{ component: "components/file-field" },
		],
	},
	component: AttachmentTile,
	render: InTagList,
	args: {
		id: TILE_ID,
		file: INVOICE,
		hint: "invoice-july.pdf (8 B)",
		removeLabel: REMOVE,
		invalid: false,
		disabled: false,
	},
} satisfies Meta<typeof AttachmentTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Document: Story = {};

export const Image: Story = {
	args: { file: SCAN, hint: "referral-letter.png (70 B)" },
};

export const Invalid: Story = {
	args: { invalid: true },
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const Fixed: Story = {
	args: { removeLabel: undefined },
	play: async ({ canvas }) => {
		await expect(
			canvas.queryByRole("button", { name: REMOVE }),
		).not.toBeInTheDocument();
	},
};

const SentDownload = () => (
	<SentAttachmentTile
		name={INVOICE.name}
		hint="invoice-july.pdf (8 B)"
		src={undefined}
		href="#invoice-july.pdf"
		label="Download invoice-july.pdf"
	/>
);

export const Sent: Story = {
	render: SentDownload,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("link", {
				name: "Download invoice-july.pdf",
			}),
		).toHaveAttribute("download", INVOICE.name);
	},
};

const SentWaiting = () => (
	<SentAttachmentTile
		name={SCAN.name}
		hint="referral-letter.png (70 B)"
		src={undefined}
		pending
	/>
);

export const SentPending: Story = {
	render: SentWaiting,
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const tile = canvas.getByRole("row", {
			name: INVOICE.name,
		});

		await userEvent.tab();
		await expect(tile).toHaveFocus();
		await userEvent.keyboard("{Delete}");

		await expect(removed).toHaveBeenCalledWith(
			new Set([TILE_ID]),
		);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(
			within(
				canvas.getByRole("row", { name: INVOICE.name }),
			).getByRole("button", { name: REMOVE }),
		);

		await expect(removed).toHaveBeenCalledWith(
			new Set([TILE_ID]),
		);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: within(
				canvas.getByRole("row", { name: INVOICE.name }),
			).getByRole("button", { name: REMOVE }),
		});

		await expect(removed).toHaveBeenCalledWith(
			new Set([TILE_ID]),
		);
	},
};
