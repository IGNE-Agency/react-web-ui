import {
	ArrowCurved,
	ArrowLoop,
	Asterisk,
	Circle,
	Sparkle,
	Star,
	UnderlineStraight,
	UnderlineWave,
} from "../brand/doodles/index.ts";
import { Logo } from "../brand/logo.tsx";
import styles from "./brand-figures.module.scss";

type Colour = Readonly<{
	name: string;
	value: string;
	hex: string;
	use: string;
}>;

type Group = Readonly<{
	title: string;
	colours: readonly Colour[];
}>;

const PALETTE: readonly Group[] = [
	{
		title: "Scheme",
		colours: [
			{
				name: "Yellow",
				value: "var(--docs-color-yellow)",
				hex: "#FFD86F",
				use: "The logo box, fills and marks.",
			},
			{
				name: "Yellow, strong",
				value: "var(--docs-color-yellow-strong)",
				hex: "#ECC251",
				use: "A yellow fill under the pointer.",
			},
		],
	},
	{
		title: "Accents",
		colours: [
			{
				name: "Blue",
				value: "var(--docs-color-blue)",
				hex: "#5490D1",
				use: "Public sector. Tiles, marks, the link underline.",
			},
			{
				name: "Blue, strong",
				value: "var(--docs-color-blue-strong)",
				hex: "#3171B5",
				use: "A blue fill that carries text.",
			},
			{
				name: "Green",
				value: "var(--docs-color-green)",
				hex: "#2FA278",
				use: "Healthcare. Tiles and marks.",
			},
			{
				name: "Green, strong",
				value: "var(--docs-color-green-strong)",
				hex: "#237B5B",
				use: "A green fill that carries text.",
			},
		],
	},
	{
		title: "Surfaces",
		colours: [
			{
				name: "Sand",
				value: "var(--docs-color-paper)",
				hex: "#F8F4F1",
				use: "The page.",
			},
			{
				name: "White",
				value: "var(--docs-color-surface)",
				hex: "#FFFFFF",
				use: "A card on the page.",
			},
			{
				name: "Sand, dark",
				value: "var(--docs-color-sand-strong)",
				hex: "#D8CAC0",
				use: "Lines and the tile grid.",
			},
		],
	},
	{
		title: "Ink",
		colours: [
			{
				name: "Heading",
				value: "var(--docs-color-ink)",
				hex: "#363636",
				use: "Headings, and text on yellow.",
			},
			{
				name: "Body",
				value: "var(--docs-color-body)",
				hex: "#454140",
				use: "Running text.",
			},
			{
				name: "Body, light",
				value: "var(--docs-color-muted)",
				hex: "#655E5D",
				use: "Captions and secondary text.",
			},
		],
	},
];

const DOODLES = [
	{
		name: "Underline",
		size: 104,
		Doodle: UnderlineStraight,
	},
	{
		name: "Wavy underline",
		size: 104,
		Doodle: UnderlineWave,
	},
	{ name: "Arrow", size: 80, Doodle: ArrowCurved },
	{ name: "Looping arrow", size: 88, Doodle: ArrowLoop },
	{ name: "Circle", size: 80, Doodle: Circle },
	{ name: "Sparkle", size: 56, Doodle: Sparkle },
	{ name: "Star", size: 56, Doodle: Star },
	{ name: "Asterisk", size: 56, Doodle: Asterisk },
];

const WEIGHTS = [
	{ name: "Regular", weight: 400 },
	{ name: "Medium", weight: 500 },
	{ name: "Bold", weight: 700 },
	{ name: "Black", weight: 900 },
];

/**
 * The logo on the grounds it may stand on: the yellow logo on the page in
 * either theme, and the dark logo on yellow.
 *
 * @example
 * <Specimen caption={caption}>
 * 	<LogoGrounds />
 * </Specimen>
 */
export const LogoGrounds = () => (
	<div className={styles.grounds}>
		<div className={styles.ground} data-ground="page">
			<Logo
				variant="yellow"
				label="The yellow IGNE logo"
				className={styles.logo}
			/>
		</div>
		<div className={styles.ground} data-ground="yellow">
			<Logo
				variant="dark"
				label="The dark IGNE logo"
				className={styles.logo}
			/>
		</div>
	</div>
);

/**
 * The docs palette, grouped, each colour with its name in the brand book, its
 * value there and what the docs use it for.
 *
 * @example
 * <Specimen caption={caption}>
 * 	<PaletteSpecimen />
 * </Specimen>
 */
export const PaletteSpecimen = () => (
	<div className={styles.palette}>
		{PALETTE.map(({ title, colours }) => (
			<section key={title} className={styles.group}>
				<h3 className={`${styles.title} skip-toc`}>
					{title}
				</h3>
				<ul className={styles.colours}>
					{colours.map(({ name, value, hex, use }) => (
						<li key={name} className={styles.colour}>
							<span
								className={styles.chip}
								style={{ "--chip": value }}
							/>
							<span className={styles.name}>{name}</span>
							<span className={styles.meta}>{hex}</span>
							<span className={styles.meta}>{use}</span>
						</li>
					))}
				</ul>
			</section>
		))}
	</div>
);

/**
 * Satoshi in the four weights the docs load, and a Kalam eyebrow over a
 * Satoshi title.
 *
 * @example
 * <Specimen caption={caption}>
 * 	<TypeSpecimen />
 * </Specimen>
 */
export const TypeSpecimen = () => (
	<div className={styles.type}>
		<ul className={styles.weights}>
			{WEIGHTS.map(({ name, weight }) => (
				<li key={name} className={styles.weight}>
					<span
						className={styles.glyphs}
						style={{ fontWeight: weight }}>
						Aa
					</span>
					<span className={styles.meta}>
						Satoshi {name}
					</span>
				</li>
			))}
		</ul>
		<div className={styles.pairing}>
			<span className={styles.eyebrow}>Foundation</span>
			<span className={styles.headline}>Colour</span>
		</div>
	</div>
);

/**
 * Every doodle the docs draw, at its own proportions, with its name.
 *
 * @example
 * <Specimen caption={caption}>
 * 	<DoodleSpecimen />
 * </Specimen>
 */
export const DoodleSpecimen = () => (
	<div className={styles.doodles}>
		<ul className={styles.list}>
			{DOODLES.map(({ name, size, Doodle }) => (
				<li key={name} className={styles.doodle}>
					<span className={styles.mark}>
						<Doodle size={size} className={styles.stroke} />
					</span>
					<span className={styles.meta}>{name}</span>
				</li>
			))}
		</ul>
	</div>
);
