import { type RefCallback, useCallback } from "react";

/** What {@link useSlidingIndicator} measures and where it writes. */
export type SlidingIndicatorOptions = Readonly<{
	/** Matches the active item inside the indicator's parent, such as `"[data-pressed]"`. */
	active: string;
	/** The custom-property prefix the indicator's styles read. @default "--active-item" */
	prefix?: string;
	/**
	 * Which element carries the custom properties: the indicator, or its parent,
	 * where the indicator and its siblings inherit them. @default "indicator"
	 */
	publishOn?: "indicator" | "parent";
}>;

const offsetWithin = (
	element: HTMLElement,
	container: HTMLElement,
): Readonly<{ left: number; top: number }> => {
	let left = 0;
	let top = 0;
	let node: Element | null = element;
	while (
		node instanceof HTMLElement &&
		node !== container
	) {
		left += node.offsetLeft;
		top += node.offsetTop;
		node = node.offsetParent;
	}
	return { left, top };
};

const publish = (
	carrier: HTMLElement,
	property: string,
	value: string,
): void => {
	if (carrier.style.getPropertyValue(property) !== value) {
		carrier.style.setProperty(property, value);
	}
};

const track = (
	indicator: HTMLElement,
	active: string,
	prefix: string,
	publishOn: "indicator" | "parent",
): (() => void) => {
	const container = indicator.parentElement;
	if (container === null) {
		return () => undefined;
	}
	const carrier =
		publishOn === "parent" ? container : indicator;
	let wasActive = false;

	const measure = () => {
		const target =
			container.querySelector<HTMLElement>(active);
		indicator.toggleAttribute(
			"data-empty",
			target === null,
		);
		if (target === null) {
			wasActive = false;
			return;
		}
		indicator.toggleAttribute("data-jump", !wasActive);
		wasActive = true;
		const { left, top } = offsetWithin(target, container);
		publish(carrier, `${prefix}-left`, `${left}px`);
		publish(carrier, `${prefix}-top`, `${top}px`);
		publish(
			carrier,
			`${prefix}-width`,
			`${target.offsetWidth}px`,
		);
		publish(
			carrier,
			`${prefix}-height`,
			`${target.offsetHeight}px`,
		);
	};

	measure();
	const resizes = new ResizeObserver(measure);
	resizes.observe(container);
	const mutations = new MutationObserver(records => {
		if (
			records.some(
				record => !indicator.contains(record.target),
			)
		) {
			measure();
		}
	});
	mutations.observe(container, {
		attributes: true,
		childList: true,
		subtree: true,
	});
	return () => {
		resizes.disconnect();
		mutations.disconnect();
	};
};

/**
 * Moves a sliding indicator onto the active item of its parent, which must be
 * positioned. Writes `<prefix>-left`, `-top`, `-width` and `-height` on the
 * indicator (or on its parent, with `publishOn: "parent"`), sets `data-empty`
 * on the indicator while nothing is active and `data-jump` when it arrives from
 * nothing, and re-measures whenever the parent resizes or anything inside it
 * changes. It starts tracking whenever the indicator mounts. Style it with the
 * `sliding-indicator.scss` mixins.
 *
 * @example
 * const ref = useSlidingIndicator<HTMLSpanElement>({ active: '[aria-current="page"]' });
 * <span ref={ref} aria-hidden="true" className={style.indicator} />
 */
export const useSlidingIndicator = <
	TElement extends HTMLElement,
>({
	active,
	prefix = "--active-item",
	publishOn = "indicator",
}: SlidingIndicatorOptions): RefCallback<TElement> =>
	useCallback(
		(indicator: TElement | null) =>
			indicator === null
				? undefined
				: track(indicator, active, prefix, publishOn),
		[active, prefix, publishOn],
	);
