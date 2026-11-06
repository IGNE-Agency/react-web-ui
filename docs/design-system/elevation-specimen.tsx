import { variableNameOf } from "../../src/terrazzo/index";
import styles from "./elevation-specimen.module.scss";
import {
	descriptionOf,
	groupOf,
	isFilter,
	nameOf,
	THEMES,
	type TokenId,
} from "./tokens";

const OVERLAY = "sys.color.surface-overlay";

/**
 * Every elevation level as its surface casting its shadow, on the light and
 * the dark canvas, with what sits at each level.
 *
 * @example
 * <ElevationSpecimen
 * 	surfaces={{ "sys.elevation.2": "sys.color.surface-overlay-high" }}
 * />
 */
export const ElevationSpecimen = ({
	surfaces,
}: Readonly<{
	/** The surface role each level gets; a popup's surface otherwise. */
	surfaces: Readonly<Partial<Record<TokenId, TokenId>>>;
}>) => {
	const levels = groupOf("sys.elevation").tokens.filter(
		id => !isFilter(id),
	);

	return (
		<div className={styles.stages}>
			{THEMES.map(theme => (
				<div
					key={theme}
					data-theme={theme}
					className={styles.stage}>
					<span className={styles.theme}>
						{theme === "light" ? "Light" : "Dark"}
					</span>
					<div
						className={styles.levels}
						style={{ "--levels": levels.length }}>
						{levels.map(id => (
							<div
								key={id}
								className={styles.level}
								style={{
									"--level": nameOf(id),
									"--surface": `var(${variableNameOf(surfaces[id] ?? OVERLAY)})`,
									"--elevation": `var(${variableNameOf(id)})`,
								}}>
								<span className={styles.number}>
									{nameOf(id)}
								</span>
								<span className={styles.use}>
									{descriptionOf(id) ?? "Unused"}
								</span>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
};
