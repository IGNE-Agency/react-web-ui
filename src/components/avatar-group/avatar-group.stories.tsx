import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
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
const ORGANISER = "(organiser)";

const overflowLabel = (count: number) =>
	`Show all invitees (+${count})`;

const PEOPLE = [
	{ id: "1", name: "Ada Lovelace" },
	{ id: "2", name: "Sem de Jong" },
	{ id: "3", name: "Sanne de Vries" },
	{ id: "4", name: "Anna de Vries" },
	{ id: "5", name: "Mark Jansen" },
	{ id: "6", name: "Grace Hopper" },
	{ id: "7", name: "Alan Turing" },
];

const SHOWN = 2;

type Canvas = ReturnType<typeof within>;

const overflowButton = (canvas: Canvas) =>
	canvas.getByRole("button", { name: overflowLabel(3) });

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

const ComposedGroup = (): ReactElement => (
	<AvatarGroup.Root label={LABEL} size={2}>
		{PEOPLE.slice(0, SHOWN).map(person => (
			<AvatarGroup.Avatar
				key={person.id}
				name={person.name}
			/>
		))}
		<AvatarGroup.Overflow
			count={PEOPLE.length - SHOWN}
			label={overflowLabel(PEOPLE.length - SHOWN)}>
			<AvatarGroup.List>
				{PEOPLE.slice(SHOWN).map((person, index) => (
					<AvatarGroup.ListItem
						key={person.id}
						name={person.name}
						suffix={index === 0 ? ORGANISER : undefined}
					/>
				))}
			</AvatarGroup.List>
		</AvatarGroup.Overflow>
	</AvatarGroup.Root>
);

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
			{ component: "components/popover" },
		],
	},
	component: AvatarGroup,
	args: {
		people: PEOPLE,
		label: LABEL,
		overflowLabel,
	},
} satisfies Meta<typeof AvatarGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("group", { name: LABEL }),
		).toBeVisible();
		await expect(overflowButton(canvas)).toHaveTextContent(
			"+3",
		);
	},
};

export const NoOverflow: Story = {
	args: { people: PEOPLE.slice(0, 3) },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("group", { name: LABEL }),
		).toBeVisible();
		await expect(
			canvas.queryByRole("button"),
		).not.toBeInTheDocument();
	},
};

export const CurrentUser: Story = {
	args: { currentUser: { id: "1", label: YOU } },
};

export const Large: Story = {
	args: { size: 2.5 },
};

export const Composed: Story = {
	render: ComposedGroup,
};

export const ComposedOpens: Story = {
	tags: ["!dev", "!autodocs"],
	render: ComposedGroup,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", {
				name: overflowLabel(PEOPLE.length - SHOWN),
			}),
		);
		const list = await screen.findByRole("dialog", {
			name: LABEL,
		});
		await expect(list).toHaveTextContent(
			`${PEOPLE[SHOWN]?.name ?? ""} ${ORGANISER}`,
		);
		await expect(list).not.toHaveTextContent(
			PEOPLE[0]?.name ?? "",
		);
		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
	},
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: CurrentUser.args,
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(overflowButton(canvas)).toHaveFocus();

		await userEvent.keyboard("{Enter}");
		await listShowsEveryone();

		await userEvent.keyboard("{Escape}");
		await roleGone("dialog");
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	args: CurrentUser.args,
	play: async ({ canvas }) => {
		await userEvent.hover(overflowButton(canvas));
		await listShowsEveryone();

		await userEvent.unhover(overflowButton(canvas));
		await roleGone("dialog");
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	args: CurrentUser.args,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: overflowButton(canvas),
		});

		await listShowsEveryone();
	},
};
