import styles from "./role-specimen.module.scss";
import { Token } from "./token";
import {
	colourIn,
	descriptionOf,
	referenceOf,
	sourceOf,
	type Theme,
	THEMES,
	type TokenId,
} from "./tokens";

const SURFACE = "sys.color.surface";
const TEXT = "sys.color.text";
const MUTED = "sys.color.text-muted";
const BORDER = "sys.color.border";
const RAISED = "sys.color.surface-high";

type Role = Readonly<{
	/** The role as people say it. */
	label: string;
	/** A fill role. */
	fill?: TokenId;
	/** The ink drawn on the fill. */
	ink?: TokenId;
	/** A line role. */
	line?: TokenId;
}>;

type Group = Readonly<{
	title: string;
	roles: readonly Role[];
}>;

const parts = ({ fill, ink, line }: Role) =>
	[
		{ part: "Fill", id: fill },
		{ part: "Ink", id: ink },
		{ part: "Line", id: line },
	].flatMap(({ part, id }) =>
		id === undefined ? [] : [{ part, id }],
	);

const purposeOf = (role: Role) => {
	const [first] = parts(role);
	return first === undefined
		? undefined
		: descriptionOf(first.id);
};

const Sample = ({
	role,
	theme,
}: Readonly<{
	role: Role;
	theme: Theme;
}>) => (
	<div
		className={styles.sample}
		style={{
			"--surface": colourIn(role.fill ?? SURFACE, theme),
			"--ink": colourIn(role.ink ?? TEXT, theme),
			"--text": colourIn(TEXT, theme),
			"--muted": colourIn(MUTED, theme),
			"--edge": colourIn(BORDER, theme),
			"--card": colourIn(SURFACE, theme),
			"--token-bg": colourIn(RAISED, theme),
			"--token-ink": colourIn(TEXT, theme),
			"--token-edge": colourIn(BORDER, theme),
			"--line":
				role.line === undefined
					? undefined
					: colourIn(role.line, theme),
		}}>
		<span className={styles.tile} aria-hidden>
			{role.ink === undefined ? null : "Aa"}
			{role.line === undefined ? null : (
				<span className={styles.line} />
			)}
		</span>
		<span className={styles.theme}>
			{theme === "light" ? "Light theme" : "Dark theme"}
		</span>
		<dl className={styles.values}>
			{parts(role).map(({ part, id }) => {
				const reference = referenceOf(id, theme);
				return (
					<div key={part} className={styles.value}>
						<dt>{part}</dt>
						<dd>
							{reference === undefined ? (
								sourceOf(id, theme)
							) : (
								<Token id={reference} theme={theme} />
							)}
						</dd>
					</div>
				);
			})}
		</dl>
	</div>
);

const Band = ({
	theme,
	rows,
}: Readonly<{
	theme: Theme;
	rows: number;
}>) => (
	<div
		className={styles.band}
		data-theme-band={theme}
		style={{
			"--card": colourIn(SURFACE, theme),
			"--muted": colourIn(MUTED, theme),
			"--rows": rows,
		}}
		aria-hidden>
		{theme === "light" ? "Light" : "Dark"}
	</div>
);

/**
 * The colour roles, grouped, each drawn as it looks in the light and the dark
 * theme side by side on that theme's canvas, with what it is for, and the ramp
 * step and hex each theme points it at.
 *
 * @example
 * <RoleSpecimen groups={[{ title: "Brand", roles: [{ label: "Primary", fill: "sys.color.primary", ink: "sys.color.on-primary" }] }]} />
 */
export const RoleSpecimen = ({
	groups,
}: Readonly<{ groups: readonly Group[] }>) => (
	<div className={styles.groups}>
		{groups.map(({ title, roles }) => (
			<section key={title} className={styles.group}>
				{THEMES.map(theme => (
					<Band
						key={theme}
						theme={theme}
						rows={roles.length + 1}
					/>
				))}
				<h3 className={`${styles.title} skip-toc`}>
					{title}
				</h3>
				{roles.map((role, index) => (
					<div
						key={role.label}
						className={styles.role}
						style={{ "--row": index + 2 }}>
						<div className={styles.about}>
							<span className={styles.name}>
								{role.label}
							</span>
							<span className={styles.use}>
								{purposeOf(role)}
							</span>
						</div>
						{THEMES.map(theme => (
							<Sample
								key={theme}
								role={role}
								theme={theme}
							/>
						))}
					</div>
				))}
			</section>
		))}
	</div>
);
