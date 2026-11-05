import styles from "./spacing-specimen.module.scss";
import { variableNameOf } from "../../src/terrazzo/index";
import {
	dimensionOf,
	nameOf,
	pixelsOf,
	type TokenId,
} from "./tokens";

/**
 * The spacing scale at true size: a panel laid out with it and redlined, then
 * each listed unit as a measured band with its step and its size in pixels.
 *
 * @example
 * <SpacingSpecimen units={["sys.unit.4", "sys.unit.8"]} />
 */
export const SpacingSpecimen = ({
	units,
}: Readonly<{ units: readonly TokenId[] }>) => (
	<div className={styles.specimen}>
		<div className={styles.field} aria-hidden>
			<div className={styles.panel}>
				<span
					className={`${styles.value} ${styles.padding}`}>
					12
				</span>
				<span className={styles.avatar}>AV</span>
				<span className={styles.gap}>
					<span className={styles.value}>8</span>
				</span>
				<span className={styles.lines}>
					<span className={styles.title}>
						Anna de Vries
					</span>
					<span className={styles.leading}>
						<span className={styles.value}>4</span>
					</span>
					<span className={styles.meta}>
						Design review · 12 March
					</span>
				</span>
			</div>
		</div>
		<ul className={styles.scale}>
			{units.map(id => {
				const dimension = dimensionOf(id);
				const size = `var(${variableNameOf(id)})`;
				return (
					<li key={id} className={styles.step}>
						<span
							className={styles.band}
							style={{ inlineSize: size }}
							aria-hidden
						/>
						<span
							className={styles.dimension}
							style={{ inlineSize: size }}
							aria-hidden
						/>
						<span className={styles.number}>
							{nameOf(id)}
						</span>
						<span className={styles.pixels}>
							{dimension === undefined
								? null
								: `${pixelsOf(dimension)} px`}
						</span>
					</li>
				);
			})}
		</ul>
	</div>
);
