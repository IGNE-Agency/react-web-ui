import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useArgs } from "storybook/preview-api";
import {
	expect,
	fn,
	screen,
	userEvent,
	waitFor,
	type within,
} from "storybook/test";
import { roleGone } from "../../lib/storybook/waits.ts";
import {
	Pagination,
	type PaginationPage,
	type PaginationRootProps,
} from "./pagination.tsx";

const PAGE_SIZE_LABEL = "Rows per page";
const FIRST_LABEL = "First page";
const PREVIOUS_LABEL = "Previous page";
const NEXT_LABEL = "Next page";
const LAST_LABEL = "Last page";

const pageLabel = ({
	pageIndex,
	pageCount,
}: PaginationPage) =>
	`Page ${pageIndex + 1} of ${pageCount}`;

const pageIndexChange = fn<
	(pageIndex: number) => void
>().mockName("onPageIndexChange");
const pageSizeChange = fn<
	(pageSize: number) => void
>().mockName("onPageSizeChange");

const Parts = (): ReactElement => (
	<>
		<Pagination.PageSize label={PAGE_SIZE_LABEL} />
		<Pagination.Index label={pageLabel} />
		<Pagination.Controls
			firstLabel={FIRST_LABEL}
			previousLabel={PREVIOUS_LABEL}
			nextLabel={NEXT_LABEL}
			lastLabel={LAST_LABEL}
		/>
	</>
);

const ControlledPagination = (
	args: PaginationRootProps,
): ReactElement => {
	const [, updateArgs] = useArgs<PaginationRootProps>();

	return (
		<Pagination.Root
			{...args}
			onPageIndexChange={pageIndex => {
				args.onPageIndexChange(pageIndex);
				updateArgs({ pageIndex });
			}}
			onPageSizeChange={pageSize => {
				args.onPageSizeChange(pageSize);
				updateArgs({ pageSize, pageIndex: 0 });
			}}>
			<Parts />
		</Pagination.Root>
	);
};

const PlainPagination = (
	args: PaginationRootProps,
): ReactElement => (
	<Pagination.Root {...args}>
		<Parts />
	</Pagination.Root>
);

const ControlsOnly = (
	args: PaginationRootProps,
): ReactElement => (
	<Pagination.Root {...args}>
		<Pagination.Index label={pageLabel} />
		<Pagination.Controls
			firstLabel={FIRST_LABEL}
			previousLabel={PREVIOUS_LABEL}
			nextLabel={NEXT_LABEL}
			lastLabel={LAST_LABEL}
		/>
	</Pagination.Root>
);

const meta = {
	parameters: {
		layout: "padded",
		designSystem: [
			{ page: "Patterns", section: "Finding your way" },
			{
				page: "Principles/Accessibility",
				section:
					"Every control has a name, from exactly one mechanism",
			},
			{
				page: "Principles/Interaction",
				section:
					"Everything you can reach with the keyboard shows the focus ring",
			},
			{ component: "components/button" },
			{ component: "components/select-field" },
		],
		test: { clearMocks: true },
	},
	component: Pagination.Root,
	render: ControlledPagination,
	args: {
		pageIndex: 2,
		pageCount: 12,
		pageSize: 20,
		pageSizes: [10, 20, 50, 100],
		onPageIndexChange: pageIndexChange,
		onPageSizeChange: pageSizeChange,
	},
} satisfies Meta<typeof Pagination.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const button = (canvas: Canvas, name: string) =>
	canvas.getByRole("button", { name });

const pageSizeControl = (canvas: Canvas) =>
	canvas.getByRole("combobox", { name: PAGE_SIZE_LABEL });

const unavailable = (element: HTMLElement) =>
	expect(element).toHaveAttribute("aria-disabled", "true");

const available = (element: HTMLElement) =>
	expect(element).not.toHaveAttribute("aria-disabled");

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("status"),
		).toHaveTextContent("Page 3 of 12");
		await expect(pageSizeControl(canvas)).toHaveTextContent(
			"20",
		);
		await available(button(canvas, FIRST_LABEL));
		await available(button(canvas, PREVIOUS_LABEL));
		await available(button(canvas, NEXT_LABEL));
		await available(button(canvas, LAST_LABEL));
	},
};

export const FirstPage: Story = {
	args: { pageIndex: 0 },
	play: async ({ canvas }) => {
		await unavailable(button(canvas, FIRST_LABEL));
		await unavailable(button(canvas, PREVIOUS_LABEL));
		await available(button(canvas, NEXT_LABEL));
		await available(button(canvas, LAST_LABEL));
	},
};

export const LastPage: Story = {
	args: { pageIndex: 11 },
	play: async ({ canvas }) => {
		await available(button(canvas, FIRST_LABEL));
		await available(button(canvas, PREVIOUS_LABEL));
		await unavailable(button(canvas, NEXT_LABEL));
		await unavailable(button(canvas, LAST_LABEL));
	},
};

export const SinglePage: Story = {
	args: { pageIndex: 0, pageCount: 1 },
	play: async ({ canvas }) => {
		await unavailable(button(canvas, FIRST_LABEL));
		await unavailable(button(canvas, PREVIOUS_LABEL));
		await unavailable(button(canvas, NEXT_LABEL));
		await unavailable(button(canvas, LAST_LABEL));
	},
};

export const PageSizeNotOnOffer: Story = {
	args: { pageSize: 25 },
	play: async ({ canvas }) => {
		await userEvent.click(pageSizeControl(canvas));

		const options = await screen.findAllByRole("option");
		await expect(
			options.map(option => option.textContent),
		).toEqual(["10", "20", "25", "50", "100"]);
		await userEvent.keyboard("{Escape}");
		await roleGone("listbox");
	},
};

export const WithoutPageSize: Story = {
	render: ControlsOnly,
};

export const Keyboard: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainPagination,
	play: async ({ canvas }) => {
		const control = pageSizeControl(canvas);

		await userEvent.tab();
		await expect(control).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(
				screen.getByRole("option", { name: "20" }),
			).toHaveAttribute("data-highlighted"),
		);
		await userEvent.keyboard("{ArrowDown}{Enter}");
		await roleGone("listbox");
		await expect(control).toHaveFocus();
		await expect(pageSizeChange).toHaveBeenCalledWith(50);

		await userEvent.tab();
		await expect(button(canvas, FIRST_LABEL)).toHaveFocus();
		await userEvent.tab();
		await expect(
			button(canvas, PREVIOUS_LABEL),
		).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(pageIndexChange).toHaveBeenLastCalledWith(
			1,
		);

		await userEvent.tab();
		await expect(button(canvas, NEXT_LABEL)).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(pageIndexChange).toHaveBeenLastCalledWith(
			3,
		);

		await userEvent.tab();
		await expect(button(canvas, LAST_LABEL)).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(pageIndexChange).toHaveBeenLastCalledWith(
			11,
		);
	},
};

export const KeyboardAtTheEnd: Story = {
	tags: ["!dev", "!autodocs"],
	args: { pageIndex: 11 },
	render: PlainPagination,
	play: async ({ canvas }) => {
		const next = button(canvas, NEXT_LABEL);

		next.focus();
		await userEvent.keyboard("{Enter}");
		await userEvent.keyboard(" ");

		await expect(next).toHaveFocus();
		await expect(pageIndexChange).not.toHaveBeenCalled();
	},
};

export const Mouse: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainPagination,
	play: async ({ canvas }) => {
		await userEvent.click(button(canvas, FIRST_LABEL));
		await expect(pageIndexChange).toHaveBeenLastCalledWith(
			0,
		);

		await userEvent.click(button(canvas, NEXT_LABEL));
		await expect(pageIndexChange).toHaveBeenLastCalledWith(
			3,
		);

		await userEvent.click(pageSizeControl(canvas));
		await userEvent.click(
			await screen.findByRole("option", { name: "100" }),
		);
		await roleGone("listbox");
		await expect(pageSizeChange).toHaveBeenCalledWith(100);
	},
};

export const MouseAtTheStart: Story = {
	tags: ["!dev", "!autodocs"],
	args: { pageIndex: 0 },
	render: PlainPagination,
	play: async ({ canvas }) => {
		await userEvent.click(button(canvas, FIRST_LABEL));
		await userEvent.click(button(canvas, PREVIOUS_LABEL));

		await expect(pageIndexChange).not.toHaveBeenCalled();
	},
};

export const Touch: Story = {
	tags: ["!dev", "!autodocs"],
	render: PlainPagination,
	play: async ({ canvas }) => {
		await userEvent.pointer({
			keys: "[TouchA]",
			target: button(canvas, LAST_LABEL),
		});
		await expect(pageIndexChange).toHaveBeenLastCalledWith(
			11,
		);

		await userEvent.pointer({
			keys: "[TouchA]",
			target: pageSizeControl(canvas),
		});
		await userEvent.pointer({
			keys: "[TouchA]",
			target: await screen.findByRole("option", {
				name: "10",
			}),
		});
		await roleGone("listbox");
		await expect(pageSizeChange).toHaveBeenCalledWith(10);
	},
};
