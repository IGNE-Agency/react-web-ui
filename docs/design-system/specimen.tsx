import type { ReactNode } from "react";
import styles from "./specimen.module.scss";

/**
 * A live specimen of the system's tokens on the guide's figure plate, with a
 * caption that says what to notice in it.
 *
 * @example
 * <Specimen caption="Every radius on one tile.">
 * 	<RadiusSpecimen radii={radii} />
 * </Specimen>
 */
export const Specimen = ({
	caption,
	children,
}: Readonly<{ caption: string; children: ReactNode }>) => (
	<figure className={`${styles.specimen} sb-unstyled`}>
		<div className={styles.body}>{children}</div>
		<figcaption className={styles.caption}>
			{caption}
		</figcaption>
	</figure>
);
