import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import MoreHorizIcon from "@material-design-icons/svg/outlined/more_horiz.svg?react";
import type {
	Decorator,
	Meta,
	StoryObj,
} from "@storybook/react-vite";
import { createLink, Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { createStoryRouter } from "../../lib/storybook/story-router.tsx";
import { roleGone } from "../../lib/storybook/waits.ts";
import { Icon } from "../icon/icon.tsx";
import { Menu } from "../menu/menu.tsx";
import { Breadcrumbs, type Crumb } from "./breadcrumbs.tsx";

const TRAIL_LABEL = "Breadcrumbs";
const MORE = "Show more";
const HOME = "Home";
const REGION = "Region Heerenveen and surroundings";
const DECLARATIONS = "Declarations";
const OUTSTANDING = "Outstanding";
const PAGE = "Declaration 2041";
const LONG_PAGE =
	"Declaration 2041 for the physiotherapy sessions of March and April";

const START = "/declarations/2041";
const OUTSTANDING_PATH = "/region/declarations/outstanding";

const CURRENT = { selector: '[aria-current="page"]' };

const SEPARATOR = <Icon svg={ChevronRightIcon} label="" />;
const MORE_ICON = <Icon svg={MoreHorizIcon} label="" />;

const { history, decorator, reset } =
	createStoryRouter(START);

const BreadcrumbLink = createLink(Breadcrumbs.Link);
const linkRef = fn();

const CRUMBS: readonly Crumb[] = [
	{ id: "home", label: HOME, render: <Link to="/" /> },
	{
		id: "region",
		label: REGION,
		render: <Link to="/region" />,
	},
	{
		id: "declarations",
		label: DECLARATIONS,
		render: <Link to="/region/declarations" />,
	},
	{
		id: "outstanding",
		label: OUTSTANDING,
		render: <Link to={OUTSTANDING_PATH} />,
	},
	{ id: "declaration", label: PAGE },
];

const LONG_CRUMBS: readonly Crumb[] = [
	{ id: "home", label: HOME, render: <Link to="/" /> },
	{ id: "declaration", label: LONG_PAGE },
];

const width =
	(inlineSize: string): Decorator =>
	Story => (
		<div style={{ inlineSize }}>
			<Story />
		</div>
	);

const narrow = width("20rem");

const ByHand = (): ReactElement => (
	<Breadcrumbs.Root aria-label={TRAIL_LABEL}>
		<Breadcrumbs.List>
			<Breadcrumbs.Item>
				<BreadcrumbLink to="/" ref={linkRef}>
					{HOME}
				</BreadcrumbLink>
			</Breadcrumbs.Item>
			<Breadcrumbs.Separator>/</Breadcrumbs.Separator>
			<Breadcrumbs.Item>
				<Breadcrumbs.Overflow label={MORE} icon={MORE_ICON}>
					<Menu.LinkItem render={<Link to="/region" />}>
						{REGION}
					</Menu.LinkItem>
				</Breadcrumbs.Overflow>
			</Breadcrumbs.Item>
			<Breadcrumbs.Separator>/</Breadcrumbs.Separator>
			<Breadcrumbs.Item>
				<Breadcrumbs.Page>{PAGE}</Breadcrumbs.Page>
			</Breadcrumbs.Item>
		</Breadcrumbs.List>
	</Breadcrumbs.Root>
);

const navigatedTo = (pathname: string) =>
	waitFor(() =>
		expect(history.location.pathname).toBe(pathname),
	);

const hints = (canvasElement: HTMLElement, text: string) =>
	screen
		.queryAllByText(text)
		.filter(element => !canvasElement.contains(element));

const meta = {
	parameters: {
		layout: "padded",
		designSystem: [
			{ page: "Patterns", section: "Finding your way" },
			{
				page: "Foundation/Type",
				section:
					"Text that does not fit is folded, never mangled",
			},
			{ component: "components/menu" },
		],
		test: { clearMocks: true },
	},
	component: Breadcrumbs,
	decorators: [decorator],
	beforeEach: reset,
	args: {
		label: TRAIL_LABEL,
		overflowLabel: MORE,
		overflowIcon: MORE_ICON,
		separator: SEPARATOR,
		crumbs: CRUMBS,
	},
	argTypes: {
		crumbs: { control: false },
		overflowIcon: { control: false },
		separator: { control: false },
	},
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("navigation", { name: TRAIL_LABEL }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole("link", { name: DECLARATIONS }),
		).toHaveAttribute("href", "/region/declarations");
		await expect(
			canvas.getByText(PAGE, CURRENT),
		).toHaveAttribute("aria-current", "page");
		await expect(
			canvas.queryByRole("button", { name: MORE }),
		).not.toBeInTheDocument();
	},
};

export const Folded: Story = {
	decorators: [narrow],
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("button", { name: MORE }),
		).toBeVisible();
		await expect(
			canvas.getByRole("link", { name: HOME }),
		).toBeVisible();
		await expect(
			canvas.getByText(PAGE, CURRENT),
		).toBeVisible();
		await expect(
			canvas.queryByRole("link", { name: REGION }),
		).not.toBeInTheDocument();
	},
};

export const Clipped: Story = {
	decorators: [width("16rem")],
	args: { crumbs: LONG_CRUMBS },
};

export const PartsByHand: Story = {
	render: ByHand,
};

export const RouterLinkProps: Story = {
	tags: ["!dev", "!autodocs"],
	render: ByHand,
	play: async ({ canvas }) => {
		const home = canvas.getByRole("link", { name: HOME });

		await expect(home).toHaveAttribute("href", "/");
		await expect(linkRef).toHaveBeenCalledWith(home);

		await userEvent.click(home);
		await navigatedTo("/");
	},
};

export const OverflowKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [narrow],
	play: async ({ canvas }) => {
		const button = await canvas.findByRole("button", {
			name: MORE,
		});

		await userEvent.tab();
		await expect(
			canvas.getByRole("link", { name: HOME }),
		).toHaveFocus();
		await userEvent.tab();
		await expect(button).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(
				screen.getByRole("menuitem", { name: REGION }),
			).toHaveFocus(),
		);

		await userEvent.keyboard("{Escape}");
		await roleGone("menu");
		await expect(button).toHaveFocus();
	},
};

export const OverflowMouse: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [narrow],
	play: async ({ canvas }) => {
		await userEvent.click(
			await canvas.findByRole("button", { name: MORE }),
		);

		await userEvent.click(
			await screen.findByRole("menuitem", {
				name: OUTSTANDING,
			}),
		);

		await navigatedTo(OUTSTANDING_PATH);
		await roleGone("menu");
	},
};

export const OverflowTouch: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [narrow],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await canvas.findByRole("button", {
				name: MORE,
			}),
		});

		await userEvent.pointer({
			keys: "[TouchA]",
			target: await screen.findByRole("menuitem", {
				name: OUTSTANDING,
			}),
		});

		await navigatedTo(OUTSTANDING_PATH);
	},
};

export const ClippedHint: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [width("16rem")],
	args: { crumbs: LONG_CRUMBS },
	play: async ({ canvas, canvasElement }) => {
		await userEvent.hover(
			canvas.getByText(LONG_PAGE, CURRENT),
		);
		await waitFor(() =>
			expect(
				hints(canvasElement, LONG_PAGE)[0],
			).toBeVisible(),
		);
		await userEvent.unhover(
			canvas.getByText(LONG_PAGE, CURRENT),
		);

		await userEvent.hover(
			canvas.getByRole("link", { name: HOME }),
		);
		await expect(hints(canvasElement, HOME)).toHaveLength(
			0,
		);
	},
};
