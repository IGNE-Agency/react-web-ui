import { expect, screen, waitFor } from "storybook/test";

/**
 * Waits until nothing with `role` (and the given name, if any) is left in the
 * document, such as a popup that has finished closing.
 *
 * @example
 * await userEvent.keyboard("{Escape}");
 * await roleGone("listbox");
 */
export const roleGone = (
	...query: Parameters<typeof screen.queryByRole>
) =>
	waitFor(() =>
		expect(
			screen.queryByRole(...query),
		).not.toBeInTheDocument(),
	);

/**
 * Waits until `text` is gone from the document, such as a tooltip's content.
 *
 * @example
 * await textGone("Save");
 */
export const textGone = (text: string) =>
	waitFor(() =>
		expect(
			screen.queryByText(text),
		).not.toBeInTheDocument(),
	);

/**
 * Waits until the option named `name` is highlighted in a listbox.
 *
 * @example
 * await userEvent.keyboard("{ArrowDown}");
 * await optionHighlighted("Paid");
 */
export const optionHighlighted = (name: string) =>
	waitFor(() =>
		expect(
			screen.getByRole("option", { name }),
		).toHaveAttribute("data-highlighted"),
	);
