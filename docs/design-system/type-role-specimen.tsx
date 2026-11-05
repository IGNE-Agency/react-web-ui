import { variableNameOf } from "../../src/terrazzo/index";
import styles from "./type-role-specimen.module.scss";
import {
	groupOf,
	nameOf,
	pixelsOf,
	type TypographyValue,
	typographyOf,
} from "./tokens";

type Group = Readonly<{
	/** The id of a group of type roles, e.g. `sys.font.label`. */
	group: string;
	title: string;
	/** The text each role in the group is set in. */
	sample: string;
	/** The roles to show, by name, e.g. `large`; all of them when left out. */
	roles?: readonly string[];
}>;

const specOf = ({
	fontFamily,
	fontSize,
	fontWeight,
	lineHeight,
}: TypographyValue) => {
	const family = Array.isArray(fontFamily)
		? (fontFamily[0] ?? "")
		: fontFamily;
	const pixels = pixelsOf(fontSize);
	const leading = Math.round(
		typeof lineHeight === "number"
			? lineHeight * pixels
			: pixelsOf(lineHeight),
	);
	const size = Math.round(pixels);
	return {
		size,
		weight: typeof fontWeight === "number" ? fontWeight : 0,
		text: `${family} · ${fontWeight} · ${size}/${leading} px`,
	};
};

/**
 * Type roles, grouped, each set in itself, with the family, weight, size and
 * line height it resolves to.
 *
 * @example
 * <TypeRoleSpecimen groups={[{ group: "sys.font.label", title: "Labels", sample: "Submit", roles: ["large"] }]} />
 */
export const TypeRoleSpecimen = ({
	groups,
}: Readonly<{ groups: readonly Group[] }>) => (
	<div className={styles.groups}>
		{groups.map(
			({ group, title, sample, roles: shown }) => {
				const { description, tokens } = groupOf(group);
				const roles = tokens
					.filter(
						id =>
							shown === undefined ||
							shown.includes(nameOf(id)),
					)
					.flatMap(id => {
						const value = typographyOf(id);
						return value === undefined
							? []
							: [{ id, spec: specOf(value) }];
					})
					.toSorted(
						(a, b) =>
							b.spec.size - a.spec.size ||
							b.spec.weight - a.spec.weight,
					);

				return (
					<section key={group} className={styles.group}>
						<div className={styles.heading}>
							<h3 className={`${styles.title} skip-toc`}>
								{title}
							</h3>
							<span className={styles.meta}>
								{description}
							</span>
						</div>
						{roles.map(({ id, spec }) => (
							<div key={id} className={styles.role}>
								<div className={styles.about}>
									<span className={styles.name}>
										{`${nameOf(group)}-${nameOf(id)}`}
									</span>
									<span className={styles.meta}>
										{spec.text}
									</span>
								</div>
								<span
									className={styles.sample}
									style={{
										font: `var(${variableNameOf(id)})`,
									}}>
									{sample}
								</span>
							</div>
						))}
					</section>
				);
			},
		)}
	</div>
);
