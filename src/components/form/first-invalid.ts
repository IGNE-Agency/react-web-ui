const INVALID = '[aria-invalid="true"], [data-invalid]';

const SELECTED =
	'[aria-checked="true"], [aria-pressed="true"]';

const FOCUSABLE =
	"a[href], button, input, select, textarea, [tabindex], [contenteditable]";

const REDUCED_MOTION = "(prefers-reduced-motion)";

const focusable = (
	element: Element,
): element is HTMLElement =>
	element instanceof HTMLElement &&
	element.matches(FOCUSABLE) &&
	!element.matches(':disabled, [aria-disabled="true"]') &&
	element.closest('[inert], [aria-hidden="true"]') ===
		null &&
	element.checkVisibility({ visibilityProperty: true });

const tabbable = (
	element: Element,
): element is HTMLElement =>
	focusable(element) && element.tabIndex >= 0;

const focusTarget = (
	invalid: Element,
): HTMLElement | undefined =>
	tabbable(invalid)
		? invalid
		: (Array.from(invalid.querySelectorAll(INVALID)).find(
				tabbable,
			) ??
			Array.from(invalid.querySelectorAll(SELECTED)).find(
				focusable,
			) ??
			Array.from(invalid.querySelectorAll(FOCUSABLE)).find(
				tabbable,
			));

/**
 * Focuses the first invalid field inside `root` in document order, and scrolls
 * it to the middle of the view. A field hands focus to its invalid control, or
 * else to its selected option or the first control Tab would reach. Disabled
 * and hidden controls are skipped.
 *
 * @example
 * focusFirstInvalid(formElement); // the focused control, or undefined
 */
export const focusFirstInvalid = (
	root: ParentNode,
): HTMLElement | undefined => {
	for (const invalid of root.querySelectorAll(INVALID)) {
		const target = focusTarget(invalid);
		if (target !== undefined) {
			target.focus({ preventScroll: true });
			target.scrollIntoView({
				block: "center",
				behavior: window.matchMedia(REDUCED_MOTION).matches
					? "instant"
					: "smooth",
			});
			return target;
		}
	}
	return undefined;
};
