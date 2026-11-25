import {
	Heading,
	Markdown,
	PureArgsTable,
	useOf,
} from "@storybook/addon-docs/blocks";
import type { ReactNode } from "react";
import type { ArgTypesExtractor } from "storybook/internal/docs-tools";
import { z } from "zod";
import {
	docCommentOf,
	withDocComments,
} from "./doc-comment.ts";

const components = z.record(z.string(), z.unknown());

const tiers = z.object({
	primitive: components.optional(),
	connector: components,
});

const docsParameters = z.object({
	docs: z.object({
		extractArgTypes: z.custom<ArgTypesExtractor>(
			value => typeof value === "function",
		),
	}),
});

const docgenInfo = z.object({
	displayName: z.string().optional(),
	description: z.string(),
});

const docgenOf = (component: unknown) =>
	typeof component === "function" &&
	"__docgenInfo" in component
		? docgenInfo.safeParse(component["__docgenInfo"]).data
		: undefined;

const useTiers = () => {
	const meta = useOf("meta");
	if (meta.type !== "meta") {
		return undefined;
	}
	const { parameters, component } = meta.preparedMeta;
	const parsed = tiers.safeParse(parameters["tiers"]);
	const docs = docsParameters.safeParse(parameters);
	return parsed.success && docs.success
		? {
				...parsed.data,
				prefab: docgenOf(component)?.displayName,
				extractArgTypes: docs.data.docs.extractArgTypes,
			}
		: undefined;
};

const TierTable = ({
	title,
	component,
	extractArgTypes,
}: Readonly<{
	title: string;
	component: unknown;
	extractArgTypes: ArgTypesExtractor;
}>): ReactNode => {
	const rows = extractArgTypes(component);
	const description = docgenOf(component)?.description;
	return (
		<>
			<Heading>{title}</Heading>
			{description === undefined ||
			description === "" ? null : (
				<Markdown>
					{docCommentOf(description).markdown}
				</Markdown>
			)}
			{rows === null ? null : (
				<PureArgsTable rows={withDocComments(rows)} />
			)}
		</>
	);
};

/**
 * The title of the meta's props table on a field family's page, which names
 * the prefab tier. Renders nothing on a page without `parameters.tiers`.
 *
 * @example
 * <PrefabHeading />
 * <Controls />
 */
export const PrefabHeading = (): ReactNode => {
	const page = useTiers();
	return page?.prefab === undefined ? null : (
		<Heading>{`Prefab: ${page.prefab}`}</Heading>
	);
};

/**
 * A props table for each tier a field family's `parameters.tiers` names
 * besides the prefab: the primitive's parts, then the connector. Renders
 * nothing on a page without it.
 *
 * @example
 * parameters: { tiers: { primitive: { "TextInput.Root": TextInput.Root }, connector: { TSFTextField } } }
 */
export const TierTables = (): ReactNode => {
	const page = useTiers();
	if (page === undefined) {
		return null;
	}
	const tables = [
		...Object.entries(page.primitive ?? {}).map(
			([name, component]) => ({
				title: `Primitive: ${name}`,
				component,
			}),
		),
		...Object.entries(page.connector).map(
			([name, component]) => ({
				title: `Connector: ${name}`,
				component,
			}),
		),
	];
	return tables.map(({ title, component }) => (
		<TierTable
			key={title}
			title={title}
			component={component}
			extractArgTypes={page.extractArgTypes}
		/>
	));
};
