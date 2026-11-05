import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import SearchIcon from "@material-design-icons/svg/outlined/search.svg?react";
import FilterAltIcon from "@material-design-icons/svg/outlined/filter_alt.svg?react";
import PersonIcon from "@material-design-icons/svg/outlined/person.svg?react";
import CalendarTodayIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import type { SvgComponent } from "../../src/components/icon/index.ts";
import { Icon } from "../../src/components/icon/index.ts";
import styles from "./icon-gallery.module.scss";

type Glyph = Readonly<{ name: string; svg: SvgComponent }>;

const GROUPS: readonly Readonly<{
	title: string;
	glyphs: readonly Glyph[];
}>[] = [
	{
		title: "Beside a word",
		glyphs: [
			{ name: "description", svg: DescriptionIcon },
			{ name: "search", svg: SearchIcon },
			{ name: "filter_alt", svg: FilterAltIcon },
			{ name: "person", svg: PersonIcon },
			{ name: "calendar_today", svg: CalendarTodayIcon },
		],
	},
	{
		title: "In a slot",
		glyphs: [
			{ name: "close", svg: CloseIcon },
			{ name: "expand_more", svg: ExpandMoreIcon },
			{ name: "check", svg: CheckIcon },
		],
	},
];

/**
 * A fixed sample of Material's outlined icons, the example set these docs fill
 * the kit's slots from, each at the size a bottom bar draws it under its name.
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
