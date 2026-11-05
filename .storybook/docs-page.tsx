import {
	Controls,
	Description,
	Markdown,
	Primary,
	Stories,
	Subtitle,
	Title,
	useOf,
} from "@storybook/addon-docs/blocks";
import type { ReactNode } from "react";
import { PreviewLink } from "./docs-links/preview-link.tsx";
import {
	type DesignSystemLink,
	designSystemLinks,
	targetOf,
} from "./docs-links/target.ts";
import { labelOf } from "./label.ts";

const sectionLink = (link: DesignSystemLink) => {
	const { id, anchor } = targetOf(link);
	const name =
		"page" in link
			? (link.page.split("/").at(-1) ?? link.page)
			: labelOf(link.component.split("/").at(-1) ?? "");
	return link.section === undefined || anchor === undefined
		? `[${name}](?path=/docs/${id})`
		: `[${name} → ${link.section}](?path=/docs/${id}#${anchor})`;
};

const DesignSystemLinks = () => {
	const meta = useOf("meta");
	const sections = designSystemLinks.safeParse(
		meta.type === "meta"
			? meta.preparedMeta.parameters["designSystem"]
			: undefined,
	);

	if (!sections.success || sections.data.length === 0) {
		return null;
	}

	return (
		<Markdown options={{ overrides: { a: PreviewLink } }}>
			{`Follows the design system: ${sections.data.map(sectionLink).join(", ")}.`}
		</Markdown>
	);
};

const ComponentTitle = () => {
	const meta = useOf("meta");
	const title =
		meta.type === "meta"
			? meta.preparedMeta.title.split("/").at(-1)
			: undefined;

	return title === undefined ? (
		<Title />
	) : (
		<Title>{labelOf(title)}</Title>
	);
};

/**
 * A component's docs page: the default autodocs blocks with the stories laid out
 * in a grid, the links its meta names in `parameters.designSystem`, and the
 * component's own design rules when an attached MDX page passes them in.
 *
 * @example
 * <Meta of={ButtonStories} />
 *
 * <DocsPage>
 *
 * ## Rules
 *
 * </DocsPage>
 */
export const DocsPage = ({
	children,
}: Readonly<{ children?: ReactNode }>) => (
	<>
		<ComponentTitle />
		<Subtitle />
		<Description />
		<DesignSystemLinks />
		<Primary />
		<Controls />
		{children}
		<div className="story-grid">
			<Stories />
		</div>
	</>
);
