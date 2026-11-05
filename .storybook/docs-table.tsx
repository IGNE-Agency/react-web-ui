import type { ComponentProps, CSSProperties } from "react";
import styles from "./docs-table.module.scss";

const ALIGNMENTS: Readonly<
	Partial<Record<string, "start" | "center" | "end">>
> = {
	left: "start",
	start: "start",
	center: "center",
	right: "end",
	end: "end",
};

const alignmentOf = (
	align: string | undefined,
	style: CSSProperties | undefined,
) => ALIGNMENTS[style?.textAlign ?? align ?? ""];

const Table = (props: ComponentProps<"table">) => (
	<div className={`sb-unstyled ${styles.frame}`}>
		<div className={styles.scroller}>
			<table {...props} className={styles.table} />
		</div>
	</div>
);

const Th = ({
	align,
	style,
	...props
}: ComponentProps<"th">) => (
	<th
		scope="col"
		{...props}
		className={styles.head}
		style={{ ...style, textAlign: undefined }}
		data-align={alignmentOf(align, style)}
	/>
);

const Td = ({
	align,
	style,
	...props
}: ComponentProps<"td">) => (
	<td
		{...props}
		className={styles.cell}
		style={{ ...style, textAlign: undefined }}
		data-align={alignmentOf(align, style)}
	/>
);

/**
 * The MDX elements a markdown table renders through on docs pages: a card that
 * scrolls sideways, a tonal header band and a line between rows, with each
 * column's markdown alignment kept.
 *
 * @example
 * const mdxComponents = { ...docsTableComponents, pre: Pre };
 */
export const docsTableComponents = {
	table: Table,
	th: Th,
	td: Td,
};
