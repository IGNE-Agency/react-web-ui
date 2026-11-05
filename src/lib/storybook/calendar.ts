import {
	expect,
	screen,
	waitFor,
	within,
} from "storybook/test";
import type { Temporal } from "temporal-polyfill";

/**
 * The open calendar popup of a date picker story.
 *
 * @example
 * const popup = await calendar();
 */
export const calendar = (): Promise<HTMLElement> =>
	screen.findByRole("dialog");

/**
 * The enabled button for `date`'s day inside the calendar `popup`.
 *
 * @example
 * await userEvent.click(dayButton(popup, date));
 */
export const dayButton = (
	popup: HTMLElement,
	date: Temporal.PlainDate,
): HTMLElement =>
	within(popup).getByRole("button", {
		name: (_, element) =>
			element.textContent === String(date.day) &&
			element.getAttribute("aria-disabled") !== "true",
	});

/**
 * Waits until the focused element is `date`'s day.
 *
 * @example
 * await focusedDay(date.add({ days: 1 }));
 */
export const focusedDay = (date: Temporal.PlainDate) =>
	waitFor(() =>
		expect(document.activeElement).toHaveTextContent(
			String(date.day),
			{ normalizeWhitespace: true },
		),
	);

/**
 * Waits until `element` has focus again, such as a trigger after its popup closed.
 *
 * @example
 * await focusReturnsTo(trigger);
 */
export const focusReturnsTo = (element: HTMLElement) =>
	waitFor(() => expect(element).toHaveFocus());
