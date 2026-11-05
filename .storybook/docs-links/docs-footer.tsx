import ArrowBackIcon from "@material-design-icons/svg/outlined/arrow_back.svg?react";
import ArrowForwardIcon from "@material-design-icons/svg/outlined/arrow_forward.svg?react";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { Suspense, use, useContext } from "react";
import { NAVIGATE_URL } from "storybook/internal/core-events";
import {
	type DocsEntry,
	docsEntries,
	groupOf,
	nameOf,
} from "./docs-index.ts";
import {
	Icon,
	type SvgComponent,
} from "../../src/components/icon/index.ts";
import styles from "./docs-footer.module.scss";
import { isPlainClick, storybookHrefOf } from "./target.ts";

const Tile = ({
	entry,
	label,
	icon,
	className,
}: Readonly<{
	entry: DocsEntry | undefined;
	label: string;
	icon: SvgComponent;
	className?: string;
}>) => {
	const { channel } = useContext(DocsContext);
	if (entry === undefined) {
		return <span />;
	}
	const href = `?path=/docs/${entry.id}`;

	return (
		<a
			href={storybookHrefOf(href)}
			className={className}
			onClick={event => {
				if (isPlainClick(event)) {
					event.preventDefault();
					channel.emit(NAVIGATE_URL, href);
				}
			}}>
			<span className={styles.label}>
				<Icon svg={icon} label="" />
				{label}
			</span>
			<span className={styles.title}>{nameOf(entry)}</span>
		</a>
	);
};

const Footer = () => {
	const id = new URLSearchParams(
		window.location.search,
	).get("id");
	const pages = use(docsEntries());
	const position = pages.findIndex(
		entry => entry.id === id,
	);
	const current = pages[position];
	if (current === undefined) {
		return null;
	}
	const sameGroup = (entry: DocsEntry | undefined) =>
		entry !== undefined &&
		groupOf(entry) === groupOf(current)
			? entry
			: undefined;
	const previous = sameGroup(pages[position - 1]);
	const next = sameGroup(pages[position + 1]);
	if (previous === undefined && next === undefined) {
		return null;
	}

	return (
		<footer className={styles.footer}>
			<nav aria-label="Pages" className={styles.tiles}>
				<Tile
					entry={previous}
					label="Previous"
					icon={ArrowBackIcon}
					className={styles.tile}
				/>
				<Tile
					entry={next}
					label="Next"
					icon={ArrowForwardIcon}
					className={`${styles.tile} ${styles.next}`}
				/>
			</nav>
		</footer>
	);
};

/**
 * The chrome closing a docs page: tiles to the previous and next page in the
 * same sidebar group.
 *
 * @example
 * <DocsContainer context={context}>{children}<DocsFooter /></DocsContainer>
 */
export const DocsFooter = () => (
	<Suspense fallback={null}>
		<Footer />
	</Suspense>
);
