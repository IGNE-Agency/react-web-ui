import { useState, type FocusEvent } from "react";
import type { FieldState } from "./field-state.ts";

export type FieldFocusHandlers<
	TEvent extends FocusEvent<HTMLElement>,
> = Readonly<{
	onFocus?: (event: TEvent) => void;
	onBlur?: (event: TEvent) => void;
}>;

export type FieldFocus<
	TEvent extends FocusEvent<HTMLElement> =
		FocusEvent<HTMLElement>,
> = Readonly<{
	/** Focus is on this element or inside it, however it got there. */
	focused: boolean;
	/** That focus is the keyboard's, so it has earned a ring. */
	focusVisible: boolean;
	/** Spread onto the element whose focus is being tracked, after its own props. */
	props: Readonly<{
		onFocus: (event: TEvent) => void;
		onBlur: (event: TEvent) => void;
	}>;
}>;

/**
 * Live focus laid over a projected field state. A caller can add focus that
 * lands elsewhere in the field, such as a popup this element does not contain;
 * the ring stays the element's own.
 *
 * @example
 * fieldStateAttributes(withFieldFocus(state, useFieldFocus(props)));
 */
export const withFieldFocus = (
	state: FieldState,
	focus: Pick<FieldFocus, "focused" | "focusVisible">,
): FieldState => ({
	...state,
	focused: state.focused === true || focus.focused,
	focusVisible: focus.focusVisible,
});

/**
 * Tracks focus for a control that has to publish it as `data-focused` and
 * `data-focus-visible` rather than leave it to a selector. React's focus events
 * bubble, so this reads focus inside a group as well as on a bare control. The
 * handlers passed in still run, so `props` is spread last.
 *
 * @example
 * const focus = useFieldFocus(props);
 * <div {...props} {...focus.props} />
 */
export const useFieldFocus = <
	TEvent extends FocusEvent<HTMLElement> =
		FocusEvent<HTMLElement>,
>(
	handlers?: FieldFocusHandlers<TEvent>,
): FieldFocus<TEvent> => {
	const [focus, setFocus] = useState({
		focused: false,
		focusVisible: false,
	});

	return {
		...focus,
		props: {
			onFocus: event => {
				setFocus({
					focused: true,
					focusVisible: event.target.matches(
						":focus-visible",
					),
				});
				handlers?.onFocus?.(event);
			},
			onBlur: event => {
				const inside =
					event.relatedTarget instanceof Node &&
					event.currentTarget.contains(event.relatedTarget);
				if (!inside) {
					setFocus({ focused: false, focusVisible: false });
				}
				handlers?.onBlur?.(event);
			},
		},
	};
};
