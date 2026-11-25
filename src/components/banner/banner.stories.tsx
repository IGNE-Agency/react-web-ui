import CloudOffIcon from "@material-design-icons/svg/outlined/cloud_off.svg?react";
import ConstructionIcon from "@material-design-icons/svg/outlined/construction.svg?react";
import EditOffIcon from "@material-design-icons/svg/outlined/edit_off.svg?react";
import ErrorIcon from "@material-design-icons/svg/outlined/error_outline.svg?react";
import SellIcon from "@material-design-icons/svg/outlined/sell.svg?react";
import StorageIcon from "@material-design-icons/svg/outlined/storage.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useRef, useState } from "react";
import {
	expect,
	fn,
	userEvent,
	waitFor,
} from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { STORY_COPY } from "../../lib/storybook/story-providers.tsx";
import { Button } from "../button/button.tsx";
import { Icon } from "../icon/index.ts";
import { Banner, type BannerRootProps } from "./banner.tsx";

const READ_ONLY_TITLE = "This workspace is read-only";
const READ_ONLY_BODY =
	"An administrator archived it. You can still view and export invoices.";
const OFFLINE_TITLE = "You're offline";
const OFFLINE_BODY =
	"Changes you make are saved once you're back online.";
const OUTAGE_TITLE = "Invoices can't be sent right now";
const OUTAGE_BODY =
	"Sending is down for everyone, and we're working on it. Drafts are kept.";
const STATUS_PAGE = "View status";
const STORAGE_TITLE = "Storage almost full";
const STORAGE_BODY =
	"You've used 9.6 of 10 GB. Delete old attachments or upgrade your plan.";
const MANAGE_STORAGE = "Manage storage";
const MAINTENANCE_TITLE = "Maintenance on Sunday";
const MAINTENANCE_BODY =
	"Invoices are unavailable from 02:00 to 04:00.";
const PROMOTION_TITLE = "Black Friday: 30% off every plan";
const PROMOTION_BODY =
	"Upgrade before 1 December and keep the price for a year.";
const SEE_PLANS = "See plans";
const PAGE_HEADING = "Invoices";
const SHOW = "Show the banner";

const dismissed = fn();
const managed = fn();

const CONTENT = {
	readOnly: (
		<>
			<Banner.Icon>
				<Icon svg={EditOffIcon} label="" />
			</Banner.Icon>
			<Banner.Title>{READ_ONLY_TITLE}</Banner.Title>
			<Banner.Description>
				{READ_ONLY_BODY}
			</Banner.Description>
		</>
	),
	offline: (
		<>
			<Banner.Icon>
				<Icon svg={CloudOffIcon} label="" />
			</Banner.Icon>
			<Banner.Title>{OFFLINE_TITLE}</Banner.Title>
			<Banner.Description>
				{OFFLINE_BODY}
			</Banner.Description>
		</>
	),
	outage: (
		<>
			<Banner.Icon>
				<Icon svg={ErrorIcon} label="" />
			</Banner.Icon>
			<Banner.Title>{OUTAGE_TITLE}</Banner.Title>
			<Banner.Description>{OUTAGE_BODY}</Banner.Description>
			<Banner.Actions>
				<Button variant="secondary">{STATUS_PAGE}</Button>
			</Banner.Actions>
		</>
	),
	storage: (
		<>
			<Banner.Icon>
				<Icon svg={StorageIcon} label="" />
			</Banner.Icon>
			<Banner.Title>{STORAGE_TITLE}</Banner.Title>
			<Banner.Description>
				{STORAGE_BODY}
			</Banner.Description>
			<Banner.Actions>
				<Button variant="primary" onClick={managed}>
					{MANAGE_STORAGE}
				</Button>
			</Banner.Actions>
			<Banner.Close onClick={dismissed} />
		</>
	),
	maintenance: (
		<>
			<Banner.Icon>
				<Icon svg={ConstructionIcon} label="" />
			</Banner.Icon>
			<Banner.Title>{MAINTENANCE_TITLE}</Banner.Title>
			<Banner.Description>
				{MAINTENANCE_BODY}
			</Banner.Description>
			<Banner.Close onClick={dismissed} />
		</>
	),
	promotion: (
		<>
			<Banner.Icon>
				<Icon svg={SellIcon} label="" />
			</Banner.Icon>
			<Banner.Title>{PROMOTION_TITLE}</Banner.Title>
			<Banner.Description>
				{PROMOTION_BODY}
			</Banner.Description>
			<Banner.Actions>
				<Button variant="primary">{SEE_PLANS}</Button>
			</Banner.Actions>
			<Banner.Close onClick={dismissed} />
		</>
	),
};

const DismissedByTheApp = (
	args: BannerRootProps,
): ReactElement => {
	const [shown, setShown] = useState(true);
	const heading = useRef<HTMLHeadingElement>(null);

	return (
		<>
			{shown ? (
				<Banner.Root {...args}>
					<Banner.Title>{STORAGE_TITLE}</Banner.Title>
					<Banner.Description>
						{STORAGE_BODY}
					</Banner.Description>
					<Banner.Actions>
						<Button variant="primary" onClick={managed}>
							{MANAGE_STORAGE}
						</Button>
					</Banner.Actions>
					<Banner.Close
						onClick={() => {
							dismissed();
							setShown(false);
							heading.current?.focus();
						}}
					/>
				</Banner.Root>
			) : null}
			<h2 ref={heading} tabIndex={-1}>
				{PAGE_HEADING}
			</h2>
		</>
	);
};

const AppearsLater = (
	args: BannerRootProps,
): ReactElement => {
	const [shown, setShown] = useState(false);

	return (
		<>
			<Button onClick={() => setShown(true)}>{SHOW}</Button>
			{shown ? <Banner.Root {...args} /> : null}
		</>
	);
};

type TextWatch = Readonly<{
	changes: () => number;
	stop: () => void;
}>;

const watchText = (root: HTMLElement): TextWatch => {
	const records: MutationRecord[] = [];
	const observer = new MutationObserver(batch => {
		records.push(...batch);
	});
	observer.observe(root, {
		characterData: true,
		subtree: true,
	});
	return {
		changes: () => records.length,
		stop: () => observer.disconnect(),
	};
};

const meta = {
	parameters: {
		test: { clearMocks: true },
		designSystem: [
			{
				page: "Patterns",
				section:
					"Feedback appears where the user is looking",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Focus returns after a part removes itself",
			},
			{
				page: "Principles/Responsiveness",
				section:
					"A surface against an edge pays the safe-area inset",
			},
			{
				page: "Foundation/Elevation",
				section:
					"An element that is part of the page carries no shadow",
			},
			{
				page: "Foundation/Colour",
				section: "A status fill always takes its own ink",
			},
			{ component: "components/toast" },
			{ component: "components/status-message" },
		],
	},
	component: Banner.Root,
	args: {
		tone: "info",
		live: "status",
		edge: undefined,
		children: mappedArg(CONTENT, "readOnly"),
	},
	argTypes: {
		tone: {
			control: "radio",
			options: [
				"neutral",
				"info",
				"success",
				"warning",
				"error",
			],
		},
		live: {
			control: "radio",
			options: [undefined, "status"],
		},
		edge: {
			control: "radio",
			options: [undefined, "top", "bottom"],
		},
		children: {
			options: Object.keys(CONTENT),
			mapping: CONTENT,
			control: "radio",
		},
	},
} satisfies Meta<typeof Banner.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
	play: async ({ canvas }) => {
		const banner = canvas.getByRole("region", {
			name: READ_ONLY_TITLE,
		});

		await expect(banner).toHaveTextContent(READ_ONLY_BODY);
		await expect(banner).toHaveAttribute(
			"aria-live",
			"polite",
		);
		await expect(
			canvas.queryByRole("button"),
		).not.toBeInTheDocument();
	},
};

export const Offline: Story = {
	args: {
		tone: "warning",
		children: mappedArg(CONTENT, "offline"),
	},
};

export const Outage: Story = {
	args: {
		tone: "error",
		children: mappedArg(CONTENT, "outage"),
	},
};

export const Dismissable: Story = {
	args: {
		tone: "warning",
		children: mappedArg(CONTENT, "storage"),
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", {
				name: STORY_COPY.close,
			}),
		).toBeVisible();
	},
};

export const Promotion: Story = {
	args: {
		tone: "info",
		live: undefined,
		children: mappedArg(CONTENT, "promotion"),
	},
	play: async ({ canvas }) => {
		const banner = canvas.getByRole("region", {
			name: PROMOTION_TITLE,
		});

		await expect(banner).not.toHaveAttribute("aria-live");
		await expect(
			canvas.queryByRole("status"),
		).not.toBeInTheDocument();
	},
};

export const Neutral: Story = {
	args: {
		tone: "neutral",
		children: mappedArg(CONTENT, "maintenance"),
	},
};

export const AgainstTheTopEdge: Story = {
	args: {
		tone: "warning",
		edge: "top",
		children: mappedArg(CONTENT, "offline"),
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("region", { name: OFFLINE_TITLE }),
		).toHaveAttribute("data-edge", "top");
	},
};

export const CloseKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { tone: "warning" },
	render: DismissedByTheApp,
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: MANAGE_STORAGE }),
		).toHaveFocus();

		await userEvent.tab();
		await expect(
			canvas.getByRole("button", {
				name: STORY_COPY.close,
			}),
		).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await expect(dismissed).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(
				canvas.queryByRole("region", {
					name: STORAGE_TITLE,
				}),
			).not.toBeInTheDocument(),
		);
		await expect(
			canvas.getByRole("heading", { name: PAGE_HEADING }),
		).toHaveFocus();
	},
};

export const CloseMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { tone: "warning" },
	render: DismissedByTheApp,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: STORY_COPY.close,
			}),
		);
		await expect(dismissed).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(
				canvas.queryByRole("region", {
					name: STORAGE_TITLE,
				}),
			).not.toBeInTheDocument(),
		);
	},
};

export const CloseTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { tone: "warning" },
	render: DismissedByTheApp,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: STORY_COPY.close,
			}),
		});
		await expect(dismissed).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(
				canvas.queryByRole("region", {
					name: STORAGE_TITLE,
				}),
			).not.toBeInTheDocument(),
		);
	},
};

export const AnnouncedWhenItAppears: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		tone: "warning",
		live: "status",
		children: mappedArg(CONTENT, "offline"),
	},
	render: AppearsLater,
	play: async ({ canvasElement, canvas }) => {
		const watch = watchText(canvasElement);

		await userEvent.click(
			canvas.getByRole("button", { name: SHOW }),
		);

		await expect(
			canvas.getByRole("region", { name: OFFLINE_TITLE }),
		).toHaveAttribute("aria-live", "polite");
		await waitFor(() =>
			expect(watch.changes()).toBeGreaterThan(0),
		);
		watch.stop();
	},
};

export const QuietWithoutLive: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		tone: "info",
		live: undefined,
		children: mappedArg(CONTENT, "promotion"),
	},
	render: AppearsLater,
	play: async ({ canvasElement, canvas }) => {
		const watch = watchText(canvasElement);

		await userEvent.click(
			canvas.getByRole("button", { name: SHOW }),
		);

		await expect(
			canvas.getByRole("region", { name: PROMOTION_TITLE }),
		).not.toHaveAttribute("aria-live");
		await new Promise(resolve => {
			setTimeout(resolve, 400);
		});
		watch.stop();
		await expect(watch.changes()).toBe(0);
	},
};
