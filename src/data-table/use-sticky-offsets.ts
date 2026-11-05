import {
	type RefObject,
	useLayoutEffect,
	useRef,
} from "react";

const START_PROPERTY = "--table-sticky-inset";
const END_PROPERTY = "--table-sticky-end";
const TOTAL_PROPERTY = "--table-sticky-total";
const END_TOTAL_PROPERTY = "--table-sticky-end-total";
const SCROLLBAR_BLOCK_PROPERTY = "--table-scrollbar-block";
const SCROLLBAR_INLINE_PROPERTY =
	"--table-scrollbar-inline";

/**
 * Publishes the measured geometry of a table's pinned columns as custom
 * properties on the element the returned ref is attached to: one
 * `--table-sticky-inset-{n}` per column pinned to the start and one
 * `--table-sticky-end-{n}` per column pinned to the end, each holding
 * everything between it and its edge, plus `--table-sticky-total` and
 * `--table-sticky-end-total` for each group as a whole, and
 * `--table-scrollbar-block` / `--table-scrollbar-inline` for the space the
 * scroller's own scrollbars take. Widths are measured off the header cells of
 * the frame's own table and re-measured on resize.
 *
 * @param pinnedColumnKey - The pinned column ids joined into one string; a
 * changed pinned set re-runs the measurement.
 * @returns Ref for the non-scrolling frame around the table.
 *
 * @example
 * const frameRef = useStickyOffsets(pinnedIds.join(","));
 * // <div ref={frameRef}> … <td style={{ insetInlineStart: "var(--table-sticky-inset-0)" }} />
 */
export const useStickyOffsets = (
	pinnedColumnKey: string,
): RefObject<HTMLDivElement | null> => {
	const frameRef = useRef<HTMLDivElement | null>(null);

	useLayoutEffect(() => {
		const frame = frameRef.current;
		if (!frame) {
			return undefined;
		}

		const scroller = frame.querySelector<HTMLElement>(
			"[data-scroller]",
		);
		const table = frame.querySelector("table");
		const headerCells = (side: string) =>
			Array.from(
				table?.querySelectorAll<HTMLElement>(
					`:scope > thead [data-sticky="${side}"]`,
				) ?? [],
			);
		const startCells = headerCells("start");
		const endCells = headerCells("end");

		const publish = () => {
			const total = startCells.reduce(
				(offset, cell, index) => {
					frame.style.setProperty(
						`${START_PROPERTY}-${index}`,
						`${offset}px`,
					);
					return (
						offset + cell.getBoundingClientRect().width
					);
				},
				0,
			);
			frame.style.setProperty(TOTAL_PROPERTY, `${total}px`);

			const endTotal = endCells.reduceRight(
				(offset, cell, index) => {
					frame.style.setProperty(
						`${END_PROPERTY}-${index}`,
						`${offset}px`,
					);
					return (
						offset + cell.getBoundingClientRect().width
					);
				},
				0,
			);
			frame.style.setProperty(
				END_TOTAL_PROPERTY,
				`${endTotal}px`,
			);

			if (scroller) {
				frame.style.setProperty(
					SCROLLBAR_BLOCK_PROPERTY,
					`${scroller.offsetHeight - scroller.clientHeight}px`,
				);
				frame.style.setProperty(
					SCROLLBAR_INLINE_PROPERTY,
					`${scroller.offsetWidth - scroller.clientWidth}px`,
				);
			}
		};

		publish();

		const observer = new ResizeObserver(publish);
		for (const cell of [
			...startCells,
			...endCells,
			...(scroller ? [scroller] : []),
		]) {
			observer.observe(cell);
		}

		return () => {
			observer.disconnect();
			for (const index of startCells.keys()) {
				frame.style.removeProperty(
					`${START_PROPERTY}-${index}`,
				);
			}
			for (const index of endCells.keys()) {
				frame.style.removeProperty(
					`${END_PROPERTY}-${index}`,
				);
			}
			frame.style.removeProperty(TOTAL_PROPERTY);
			frame.style.removeProperty(END_TOTAL_PROPERTY);
			frame.style.removeProperty(SCROLLBAR_BLOCK_PROPERTY);
			frame.style.removeProperty(SCROLLBAR_INLINE_PROPERTY);
		};
		// oxlint-disable-next-line react/exhaustive-effect-dependencies -- the pinned set decides which cells are measured; a new set re-measures
	}, [pinnedColumnKey]);

	return frameRef;
};
