import styles from "./state-layer-specimen.module.scss";
import {
	colourIn,
	groupOf,
	nameOf,
	numberOf,
	THEMES,
} from "./tokens";

/**
 * Each interaction state's layer, from rest to dragged, painted over a surface
 * in each theme with the opacity that theme gives it.
 *
 * @example
 * <StateLayerSpecimen />
 */
export const StateLayerSpecimen = () => {
	const states = groupOf("sys.state").tokens;

	return (
		<div className={styles.stages}>
			{THEMES.map(theme => (
				<div
					key={theme}
					className={styles.stage}
					style={{
						"--canvas": colourIn("sys.color.bg", theme),
						"--surface": colourIn(
							"sys.color.surface",
							theme,
						),
						"--text": colourIn("sys.color.text", theme),
						"--muted": colourIn(
							"sys.color.text-muted",
							theme,
						),
						"--edge": colourIn("sys.color.border", theme),
					}}>
					<span className={styles.theme}>
						{theme === "light" ? "Light" : "Dark"}
					</span>
					<div className={styles.states}>
						<div className={styles.state}>
							<span className={styles.tile} aria-hidden />
							<span className={styles.name}>rest</span>
							<span className={styles.value}>0%</span>
						</div>
						{states.map(id => {
							const opacity = numberOf(id, theme) ?? 0;
							return (
								<div key={id} className={styles.state}>
									<span
										className={styles.tile}
										style={{ "--layer": opacity }}
										aria-hidden
									/>
									<span className={styles.name}>
										{nameOf(id)}
									</span>
									<span className={styles.value}>
										{`${Math.round(opacity * 100)}%`}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};
