const EDGE = 3;

/**
 * The fill a drawing shows at its top edge, right under an element laid over
 * that edge, read from the topmost painted shape at that point. Text is
 * skipped, since a glyph's whole character box counts as a hit.
 *
 * @example
 * arrow.style.setProperty("--preview-field", edgeColourOf(drawing, arrow) ?? "");
 */
export const edgeColourOf = (
	art: SVGSVGElement,
	over: Element,
) => {
	const box = over.getBoundingClientRect();
	const frame = art.getBoundingClientRect();
	const shape = document
		.elementsFromPoint(
			box.left + box.width / 2,
			frame.top + EDGE,
		)
		.find(
			element =>
				element !== art &&
				art.contains(element) &&
				!(element instanceof SVGTextContentElement),
		);
	return shape === undefined
		? undefined
		: getComputedStyle(shape).fill;
};
