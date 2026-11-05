import { fontFamilyPropertyOf } from "../../src/terrazzo/index";
import styles from "./typeface-specimen.module.scss";
import {
	type Group,
	groupOf,
	pixelsOf,
	typographyOf,
} from "./tokens";

const CHARACTERS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 € & @ ( ) . , : ;";

const scaleOf = (group: Group) =>
	group.tokens.flatMap(id => {
		const value = typographyOf(id);
		return value === undefined ? [] : [value];
	});

const FamilyCard = ({
	family,
}: Readonly<{ family: Group }>) => {
	const weights = family.groups
		.map(groupOf)
		.flatMap(weight => {
			const [first] = scaleOf(weight);
			return first === undefined
				? []
				: [{ weight, value: first }];
		});
	const [lightest] = weights;
	const heaviest = weights.at(-1);
	const sizes =
		lightest === undefined
			? []
			: scaleOf(lightest.weight).map(step =>
					Math.round(pixelsOf(step.fontSize)),
				);
	const property = fontFamilyPropertyOf(family.id);
	const fontFamily = `var(${property})`;

	return (
		<div className={styles.family}>
			<div className={styles.field} aria-hidden>
				<span
					className={styles.display}
					style={{
						fontFamily,
						fontWeight: heaviest?.value.fontWeight,
					}}>
					Aa
				</span>
			</div>
			<div className={styles.about}>
				<span className={styles.name}>{property}</span>
				<span className={styles.use}>
					{family.description}
				</span>
			</div>
			<ul className={styles.weights}>
				{weights.map(({ weight, value }) => (
					<li
						key={weight.id}
						style={{
							fontFamily,
							fontWeight: value.fontWeight,
						}}>
						{`${weight.name} ${value.fontWeight}`}
					</li>
				))}
			</ul>
			<span className={styles.use}>
				{`Sizes ${sizes.join(" · ")} px`}
			</span>
			<p
				className={styles.characters}
				style={{ fontFamily }}>
				{CHARACTERS}
			</p>
		</div>
	);
};

/**
 * Each family of the type scale at display size, in the typeface its custom
 * property names, with what it sets, the weights and sizes the scale gives it
 * and its character set.
 *
 * @example
 * <TypefaceSpecimen />
 */
export const TypefaceSpecimen = () => (
	<div className={styles.families}>
		{groupOf("ref.font").groups.map(id => (
			<FamilyCard key={id} family={groupOf(id)} />
		))}
	</div>
);
