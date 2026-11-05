import {
	type FocusEvent,
	type PointerEvent,
	useEffect,
	useRef,
} from "react";

const INTENT_DELAY_MS = 50;

/** The trigger handlers {@link useIntent} returns. */
export type IntentHandlers = Readonly<{
	onPointerEnter?: (event: PointerEvent) => void;
	onPointerLeave?: (event: PointerEvent) => void;
	onFocus?: (event: FocusEvent) => void;
}>;

/**
 * Trigger handlers that call `onIntent` once a pointer rests on the trigger or
 * it takes focus, so the caller can warm whatever the popup will show. Returns
 * no handlers when `onIntent` is omitted.
 *
 * @example
 * const intent = useIntent(() => prefetchRates(id));
 * return <button {...intent}>…</button>;
 */
export const useIntent = (
	onIntent: (() => void) | undefined,
): IntentHandlers => {
	const timer =
		useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	if (!onIntent) {
		return {};
	}

	const cancel = () => {
		clearTimeout(timer.current);
		timer.current = undefined;
	};

	const run = () => {
		cancel();
		onIntent();
	};

	return {
		onPointerEnter: () => {
			if (timer.current === undefined) {
				timer.current = setTimeout(run, INTENT_DELAY_MS);
			}
		},
		onPointerLeave: cancel,
		onFocus: run,
	};
};
