import ArrowForwardIcon from "@material-design-icons/svg/outlined/arrow_forward.svg?react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../icon/index.ts";
import { createLink } from "@tanstack/react-router";
import type { ReactElement } from "react";
import {
	expect,
	fn,
	userEvent,
	waitFor,
} from "storybook/test";
import { mappedArg } from "../../lib/storybook/mapped-arg.ts";
import { createStoryRouter } from "../../lib/storybook/story-router.tsx";
import {
	LinkButton,
	type LinkButtonProps,
} from "./link-button.tsx";

const LABEL = "Go to the overview";
const START_PATH = "/story";

const ICONS = {
	arrowForward: <Icon svg={ArrowForwardIcon} label="" />,
};

const { history, decorator, reset } =
	createStoryRouter(START_PATH);

const RouterLinkButton = createLink(LinkButton);

const linkRef = fn();

const navigatedHome = () =>
	waitFor(() =>
		expect(history.location.pathname).toBe("/"),
	);

const ToHome = ({
	variant,
	size,
	tone,
	icon,
	children,
}: LinkButtonProps): ReactElement => (
	<RouterLinkButton
		to="/"
		variant={variant}
		size={size}
		tone={tone}
		icon={icon}>
		{children}
	</RouterLinkButton>
);

const ToCurrentPage = ({
	variant,
	children,
}: LinkButtonProps): ReactElement => (
	<RouterLinkButton
		to={START_PATH}
		variant={variant}
		ref={linkRef}>
		{children}
	</RouterLinkButton>
);

const meta = {
	parameters: {
		designSystem: [
			{
				component: "components/button",
				section:
					"A labelled button carries an icon as well",
			},
		],
		test: { clearMocks: true },
	},
	component: LinkButton,
	decorators: [decorator],
	beforeEach: reset,
	args: {
		href: "/",
		variant: "primary",
		children: LABEL,
	},
	argTypes: {
		icon: {
			options: Object.keys(ICONS),
			mapping: ICONS,
			control: "select",
		},
	},
} satisfies Meta<typeof LinkButton>;

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

export const WithIcon: Story = {
	args: { icon: mappedArg(ICONS, "arrowForward") },
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
