import { type RefObject, useEffect, useState } from "react";
import { useMediaQuery } from "./use-media-query.ts";

/** The state attributes `usePresence` puts on its element, as base-ui does. */
export type PresenceProps = Readonly<{
	"data-open": "" | undefined;
	"data-starting-style": "" | undefined;
	"data-ending-style": "" | undefined;
}>;

export type Presence = Readonly<{
	/** Whether to render the element. */
	mounted: boolean;
	/** The state attributes to spread onto it. */
	props: PresenceProps;
}>;

type Transition = "starting" | "idle" | "ending";

type State = Readonly<{
	open: boolean;
	mounted: boolean;
	transition: Transition;
}>;

const nextState = (
	state: State,
	open: boolean,
	reducedMotion: boolean,
): State => {
	if (reducedMotion) {
		return { open, mounted: open, transition: "idle" };
	}
	if (open) {
		return {
			open,
			mounted: true,
			transition: state.mounted ? "idle" : "starting",
		};
	}
	return {
		open,
		mounted: state.mounted,
		transition: state.mounted ? "ending" : "idle",
	};
};

const runningAnimationsOf = (element: Element) =>
	element
		.getAnimations()
		.filter(
			animation => animation.playState !== "finished",
		);

const animationsSettled = async (
	element: Element | null,
): Promise<void> => {
	if (element === null) {
		return;
	}
	const running = runningAnimationsOf(element);
	if (running.length === 0) {
		return;
	}
	await Promise.allSettled(
		running.map(animation => animation.finished),
	);
	await animationsSettled(element);
};

/**
 * Keeps an element mounted until its exit transition has finished, and puts
 * base-ui's state attributes on it, so a stylesheet animates both directions
 * with `[data-starting-style]` and `[data-ending-style]`. Under reduced motion
 * it mounts and unmounts at once.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const presence = usePresence(busy, ref);
 * return presence.mounted ? <div ref={ref} {...presence.props} /> : null;
 */
export const usePresence = (
	open: boolean,
	ref: RefObject<Element | null>,
): Presence => {
	const reducedMotion = useMediaQuery(
		"(prefers-reduced-motion: reduce)",
	);
	const [state, setState] = useState<State>({
		open,
		mounted: open,
		transition: "idle",
	});
	if (state.open !== open) {
		setState(nextState(state, open, reducedMotion));
	}

	useEffect(() => {
		if (state.transition !== "starting") {
			return undefined;
		}
		let frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => {
				setState(current =>
					current.transition === "starting"
						? { ...current, transition: "idle" }
						: current,
				);
			});
		});
		return () => cancelAnimationFrame(frame);
	}, [state.transition]);

	useEffect(() => {
		if (state.transition !== "ending") {
			return undefined;
		}
		const abort = new AbortController();
		const unmountWhenSettled = async () => {
			await animationsSettled(ref.current);
			if (!abort.signal.aborted) {
				setState(current => ({
					...current,
					mounted: false,
					transition: "idle",
				}));
			}
		};
		const frame = requestAnimationFrame(() => {
			void unmountWhenSettled();
		});
		return () => {
			cancelAnimationFrame(frame);
			abort.abort();
		};
	}, [state.transition, ref]);

	return {
		mounted: state.mounted,
		props: {
			"data-open": open ? "" : undefined,
			"data-starting-style":
				state.transition === "starting" ? "" : undefined,
			"data-ending-style":
				state.transition === "ending" ? "" : undefined,
		},
	};
};
