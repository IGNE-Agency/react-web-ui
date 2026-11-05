import type { MouseEvent } from "react";

const CONTROL_SELECTOR = [
	'input:not([type="hidden"])',
	"textarea",
	'[role="spinbutton"]',
	'[contenteditable="true"]',
].join(",");

/**
 * Focuses a field group's control when the press lands on the group's own box —
 * its padding, or an inlay that takes no pointer events. Presses that reach the
 * control, an `inlay-action` or any other interactive part are left alone.
 *
 * @example
 * <div className={style.group} onMouseDown={focusControlOnRim} />
 */
export const focusControlOnRim = (
	event: MouseEvent<HTMLElement>,
): void => {
	if (event.target !== event.currentTarget) {
		return;
	}
	const control =
		event.currentTarget.querySelector<HTMLElement>(
			CONTROL_SELECTOR,
		);
	if (control === null || control.matches(":disabled")) {
		return;
	}
	event.preventDefault();
	control.focus();
};
