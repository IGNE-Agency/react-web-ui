import TranslateIcon from "@material-design-icons/svg/outlined/translate.svg?react";
import styles from "./language-drawing.module.scss";

/**
 * The guide's Language opener: the translate glyph, set enormous and cropped.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<LanguageDrawing />
 * </Illustration>
 */
export const LanguageDrawing = () => (
	<svg viewBox="0 0 1200 600" className={styles.drawing}>
		<rect
			className={styles.field}
			width="1200"
			height="600"
		/>
		<TranslateIcon
			className={styles.glyph}
			x={180}
			y={-50}
			width={980}
			height={980}
		/>
	</svg>
);
