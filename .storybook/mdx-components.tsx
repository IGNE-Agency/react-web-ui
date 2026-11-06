import type { ComponentProps, ReactNode } from "react";
import { PreviewLink } from "./docs-links/preview-link.tsx";
import { Tiles } from "../docs/brand/tiles.tsx";
import { docsTableComponents } from "./docs-table.tsx";
import { GuideContents } from "./guide/guide-contents.tsx";
import { GuideUnderline } from "./guide/guide-hero.tsx";
import styles from "./mdx-components.module.scss";

const Pre = ({
	className,
	...props
}: ComponentProps<"pre">) => (
	<pre
		className={`${className ?? ""} ${styles.block}`}
		{...props}
	/>
);

const Code = ({
	children,
	...props
}: ComponentProps<"code">) =>
	typeof children === "string" ? (
		<code className={styles.inline}>{children}</code>
	) : (
		<code {...props}>{children}</code>
	);

const Pull = ({
	children,
}: Readonly<{ children?: ReactNode }>) => <>{children}</>;

/**
 * The MDX elements docs pages render code and markdown tables with: Shiki's
 * highlighted blocks as they come, inline code in the docs' own style, and
 * tables as the docs' own lightweight table, links to other docs pages with a
 * preview card, plus the design guide's table of
 * contents, its hero's tiles and title underline, and a `Pull` that stays plain
 * text outside a guide page.
 *
 * @example
 * const preview = { parameters: { docs: { components: mdxComponents } } };
 */
export const mdxComponents = {
	...docsTableComponents,
	GuideContents,
	GuideTiles: Tiles,
	GuideUnderline,
	Pull,
	a: PreviewLink,
	pre: Pre,
	code: Code,
};
