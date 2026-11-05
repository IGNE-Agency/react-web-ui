import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import FilterAltIcon from "@material-design-icons/svg/outlined/filter_alt.svg?react";
import PersonIcon from "@material-design-icons/svg/outlined/person.svg?react";
import CalendarTodayIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import LogoIcon from "./logo.svg?react";
import RequiredIcon from "../../src/assets/required.svg?react";
import SpinnerIcon from "../../src/assets/spinner.svg?react";
import type { SvgComponent } from "../../src/components/icon/index.ts";
import { Icon } from "../../src/components/icon/index.ts";
import styles from "./icon-gallery.module.scss";

type Glyph = Readonly<{ name: string; svg: SvgComponent }>;

const GROUPS: readonly Readonly<{
	title: string;
	glyphs: readonly Glyph[];
}>[] = [
	{
		title: "From the set",
		glyphs: [
			{ name: "description", svg: DescriptionIcon },
			{ name: "search", svg: SearchIcon },
			{ name: "filter_alt", svg: FilterAltIcon },
			{ name: "person", svg: PersonIcon },
			{ name: "calendar_today", svg: CalendarTodayIcon },
		],
	},
	{
		title: "Our own",
		glyphs: [
			{ name: "logo", svg: LogoIcon },
			{ name: "required", svg: RequiredIcon },
			{ name: "spinner", svg: SpinnerIcon },
		],
	},
];

/**
 * A fixed sample of the outlined icon set, and the three glyphs the product
 * draws itself, each at the size a bottom bar draws it under its name.
 *
 * @example
 * <IconGallery />
 */
export const IconGallery = () => (
	<div className={styles.groups}>
		{GROUPS.map(({ title, glyphs }) => (
			<section key={title} className={styles.group}>
				<h3 className={`${styles.title} skip-toc`}>
					{title}
				</h3>
				<ul className={styles.glyphs}>
					{glyphs.map(({ name, svg }) => (
						<li key={name} className={styles.glyph}>
							<Icon svg={svg} label="" size={1.5} />
							<span className={styles.name}>{name}</span>
						</li>
					))}
				</ul>
			</section>
		))}
	</div>
);
