import Logo from "./logo.svg?react";
import styles from "./logo-specimen.module.scss";
import { colourIn, THEMES } from "./tokens";

type Size = Readonly<{
	/** The mark's width, as a CSS length. */
	size: string;
	/** Where the product draws it at this size. */
	use: string;
}>;

/**
 * The mark at every size the product draws it, in the brand colour of each
 * theme, on that theme's canvas.
 *
 * @example
 * <LogoSpecimen sizes={[{ size: "1.75rem", use: "Sidebar" }]} />
 */
export const LogoSpecimen = ({
	sizes,
}: Readonly<{ sizes: readonly Size[] }>) => (
	<div className={styles.stages}>
		{THEMES.map(theme => (
			<div
				key={theme}
				className={styles.stage}
				style={{
					"--canvas": colourIn("sys.color.bg", theme),
					"--mark": colourIn("sys.color.primary", theme),
					"--muted": colourIn(
						"sys.color.text-muted",
						theme,
					),
				}}>
				<span className={styles.theme}>
					{theme === "light" ? "Light" : "Dark"}
				</span>
				<div className={styles.sizes}>
					{sizes.map(({ size, use }) => (
						<div key={use} className={styles.size}>
							<Logo
								className={styles.logo}
								style={{ inlineSize: size }}
								aria-hidden
							/>
							<span className={styles.use}>{use}</span>
							<span className={styles.use}>{size}</span>
						</div>
					))}
				</div>
			</div>
		))}
	</div>
);
