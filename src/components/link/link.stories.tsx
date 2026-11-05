import type { Meta, StoryObj } from "@storybook/react-vite";
import { createLink } from "@tanstack/react-router";
import type { ReactElement } from "react";
import {
	expect,
	fn,
	userEvent,
	waitFor,
} from "storybook/test";
import { createStoryRouter } from "../../lib/storybook/story-router.tsx";
import { Link, type LinkProps } from "./link.tsx";

const LABEL = "Create an account";
const START_PATH = "/story";

const { history, decorator, reset } =
	createStoryRouter(START_PATH);

const RouterLink = createLink(Link);

const linkRef = fn();

const navigatedHome = () =>
	waitFor(() =>
		expect(history.location.pathname).toBe("/"),
	);

const ToHome = ({ children }: LinkProps): ReactElement => (
	<RouterLink to="/">{children}</RouterLink>
);

const ToCurrentPage = ({
	children,
}: LinkProps): ReactElement => (
	<RouterLink to={START_PATH} ref={linkRef}>
		{children}
	</RouterLink>
);

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"A link carries the brand colour and is underlined",
			},
		],
		test: { clearMocks: true },
	},
	component: Link,
	decorators: [decorator],
	beforeEach: reset,
	args: {
		href: "/",
		children: LABEL,
	},
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("link", {
				name: LABEL,
			}),
		).toHaveAttribute("href", "/");
	},
};

export const RouterLinkProps: Story = {
	tags: ["!dev", "!autodocs"],
	render: ToCurrentPage,
	play: async ({ canvas }) => {
		const link = canvas.getByRole("link", {
			name: LABEL,
		});

		await expect(link).toHaveAttribute("href", START_PATH);
		await expect(link).toHaveAttribute(
			"data-status",
			"active",
		);
		await expect(link).toHaveAttribute(
			"aria-current",
			"page",
		);
		await expect(linkRef).toHaveBeenCalledWith(link);
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	render: ToHome,
	play: async ({ canvas }) => {
		const link = canvas.getByRole("link", {
			name: LABEL,
		});

		await userEvent.tab();
		await expect(link).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await navigatedHome();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: ToHome,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("link", {
				name: LABEL,
			}),
		);

		await navigatedHome();
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	render: ToHome,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("link", {
				name: LABEL,
			}),
		});

		await navigatedHome();
	},
};
