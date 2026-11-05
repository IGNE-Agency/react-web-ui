import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import HomeIcon from "@material-design-icons/svg/outlined/home.svg?react";
import LogoutIcon from "@material-design-icons/svg/outlined/logout.svg?react";
import MailIcon from "@material-design-icons/svg/outlined/mail.svg?react";
import MenuIcon from "@material-design-icons/svg/outlined/menu.svg?react";
import MenuOpenIcon from "@material-design-icons/svg/outlined/menu_open.svg?react";
import MoreIcon from "@material-design-icons/svg/outlined/more_horiz.svg?react";
import PeopleIcon from "@material-design-icons/svg/outlined/people.svg?react";
import SettingsIcon from "@material-design-icons/svg/outlined/settings.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	createLink,
	useLocation,
} from "@tanstack/react-router";
import { type ReactElement, useState } from "react";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { createStoryRouter } from "../../lib/storybook/story-router.tsx";
import { Button } from "../button/button.tsx";
import { Drawer } from "../drawer/drawer.tsx";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
import { Nav, type NavRootProps } from "./nav.tsx";
import { NavItemView } from "./nav-item-view.tsx";
import styles from "./nav.stories.module.scss";

const NAV_LABEL = "Main";
const TABS_LABEL = "Invoices";
const HOME = "Home";
const INVOICES = "Invoices";
const INCOMPLETE = "Incomplete";
const OUTSTANDING = "Outstanding";
const SENT = "Sent";
const CLIENTS = "Clients";
const INBOX = "Inbox";
const SETTINGS = "Settings";
const SIGN_OUT = "Sign out";
const SUBPAGES = "Show subpages";
const MORE = "More";
const CLOSE_MORE = "Close more";
const TOGGLE_RAIL = "Collapse or expand the navigation";

const START = "/invoices/incomplete";
const SETTINGS_PATH = "/settings";
const OUTSTANDING_PATH = "/invoices/outstanding";
const SENT_PATH = "/invoices/sent";

const { history, decorator, reset } =
	createStoryRouter(START);

const NavLink = createLink(Nav.Link);

const signOut = fn().mockName("signOut");
const linkRef = fn();

type Destination = Readonly<{
	to: string;
	label: string;
	icon: SvgComponent;
}>;

const DESTINATIONS: readonly Destination[] = [
	{ to: "/", label: HOME, icon: HomeIcon },
	{
		to: "/invoices",
		label: INVOICES,
		icon: DescriptionIcon,
	},
	{ to: "/clients", label: CLIENTS, icon: PeopleIcon },
	{ to: "/inbox", label: INBOX, icon: MailIcon },
	{
		to: SETTINGS_PATH,
		label: SETTINGS,
		icon: SettingsIcon,
	},
];

const SUBPAGE_LINKS = [
	{ to: START, label: INCOMPLETE },
	{ to: OUTSTANDING_PATH, label: OUTSTANDING },
];

const TAB_LINKS = [
	{ to: START, label: INCOMPLETE },
	{ to: OUTSTANDING_PATH, label: OUTSTANDING },
	{ to: SENT_PATH, label: SENT },
];

const DestinationLink = ({
	to,
	label,
	icon,
	labelled,
}: Destination &
	Readonly<{ labelled: boolean }>): ReactElement => (
	<NavLink
		to={to}
		label={label}
		labelled={labelled}
		activeOptions={{ exact: to === "/" }}>
		<NavItemView.Icon svg={icon} />
		<NavItemView.Label>{label}</NavItemView.Label>
	</NavLink>
);

const RailEntries = ({
	labelled,
}: Readonly<{ labelled: boolean }>): ReactElement => {
	const [home, invoices, ...rest] = DESTINATIONS;

	return (
		<>
			{home ? (
				<Nav.Item>
					<DestinationLink {...home} labelled={labelled} />
				</Nav.Item>
			) : null}
			{invoices ? (
				<Nav.Item>
					<Nav.Group defaultOpen={labelled}>
						<Nav.GroupHeader>
							<DestinationLink
								{...invoices}
								labelled={labelled}
							/>
							{labelled ? (
								<Nav.GroupToggle label={SUBPAGES}>
									<ExpandMoreIcon />
								</Nav.GroupToggle>
							) : null}
						</Nav.GroupHeader>
						<Nav.GroupPanel>
							<Nav.GroupList>
								{SUBPAGE_LINKS.map(link => (
									<Nav.Item key={link.to}>
										<NavLink
											to={link.to}
											label={link.label}>
											{link.label}
										</NavLink>
									</Nav.Item>
								))}
							</Nav.GroupList>
						</Nav.GroupPanel>
					</Nav.Group>
				</Nav.Item>
			) : null}
			{rest.map(destination => (
				<Nav.Item key={destination.to}>
					<DestinationLink
						{...destination}
						labelled={labelled}
					/>
				</Nav.Item>
			))}
		</>
	);
};

const Rail = (args: NavRootProps): ReactElement => (
	<Nav.Root {...args}>
		<Nav.List>
			<RailEntries labelled />
			<Nav.Item>
				<NavItemView.Root
					label={SIGN_OUT}
					onClick={signOut}>
					<NavItemView.Icon svg={LogoutIcon} />
					<NavItemView.Label>{SIGN_OUT}</NavItemView.Label>
				</NavItemView.Root>
			</Nav.Item>
		</Nav.List>
	</Nav.Root>
);

const CollapsedRail = (
	args: NavRootProps,
): ReactElement => (
	<Nav.Root {...args}>
		<Nav.List>
			<RailEntries labelled={false} />
		</Nav.List>
	</Nav.Root>
);

const TabBar = (args: NavRootProps): ReactElement => (
	<Nav.Root {...args} orientation="horizontal">
		<Nav.List>
			{TAB_LINKS.map(link => (
				<Nav.Item key={link.to}>
					<NavLink to={link.to} label={link.label}>
						{link.label}
					</NavLink>
				</Nav.Item>
			))}
		</Nav.List>
	</Nav.Root>
);

const RefLink = (args: NavRootProps): ReactElement => (
	<Nav.Root {...args}>
		<Nav.List>
			<Nav.Item>
				<NavLink
					to={START}
					label={INCOMPLETE}
					ref={linkRef}>
					{INCOMPLETE}
				</NavLink>
			</Nav.Item>
		</Nav.List>
	</Nav.Root>
);

const Sidebar = (args: NavRootProps): ReactElement => {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<Nav.Root
			{...args}
			className={styles.sidebar}
			data-collapsed={collapsed ? "true" : undefined}>
			<Button
				variant="tertiary"
				iconOnly
				icon={collapsed ? <MenuIcon /> : <MenuOpenIcon />}
				label={TOGGLE_RAIL}
				onClick={() => setCollapsed(current => !current)}
			/>
			<Nav.List className={styles.grow}>
				<RailEntries labelled={!collapsed} />
				<li aria-hidden="true" className={styles.spacer} />
				<Nav.Item>
					<NavItemView.Root
						label={SIGN_OUT}
						labelled={!collapsed}
						onClick={signOut}>
						<NavItemView.Icon svg={LogoutIcon} />
						<NavItemView.Label>
							{SIGN_OUT}
						</NavItemView.Label>
					</NavItemView.Root>
				</Nav.Item>
			</Nav.List>
		</Nav.Root>
	);
};

const PRIMARY_COUNT = 3;

const MobileNav = (args: NavRootProps): ReactElement => {
	const [more] = useState(() => Drawer.createHandle());
	const pathname = useLocation({
		select: location => location.pathname,
	});
	const primary = DESTINATIONS.slice(0, PRIMARY_COUNT);
	const overflow = DESTINATIONS.slice(PRIMARY_COUNT);
	const overflowIsCurrent = overflow.some(
		destination => destination.to === pathname,
	);

	return (
		<Nav.Root {...args}>
			<Nav.List className={styles.bar}>
				{primary.map(destination => (
					<Nav.Item
						key={destination.to}
						className={styles.barItem}>
						<NavLink
							to={destination.to}
							label={destination.label}
							layout="stack"
							activeOptions={{
								exact: destination.to === "/",
							}}>
							<NavItemView.Icon svg={destination.icon} />
							<NavItemView.Label>
								{destination.label}
							</NavItemView.Label>
						</NavLink>
					</Nav.Item>
				))}
				<Nav.Item className={styles.barItem}>
					<Drawer.Root handle={more} swipeDirection="down">
						<NavItemView.Root
							layout="stack"
							label={MORE}
							render={<Drawer.Trigger />}
							data-active={
								overflowIsCurrent ? "true" : undefined
							}>
							<NavItemView.Icon svg={MoreIcon} />
							<NavItemView.Label>{MORE}</NavItemView.Label>
						</NavItemView.Root>
						<Drawer.Portal>
							<Drawer.Backdrop />
							<Drawer.Viewport>
								<Drawer.Popup>
									<Drawer.Content className={styles.sheet}>
										<Drawer.Header>
											<Drawer.Title>{MORE}</Drawer.Title>
											<Drawer.CloseButton
												closeLabel={CLOSE_MORE}
												icon={
													<Icon svg={CloseIcon} label="" />
												}
											/>
										</Drawer.Header>
										<Nav.Root aria-label={MORE}>
											<Nav.List>
												{overflow.map(destination => (
													<Nav.Item key={destination.to}>
														<NavLink
															to={destination.to}
															label={destination.label}
															onClick={() => more.close()}>
															<NavItemView.Icon
																svg={destination.icon}
															/>
															<NavItemView.Label>
																{destination.label}
															</NavItemView.Label>
														</NavLink>
													</Nav.Item>
												))}
											</Nav.List>
										</Nav.Root>
									</Drawer.Content>
								</Drawer.Popup>
							</Drawer.Viewport>
						</Drawer.Portal>
					</Drawer.Root>
				</Nav.Item>
			</Nav.List>
		</Nav.Root>
	);
};

type Canvas = ReturnType<typeof within>;

const link = (canvas: Canvas, name: string) =>
	canvas.getByRole("link", { name });

const navigatedTo = (pathname: string) =>
	waitFor(() =>
		expect(history.location.pathname).toBe(pathname),
	);

const current = (element: HTMLElement) =>
	waitFor(() =>
		expect(element).toHaveAttribute("aria-current", "page"),
	);

const TAB_LIMIT = 30;

const tabTo = async (
	element: HTMLElement,
	remaining = TAB_LIMIT,
): Promise<void> => {
	if (remaining === 0 || element.matches(":focus")) {
		await expect(element).toHaveFocus();
		return;
	}
	await userEvent.tab();
	await tabTo(element, remaining - 1);
};

const hints = (canvasElement: HTMLElement) =>
	screen
		.queryAllByText(SETTINGS)
		.filter(element => !canvasElement.contains(element));

const hintShown = (canvasElement: HTMLElement) =>
	waitFor(() =>
		expect(hints(canvasElement)[0]).toBeVisible(),
	);

const hintClosed = (canvasElement: HTMLElement) =>
	waitFor(() =>
		expect(hints(canvasElement)).toHaveLength(0),
	);

const indicatorLeft = (list: HTMLElement) =>
	list.style.getPropertyValue("--active-tab-left");

const meta = {
	parameters: {
		layout: "padded",
		designSystem: [
			{ page: "Patterns", section: "Finding your way" },
			{
				page: "Foundation/Type",
				section: "A state never changes the type size",
			},
			{
				page: "Principles/Interaction",
				section:
					"A selected state fits the shape of what it marks",
			},
			{
				page: "Foundation/Iconography",
				section: "Icons are the outlined set",
			},
			{ component: "components/tabs" },
		],
		test: { clearMocks: true },
	},
	component: Nav.Root,
	render: Rail,
	decorators: [decorator],
	beforeEach: reset,
	args: {
		"aria-label": NAV_LABEL,
		orientation: "vertical",
	},
} satisfies Meta<typeof Nav.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("navigation", { name: NAV_LABEL }),
		).toBeInTheDocument();
		await current(link(canvas, INCOMPLETE));
		await current(link(canvas, INVOICES));
		await expect(
			link(canvas, SETTINGS),
		).not.toHaveAttribute("aria-current");
	},
};

export const Horizontal: Story = {
	args: { "aria-label": TABS_LABEL },
	render: TabBar,
	play: async ({ canvas }) => {
		await current(link(canvas, INCOMPLETE));
		const list = canvas.getByRole("list");
		await waitFor(() =>
			expect(indicatorLeft(list)).not.toBe(""),
		);
	},
};

export const CollapsedVertical: Story = {
	render: CollapsedRail,
	play: async ({ canvas }) => {
		await expect(link(canvas, SETTINGS)).toHaveAttribute(
			"data-labelled",
			"false",
		);
		await expect(
			canvas.queryByRole("button", { name: SUBPAGES }),
		).not.toBeInTheDocument();
	},
};

export const RouterLinkProps: Story = {
	tags: ["!dev", "!autodocs"],
	render: RefLink,
	play: async ({ canvas }) => {
		const element = link(canvas, INCOMPLETE);

		await expect(element).toHaveAttribute("href", START);
		await expect(element).toHaveAttribute(
			"data-status",
			"active",
		);
		await expect(element).toHaveAttribute(
			"aria-current",
			"page",
		);
		await expect(linkRef).toHaveBeenCalledWith(element);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const settings = link(canvas, SETTINGS);

		await tabTo(settings);
		await userEvent.keyboard("{Enter}");

		await navigatedTo(SETTINGS_PATH);
		await current(settings);
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(link(canvas, SETTINGS));

		await navigatedTo(SETTINGS_PATH);
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: link(canvas, SETTINGS),
		});

		await navigatedTo(SETTINGS_PATH);
	},
};

export const GroupKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const toggle = canvas.getByRole("button", {
			name: SUBPAGES,
		});

		await tabTo(toggle);
		await expect(toggle).toHaveAttribute(
			"aria-expanded",
			"true",
		);

		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(
				canvas.queryByRole("link", { name: OUTSTANDING }),
			).not.toBeInTheDocument(),
		);

		await userEvent.keyboard(" ");
		await expect(
			await canvas.findByRole("link", {
				name: OUTSTANDING,
			}),
		).toBeVisible();
	},
};

export const ActionKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await tabTo(
			canvas.getByRole("button", { name: SIGN_OUT }),
		);

		await userEvent.keyboard("{Enter}");
		await expect(signOut).toHaveBeenCalledOnce();
	},
};

export const CollapsedKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	render: CollapsedRail,
	play: async ({ canvas, canvasElement }) => {
		await tabTo(link(canvas, SETTINGS));
		await hintShown(canvasElement);

		await userEvent.keyboard("{Escape}");
		await hintClosed(canvasElement);

		await userEvent.keyboard("{Enter}");
		await navigatedTo(SETTINGS_PATH);
	},
};

export const CollapsedMouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: CollapsedRail,
	play: async ({ canvas, canvasElement }) => {
		const settings = link(canvas, SETTINGS);

		await userEvent.hover(settings);
		await hintShown(canvasElement);

		await userEvent.unhover(settings);
		await hintClosed(canvasElement);
	},
};

export const HorizontalKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { "aria-label": TABS_LABEL },
	render: TabBar,
	play: async ({ canvas }) => {
		const sent = link(canvas, SENT);
		const list = canvas.getByRole("list");
		await waitFor(() =>
			expect(indicatorLeft(list)).not.toBe(""),
		);
		const before = indicatorLeft(list);

		await tabTo(sent);
		await userEvent.keyboard("{Enter}");

		await navigatedTo(SENT_PATH);
		await current(sent);
		await waitFor(() =>
			expect(indicatorLeft(list)).not.toBe(before),
		);
	},
};

export const HorizontalMouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { "aria-label": TABS_LABEL },
	render: TabBar,
	play: async ({ canvas }) => {
		const outstanding = link(canvas, OUTSTANDING);

		await userEvent.click(outstanding);

		await navigatedTo(OUTSTANDING_PATH);
		await current(outstanding);
	},
};

export const HorizontalTouch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { "aria-label": TABS_LABEL },
	render: TabBar,
	play: async ({ canvas }) => {
		const sent = link(canvas, SENT);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: sent,
		});

		await navigatedTo(SENT_PATH);
		await current(sent);
	},
};

export const SidebarExample: Story = {
	name: "Example: sidebar",
	parameters: { layout: "fullscreen" },
	render: Sidebar,
};

export const SidebarCollapse: Story = {
	tags: ["!dev", "!autodocs"],
	parameters: { layout: "fullscreen" },
	render: Sidebar,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: TOGGLE_RAIL }),
		);

		await expect(link(canvas, SETTINGS)).toHaveAttribute(
			"data-labelled",
			"false",
		);
	},
};

export const MobileNavExample: Story = {
	name: "Example: mobile bar",
	parameters: { layout: "fullscreen" },
	render: MobileNav,
};

export const MobileNavMore: Story = {
	tags: ["!dev", "!autodocs"],
	parameters: { layout: "fullscreen" },
	render: MobileNav,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: MORE }),
		);

		await userEvent.click(
			await screen.findByRole("link", { name: SETTINGS }),
		);

		await navigatedTo(SETTINGS_PATH);
		await waitFor(() =>
			expect(
				canvas.getByRole("button", { name: MORE }),
			).toHaveAttribute("data-active", "true"),
		);
	},
};
