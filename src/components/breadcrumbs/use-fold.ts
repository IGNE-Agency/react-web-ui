import { useLayoutEffect, useState } from "react";

/** The widths, in pixels, that decide how far a trail folds. */
export type TrailGauge = Readonly<{
	/** The width of each crumb at its full length, outermost first. */
	crumbs: readonly number[];
	/** The width of one separator. */
	separator: number;
	/** The width of the button that holds the folded crumbs. */
	overflow: number;
	/** The width the trail has. */
	room: number;
}>;

/**
 * Counts the crumbs to fold into the overflow menu so that the trail fits its
 * room. It folds the crumb next to the first one first, and never folds the
 * first or the last crumb.
 *
 * @example
 * foldCount({ crumbs: [50, 120, 80, 140], separator: 32, overflow: 40, room: 410 }); // 1
 */
export const foldCount = ({
	crumbs,
	separator,
	overflow,
	room,
}: TrailGauge): number => {
	const foldable = Math.max(crumbs.length - 2, 0);
	const full =
		crumbs.reduce((sum, crumb) => sum + crumb, 0) +
		separator * Math.max(crumbs.length - 1, 0);

	const widthAfter = (folded: number): number =>
		folded === 0
			? full
			: full -
				crumbs
					.slice(1, 1 + folded)
					.reduce(
						(sum, crumb) => sum + crumb + separator,
						0,
					) +
				overflow +
				separator;

	const fits = Array.from(
		{ length: foldable },
		(_, folded) => folded,
	).find(folded => widthAfter(folded) <= room);

	return fits ?? foldable;
};

const widthOf = (element: Element | null): number =>
	element?.getBoundingClientRect().width ?? 0;

const gaugeOf = (
	gauge: Element,
	root: Element,
): TrailGauge => ({
	crumbs: Array.from(
		gauge.querySelectorAll('[data-gauge="crumb"]'),
		widthOf,
	),
	separator: widthOf(
		gauge.querySelector('[data-gauge="separator"]'),
	),
	overflow: widthOf(
		gauge.querySelector('[data-gauge="overflow"]'),
	),
	room: widthOf(root),
});

/**
 * Measures how many crumbs a trail folds. The `root` ref goes on the element
 * whose width the trail has, the `gauge` ref on a hidden copy of the trail at
 * its full length (`Breadcrumbs.Gauge`). It measures again when either one
 * changes size.
 *
 * @example
 * const { root, gauge, folded } = useFold();
 */
export const useFold = (): Readonly<{
	root: (element: HTMLElement | null) => void;
	gauge: (element: HTMLOListElement | null) => void;
	folded: number;
}> => {
	const [root, setRoot] = useState<HTMLElement | null>(
		null,
	);
	const [gauge, setGauge] =
		useState<HTMLOListElement | null>(null);
	const [folded, setFolded] = useState(0);

	useLayoutEffect(() => {
		if (root === null || gauge === null) {
			return undefined;
		}

		const measure = () =>
			setFolded(foldCount(gaugeOf(gauge, root)));

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(root);
		observer.observe(gauge);

		return () => observer.disconnect();
	}, [root, gauge]);

	return { root: setRoot, gauge: setGauge, folded };
};
