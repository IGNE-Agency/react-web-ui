import {
	DocsContext,
	TableOfContents,
} from "@storybook/addon-docs/blocks";
import { useContext } from "react";

/**
 * A design-guide page's table of contents, listing its sections and their
 * subsections. `rehypeGuide` places it after the page's opener.
 *
 * @example
 * const preview = { parameters: { docs: { components: { GuideContents } } } };
 */
export const GuideContents = () => {
	const { channel } = useContext(DocsContext);
	return (
		<TableOfContents
			channel={channel}
			className="guide-contents"
			title="Contents"
			headingSelector="h2, h3"
			ignoreSelector=".docs-story *, .skip-toc, #table-of-contents"
		/>
	);
};
