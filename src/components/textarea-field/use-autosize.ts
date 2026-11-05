import { useLayoutEffect, useRef } from "react";

/**
 * Sets the element's height to exactly its content's height. The control carries
 * no border or padding of its own, both live on the group around it, so
 * `scrollHeight` is the content height with nothing to compensate for.
 *
 * @example
 * fitToContent(textarea);
 */
const fitToContent = (
	element: HTMLTextAreaElement,
): void => {
	element.style.height = "0";
	element.style.height = `${element.scrollHeight}px`;
};

/**
 * Fits the element now and again whenever its width changes, since rewrapped
 * text takes a different number of lines. Returns the cleanup.
 *
 * @example
 * const stop = followWidth(textarea);
 */
const followWidth = (
	element: HTMLTextAreaElement,
): (() => void) => {
	fitToContent(element);
	let width = element.clientWidth;
	const observer = new ResizeObserver(() => {
		if (element.clientWidth === width) {
			return;
		}
		width = element.clientWidth;
		fitToContent(element);
	});
	observer.observe(element);
	return () => observer.disconnect();
};

/**
 * Grows a `<textarea>` with its content, between the `min-block-size` and
 * `max-block-size` the caller sets in CSS. Returns a ref callback for the
 * element; refits after every render, so on every value change, and whenever
 * the control's width changes.
 *
 * @example
 * const fit = useAutosize();
 * return <textarea ref={fit} />;
 */
export const useAutosize = (): ((
	element: HTMLTextAreaElement | null,
) => (() => void) | undefined) => {
	const control = useRef<HTMLTextAreaElement | null>(null);

	useLayoutEffect(() => {
		if (control.current) {
			fitToContent(control.current);
		}
	});

	return element => {
		control.current = element;
		return element === null
			? undefined
			: followWidth(element);
	};
};
