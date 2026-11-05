import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import type { Key } from "react-aria-components";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
} from "storybook/test";
import { roleGone } from "../../lib/storybook/waits.ts";
import type { Tone } from "../../lib/tone.ts";
import { Tag } from "../tag/tag.tsx";
import {
	TagGroup,
	type TagGroupRootProps,
} from "./tag-group.tsx";

type Filter = Readonly<{
	id: string;
	label: string;
	tone: Tone;
}>;

const GROUP_LABEL = "Active filters";
const OUTSTANDING = "Outstanding";
const RETURNED = "Returned";
const PROCESSED = "Processed";

const FILTERS: readonly Filter[] = [
	{ id: "outstanding", label: OUTSTANDING, tone: "info" },
	{ id: "returned", label: RETURNED, tone: "error" },
	{ id: "processed", label: PROCESSED, tone: "success" },
];

const REMOVE = "Remove";

const removeName = (label: string) => `${REMOVE} ${label}`;

const removed = fn().mockName("onRemove");

const RemovableTags = ({
	"aria-label": label,
}: TagGroupRootProps): ReactElement => {
	const [filters, setFilters] = useState(FILTERS);

	return (
		<TagGroup.Root
			aria-label={label}
			onRemove={(keys: Set<Key>) => {
				removed(keys);
				setFilters(current =>
					current.filter(filter => !keys.has(filter.id)),
				);
			}}>
			<TagGroup.List items={filters}>
				{filter => (
					<TagGroup.Tag
						id={filter.id}
						textValue={filter.label}
						tone={filter.tone}>
						<Tag.Dot />
						{filter.label}
						<TagGroup.Remove label={REMOVE} />
					</TagGroup.Tag>
				)}
			</TagGroup.List>
		</TagGroup.Root>
	);
};

const tag = (name: string) =>
	screen.getByRole("row", { name });

const gone = (name: string) => roleGone("row", { name });

const removedKey = (key: string) =>
	expect(removed).toHaveBeenCalledWith(new Set([key]));

const meta = {
	parameters: {
		designSystem: [
			{
				page: "Principles/Interaction",
				section:
					"An icon-only control always has a tooltip and an accessible name",
			},
			{
				page: "Principles/Accessibility",
				section:
					"Focus returns after a part removes itself",
			},
			{ component: "components/tag" },
		],
		test: { clearMocks: true },
	},
	component: TagGroup.Root,
	render: RemovableTags,
	args: {
		"aria-label": GROUP_LABEL,
	},
} satisfies Meta<typeof TagGroup.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("grid", { name: GROUP_LABEL }),
		).toBeInTheDocument();
		await expect(tag(OUTSTANDING)).toHaveAttribute(
			"data-tone",
			"info",
		);
	},
};

export const RemoveKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	play: async () => {
		await userEvent.tab();
		await expect(tag(OUTSTANDING)).toHaveFocus();

		await userEvent.keyboard("{ArrowRight}");
		await expect(tag(RETURNED)).toHaveFocus();

		await userEvent.keyboard("{Delete}");
		await removedKey("returned");
		await gone(RETURNED);
		await waitFor(() =>
			expect(tag(PROCESSED)).toHaveFocus(),
		);

		await userEvent.keyboard("{Backspace}");
		await removedKey("processed");
		await gone(PROCESSED);
		await waitFor(() =>
			expect(tag(OUTSTANDING)).toHaveFocus(),
		);
	},
};

export const RemoveMouse: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const label = removeName(RETURNED);
		const remove = canvas.getByRole("button", {
			name: label,
		});

		await userEvent.hover(remove);
		await waitFor(() =>
			expect(screen.getByText(REMOVE)).toBeVisible(),
		);

		await userEvent.click(remove);
		await removedKey("returned");
		await gone(RETURNED);
	},
};

export const RemoveTouch: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: canvas.getByRole("button", {
				name: removeName(PROCESSED),
			}),
		});

		await removedKey("processed");
		await gone(PROCESSED);
	},
};
