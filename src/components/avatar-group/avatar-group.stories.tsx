import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	expect,
	screen,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { roleGone } from "../../lib/storybook/waits.ts";
import { AvatarGroup } from "./avatar-group.tsx";

const LABEL = "Invitees";
const YOU = "(you)";

const PEOPLE = [
	{ id: "1", name: "Ada Lovelace" },
	{ id: "2", name: "Sem de Jong" },
	{ id: "3", name: "Sanne de Vries" },
	{ id: "4", name: "Anna de Vries" },
	{ id: "5", name: "Mark Jansen" },
	{ id: "6", name: "Grace Hopper" },
	{ id: "7", name: "Alan Turing" },
];

type Canvas = ReturnType<typeof within>;

const group = (canvas: Canvas) =>
	canvas.getByRole("button", {
		name: (name: string) => name.startsWith(LABEL),
	});

const listShowsEveryone = async () => {
	const list = await screen.findByRole("dialog", {
		name: LABEL,
	});
	await waitFor(() => expect(list).toBeVisible());
	await Promise.all(
		PEOPLE.map(person =>
			expect(list).toHaveTextContent(person.name),
		),
	);
	await expect(list).toHaveTextContent(
		`${PEOPLE[0]?.name ?? ""} ${YOU}`,
	);
};

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Accessibility",
				section: "Decoration is `aria-hidden`",
			},
			{
				page: "Patterns",
				section:
					"Every popup floats on the overlay surface at the first level, with no outline",
			},
			{ component: "components/avatar" },
		],
	},
	component: AvatarGroup,
	args: {
		people: PEOPLE.slice(0, 3),
		label: LABEL,
		currentUser: { id: "1", label: YOU },
	},
} satisfies Meta<typeof AvatarGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: LABEL }),
		).toBeVisible();
	},
};

export const Overflow: Story = {
	args: { people: PEOPLE },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: `${LABEL} +3` }),
		).toBeVisible();
	},
};

export const Large: Story = {
	args: { people: PEOPLE, size: 2.5 },
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: { people: PEOPLE },
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(group(canvas)).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await listShowsEveryone();

		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: { people: PEOPLE },
	play: async ({ canvas }) => {
		await userEvent.hover(group(canvas));
		await listShowsEveryone();

		await userEvent.unhover(group(canvas));
		await roleGone("dialog");
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { people: PEOPLE },
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: group(canvas),
		});

		await listShowsEveryone();
	},
};
