import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, waitFor } from "storybook/test";
import { Avatar } from "./avatar.tsx";

const PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#8fb3d9"/><circle cx="20" cy="16" r="7" fill="#f2d4bd"/><path d="M6 40a14 14 0 0 1 28 0z" fill="#3d5a80"/></svg>',
)}`;

const BROKEN = "data:image/png;base64,AAAA";

const image = (canvasElement: HTMLElement) =>
	canvasElement.querySelector("img");

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Accessibility",
				section: "Decoration is `aria-hidden`",
			},
			{
				page: "Foundation/Colour",
				section:
					"A person's colour is an identity tone, never a status colour",
			},
		],
	},
	component: Avatar,
	args: {
		name: "Ada Lovelace",
	},
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {
	play: async ({ canvasElement }) => {
		await expect(canvasElement).toHaveTextContent(
			/^\p{Lu}{2}$/u,
		);
		await expect(image(canvasElement)).toBeNull();
	},
};

export const IdentityTone1: Story = {
	args: { name: "Sem de Jong" },
};

export const IdentityTone2: Story = {
	args: { name: "Sanne de Vries" },
};

export const IdentityTone3: Story = {
	args: { name: "Anna de Vries" },
};

export const IdentityTone4: Story = {
	args: { name: "Mark Jansen" },
};

export const WithImage: Story = {
	args: { src: PORTRAIT },
	play: async ({ canvasElement }) => {
		await waitFor(() =>
			expect(image(canvasElement)).toBeVisible(),
		);
		await expect(canvasElement).not.toHaveTextContent(/\S/);
	},
};

export const BrokenImage: Story = {
	args: { src: BROKEN },
	play: async ({ canvasElement }) => {
		await waitFor(() =>
			expect(canvasElement).toHaveTextContent(
				/^\p{Lu}{2}$/u,
			),
		);
		await expect(image(canvasElement)).toBeNull();
	},
};

export const Small: Story = {
	args: { size: 1.5 },
};

export const Large: Story = {
	args: { size: 4 },
};

const ComposedAvatar = (): ReactElement => (
	<Avatar.Root name="Ada Lovelace" size={4}>
		<Avatar.Image src={PORTRAIT} />
		<Avatar.Fallback>AL</Avatar.Fallback>
	</Avatar.Root>
);

export const Composed: Story = {
	render: ComposedAvatar,
	play: async ({ canvasElement }) => {
		await waitFor(() =>
			expect(image(canvasElement)).toBeVisible(),
		);
	},
};
