import { DocsContext } from "@storybook/addon-docs/blocks";
import {
	type ReactNode,
	Suspense,
	use,
	useContext,
} from "react";
import { NAVIGATE_URL } from "storybook/internal/core-events";
import { docsEntries } from "./docs-index.ts";
import { previewOf } from "./page-previews.ts";
import {
	isPlainClick,
	storybookHrefOf,
	targetOf,
} from "./target.ts";
import styles from "./page-tile.module.scss";

const Art = ({ id }: Readonly<{ id: string }>) => {
	const entry = use(docsEntries()).find(
		page => page.id === id,
	);
	const drawing =
		entry === undefined
			? undefined
			: previewOf(entry)?.drawing;
	return drawing === undefined ? null : (
		<drawing.Component />
	);
};

/**
 * A big link to a design-system page: its opening drawing, its name or a
 * `title`, and a line saying what the reader finds there.
 *
 * @example
 * <PageTile page="Foundation/Colour" description="Every colour role, with its hex to copy." />
 */
export const PageTile = ({
	page,
	title,
	description,
}: Readonly<{
	page: string;
	title?: string;
	description: string;
}>) => {
	const { channel } = useContext(DocsContext);
	const { id } = targetOf({ page });
	const href = `?path=/docs/${id}`;

	return (
		<a
			href={storybookHrefOf(href)}
			className={styles.tile}
			onClick={event => {
				if (isPlainClick(event)) {
					event.preventDefault();
					channel.emit(NAVIGATE_URL, href);
				}
			}}>
			<span className={styles.art} aria-hidden>
				<Suspense fallback={null}>
					<Art id={id} />
				</Suspense>
			</span>
			<span className={styles.text}>
				<span className={styles.title}>
					{title ?? page.split("/").at(-1)}
				</span>
				<span className={styles.description}>
					{description}
				</span>
			</span>
		</a>
	);
};

/**
 * A stack of `PageTile`s.
 *
 * @example
 * <PageTiles>
 * 	<PageTile page="Foundation/Colour" description="Every colour role." />
 * </PageTiles>
 */
export const PageTiles = ({
	children,
}: Readonly<{ children: ReactNode }>) => (
	<div className={`sb-unstyled ${styles.tiles}`}>
		{children}
	</div>
);
