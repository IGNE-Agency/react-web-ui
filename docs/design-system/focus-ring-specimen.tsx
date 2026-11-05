import styles from "./focus-ring-specimen.module.scss";
import {
	dimensionOf,
	documentTheme,
	hexOf,
	pixelsOf,
	sourceOf,
	type TokenId,
} from "./tokens";

const COLOUR = "sys.color.focus-ring";

const SHAPES = [
	{ name: "pill", label: "Save" },
	{ name: "card", label: "Workshop" },
	{ name: "circle", label: "AV" },
] as const;

const pixelsText = (id: TokenId) => {
	const dimension = dimensionOf(id);
	return dimension === undefined
		? ""
		: `${pixelsOf(dimension)}px`;
};

/**
 * The shared focus ring drawn on a pill, a card and a circle, with the width,
 * offset and colour it resolves to.
 *
 * @example
 * <FocusRingSpecimen />
 */
export const FocusRingSpecimen = () => {
	const theme = documentTheme();

	return (
		<div className={styles.specimen}>
			<div className={styles.shapes} aria-hidden>
				{SHAPES.map(({ name, label }) => (
					<span
						key={name}
						className={styles.shape}
						data-shape={name}>
						{label}
					</span>
				))}
			</div>
			<dl className={styles.values}>
				<div>
					<dt>Width</dt>
					<dd>{pixelsText("sys.focus-ring.width")}</dd>
				</div>
				<div>
					<dt>Offset</dt>
					<dd>{pixelsText("sys.focus-ring.offset")}</dd>
				</div>
				<div>
					<dt>Colour</dt>
					<dd>{`${sourceOf(COLOUR, theme)} · ${hexOf(COLOUR, theme)}`}</dd>
				</div>
			</dl>
		</div>
	);
};
