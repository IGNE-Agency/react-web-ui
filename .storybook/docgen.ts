import { join } from "node:path";
import {
	type babelTypes,
	builtinHandlers,
	ERROR_CODES,
	type Handler,
	makeFsImporter,
	type NodePath,
	parse,
	type ResolverFunction,
	utils,
} from "react-docgen";
import type { Plugin } from "vite";

type Member = NodePath<babelTypes.TSPropertySignature>;

type ComponentPath = Parameters<Handler>[1];

const isComponentName = (
	name: string | undefined,
): boolean => name !== undefined && /^[A-Z]/.test(name);

/** Every component the module declares at its top level, exported or not: a capitalised function, or a capitalised `const` holding one. */
const topLevelComponents: ResolverFunction = file =>
	file.path
		.get("body")
		.flatMap<ComponentPath>(statement => {
			const declaration =
				statement.isExportNamedDeclaration()
					? statement.get("declaration")
					: statement;
			if (declaration.isFunctionDeclaration()) {
				return isComponentName(declaration.node.id?.name)
					? [declaration]
					: [];
			}
			if (!declaration.isVariableDeclaration()) {
				return [];
			}
			return declaration
				.get("declarations")
				.flatMap<ComponentPath>(declarator => {
					const id = declarator.get("id");
					const init = declarator.get("init");
					return id.isIdentifier() &&
						isComponentName(id.node.name) &&
						(init.isArrowFunctionExpression() ||
							init.isFunctionExpression())
						? [init]
						: [];
				});
		});

/** The local name a component is declared under. */
const localNameOf = (
	definition: ComponentPath,
): string | undefined => {
	if (definition.isFunctionDeclaration()) {
		return definition.node.id?.name;
	}
	const declarator = definition.parentPath;
	return declarator.isVariableDeclarator() &&
		declarator.node.id.type === "Identifier"
		? declarator.node.id.name
		: undefined;
};

/** The local names an exported namespace's value hangs together: the parts of an object, and the prefab `Object.assign` puts them on. */
const partsOf = (path: NodePath): readonly string[] => {
	if (path.isTSSatisfiesExpression()) {
		return partsOf(path.get("expression"));
	}
	if (path.isTSAsExpression()) {
		return partsOf(path.get("expression"));
	}
	if (path.isIdentifier()) {
		return [path.node.name];
	}
	if (path.isObjectExpression()) {
		return path
			.get("properties")
			.flatMap(property =>
				property.isObjectProperty()
					? partsOf(property.get("value"))
					: [],
			);
	}
	if (path.isCallExpression()) {
		const callee = path.get("callee");
		return callee.isMemberExpression() &&
			callee
				.get("object")
				.isIdentifier({ name: "Object" }) &&
			callee
				.get("property")
				.isIdentifier({ name: "assign" })
			? path.get("arguments").flatMap(partsOf)
			: [];
	}
	return [];
};

/** The exported namespace a component is a part or the prefab of, with the namespace's own doc comment. */
const namespaceOf = (
	definition: ComponentPath,
	name: string,
):
	| Readonly<{ name: string; description: string }>
	| undefined =>
	definition.hub.file.path
		.get("body")
		.flatMap(statement => {
			if (!statement.isExportNamedDeclaration()) {
				return [];
			}
			const declaration = statement.get("declaration");
			if (!declaration.isVariableDeclaration()) {
				return [];
			}
			return declaration
				.get("declarations")
				.flatMap(declarator => {
					const id = declarator.get("id");
					const init = declarator.get("init");
					return id.isIdentifier() &&
						id.node.name !== name &&
						init.hasNode() &&
						partsOf(init).includes(name)
						? [
								{
									name: id.node.name,
									description:
										utils.docblock.getDocblock(statement) ??
										"",
								},
							]
						: [];
				});
		})
		.at(0);

/** Records the component's local name and the namespace it belongs to. */
const nameHandler: Handler = (
	documentation,
	definition,
) => {
	const name = localNameOf(definition);
	if (name === undefined) {
		return;
	}
	documentation.set("actualName", name);
	const namespace = namespaceOf(definition, name);
	if (namespace !== undefined) {
		documentation.set("namespace", namespace);
	}
};

const typeArgumentsOf = (
	path: NodePath<babelTypes.TSTypeReference>,
): readonly NodePath<babelTypes.TSType>[] => {
	const parameters = path.get("typeParameters");
	return parameters.hasNode()
		? parameters.get("params")
		: [];
};

const literalKeysOf = (
	path: NodePath | undefined,
): readonly string[] => {
	if (path?.isTSLiteralType() === true) {
		const { literal } = path.node;
		return literal.type === "StringLiteral"
			? [literal.value]
			: [];
	}
	return path?.isTSUnionType() === true
		? path.get("types").flatMap(literalKeysOf)
		: [];
};

type Prop = Readonly<{
	name: string;
	member: Member;
	required: boolean;
}>;

const propsOfMembers = (
	members: readonly NodePath[],
): readonly Prop[] =>
	members.flatMap(member => {
		const name = member.isTSPropertySignature()
			? utils.getPropertyName(member)
			: null;
		return name === null || !member.isTSPropertySignature()
			? []
			: [
					{
						name,
						member,
						required: member.node.optional !== true,
					},
				];
	});

/** A union's props: each one any branch declares, required only where every branch requires it. */
const propsOfUnion = (
	branches: readonly (readonly Prop[])[],
): readonly Prop[] =>
	[
		...new Set(branches.flat().map(prop => prop.name)),
	].flatMap(name => {
		const first = branches
			.flat()
			.find(prop => prop.name === name);
		return first === undefined
			? []
			: [
					{
						...first,
						required: branches.every(branch =>
							branch.some(
								prop => prop.name === name && prop.required,
							),
						),
					},
				];
	});

/**
 * The props a props type declares, followed through type aliases, interfaces,
 * intersections, unions and `Readonly`, `Omit` and `Pick`, in this module and
 * the modules it imports relatively. Props a primitive declares, such as
 * `ComponentProps<typeof BaseDialog.Popup>`, are left out.
 */
const membersOf = (
	path: NodePath | undefined,
	seen: ReadonlySet<unknown> = new Set(),
): readonly Prop[] => {
	if (path === undefined || seen.has(path.node)) {
		return [];
	}
	const next = new Set([...seen, path.node]);
	if (path.isTSParenthesizedType()) {
		return membersOf(path.get("typeAnnotation"), next);
	}
	if (path.isTSTypeLiteral()) {
		return propsOfMembers(path.get("members"));
	}
	if (path.isTSIntersectionType()) {
		return path
			.get("types")
			.flatMap(type => membersOf(type, next));
	}
	if (path.isTSUnionType()) {
		return propsOfUnion(
			path.get("types").map(type => membersOf(type, next)),
		);
	}
	if (path.isTSTypeAliasDeclaration()) {
		return membersOf(path.get("typeAnnotation"), next);
	}
	if (path.isTSInterfaceDeclaration()) {
		const heritage = path.get("extends");
		return [
			...(Array.isArray(heritage) ? heritage : []).flatMap(
				clause =>
					membersOf(
						utils.resolveToValue(clause.get("expression")),
						next,
					),
			),
			...propsOfMembers(path.get("body").get("body")),
		];
	}
	if (!path.isTSTypeReference()) {
		return [];
	}
	const name = path.get("typeName");
	if (!name.isIdentifier()) {
		return [];
	}
	const [inner, keys] = typeArgumentsOf(path);
	switch (name.node.name) {
		case "Readonly":
			return membersOf(inner, next);
		case "Omit":
			return membersOf(inner, next).filter(
				prop => !literalKeysOf(keys).includes(prop.name),
			);
		case "Pick":
			return membersOf(inner, next).filter(prop =>
				literalKeysOf(keys).includes(prop.name),
			);
		default: {
			const resolved = utils.resolveToValue(name);
			return resolved.node === name.node
				? []
				: membersOf(resolved, next);
		}
	}
};

/** Documents each prop a component's props type declares, with its type, whether it is required, and its doc comment. */
const typeHandler: Handler = (
	documentation,
	definition,
) => {
	const props = utils
		.getTypeFromReactComponent(definition)
		.flatMap(type => membersOf(type));
	const firsts = props.filter(
		(prop, index) =>
			props.findIndex(other => other.name === prop.name) ===
			index,
	);
	for (const { name, member, required } of firsts) {
		const annotation = member.get("typeAnnotation");
		if (annotation.hasNode()) {
			const descriptor =
				documentation.getPropDescriptor(name);
			descriptor.required = required;
			descriptor.tsType = utils.getTSType(annotation, null);
			utils.setPropDescription(documentation, member);
		}
	}
};

const handlers: readonly Handler[] = [
	...Object.values(builtinHandlers).filter(
		handler => handler !== builtinHandlers.codeTypeHandler,
	),
	typeHandler,
	nameHandler,
];

/** Resolves the relative imports a props type follows, and leaves every package's types undocumented. */
const importer = makeFsImporter((filename, basedir) => {
	if (!filename.startsWith(".")) {
		throw Object.assign(
			new Error(`${filename} is not documented`),
			{ code: "MODULE_NOT_FOUND" },
		);
	}
	return join(basedir, filename);
});

const documented = /[\\/]src[\\/].*(?<!\.stories)\.tsx?$/;

const annotated = (
	documentation: ReturnType<typeof parse>[number],
): readonly string[] => {
	if (
		!("actualName" in documentation) ||
		typeof documentation.actualName !== "string"
	) {
		return [];
	}
	const { actualName, ...info } = documentation;
	return [
		`;${actualName}.__docgenInfo=${JSON.stringify(info)};`,
	];
};

/**
 * The kit's docs extraction for Storybook, in place of its react-docgen plugin.
 * Every component a module under `src/` declares at its top level gets a
 * `__docgenInfo`, exported or not, so a compound's local parts are documented
 * as `X.Root` reaches them. Props are read from `Readonly<{…}>`, intersections,
 * `Omit` and `Pick` with each prop's doc comment, and a part or prefab of an
 * exported namespace carries that namespace's name and doc comment as
 * `namespace`.
 *
 * @example
 * viteFinal: config => mergeConfig(config, { plugins: [kitDocgen()] })
 */
export const kitDocgen = (): Plugin => ({
	name: "kit:docgen",
	enforce: "pre",
	transform(code, id) {
		if (
			!documented.test(id) ||
			id.includes("node_modules")
		) {
			return undefined;
		}
		try {
			const results = parse(code, {
				filename: id,
				resolver: topLevelComponents,
				handlers: [...handlers],
				importer,
			});
			const appended = results.flatMap(annotated);
			return appended.length === 0
				? undefined
				: {
						code: [code, ...appended].join("\n"),
						map: null,
					};
		} catch (error) {
			if (
				error instanceof Error &&
				"code" in error &&
				error.code === ERROR_CODES.MISSING_DEFINITION
			) {
				return undefined;
			}
			throw error;
		}
	},
});
