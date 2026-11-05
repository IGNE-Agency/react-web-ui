import { type RefObject, useEffect, useRef } from "react";

/** What {@link useInfiniteScroll} watches and calls. */
export type UseInfiniteScrollOptions = Readonly<{
	/** The scroll container. Attach the same ref to the scrolling element. */
	ref: RefObject<HTMLElement | null>;
	/**
	 * Whether another page can and should load now, typically
	 * `hasNextPage && !isFetchingNextPage`. The edge is checked again whenever
	 * this turns `true`, so a short page still loads the next one.
	 */
	enabled: boolean;
	/** Loads the next page. */
	onLoadMore: () => void;
	/** Distance from the load edge, in pixels, at which loading begins. @default 512 */
	threshold?: number;
	/** The load edge is the top, for a `flex-direction: column-reverse` container. */
	reversed?: boolean;
}>;

/**
 * Calls `onLoadMore` whenever the scroll container comes within `threshold`
 * pixels of its load edge: on scroll, and whenever `enabled` turns `true`.
 *
 * @example
 * const listRef = useRef<HTMLDivElement>(null);
 * useInfiniteScroll({
 * 	ref: listRef,
 * 	enabled: query.hasNextPage && !query.isFetchingNextPage,
 * 	onLoadMore: () => void query.fetchNextPage(),
 * });
 */
export const useInfiniteScroll = ({
	ref,
	enabled,
	onLoadMore,
	threshold = 512,
	reversed = false,
}: UseInfiniteScrollOptions): void => {
	const latest = useRef({ enabled, onLoadMore });

	useEffect(() => {
		latest.current = { enabled, onLoadMore };
	});

	useEffect(() => {
		const element = ref.current;
		if (element === null) {
			return undefined;
		}
		const maybeLoadMore = () => {
			if (!latest.current.enabled) {
				return;
			}
			const maxScroll =
				element.scrollHeight - element.clientHeight;
			const distance = reversed
				? maxScroll - Math.abs(element.scrollTop)
				: maxScroll - element.scrollTop;
			if (distance <= threshold) {
				latest.current.onLoadMore();
			}
		};
		if (enabled) {
			maybeLoadMore();
		}
		element.addEventListener("scroll", maybeLoadMore, {
			passive: true,
		});
		return () =>
			element.removeEventListener("scroll", maybeLoadMore);
	}, [ref, enabled, threshold, reversed]);
};
