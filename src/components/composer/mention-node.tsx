import {
	$applyNodeReplacement,
	DecoratorNode,
	defineExtension,
	type ExtensionConfigBase,
	type LexicalExtension,
	type LexicalNode,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread,
} from "lexical";
import type { ReactNode } from "react";
import {
	MentionPill,
	serializeMention,
} from "./mention-text.tsx";

/** A `MentionNode` as stored in a serialized editor state. */
export type SerializedMentionNode = Spread<
	Readonly<{ mentionId: string; label: string }>,
	SerializedLexicalNode
>;

/** A mention in the composer's editor, rendered as a `MentionPill`; its text is `@[label](id)`. */
export class MentionNode extends DecoratorNode<ReactNode> {
	readonly mentionId: string;
	readonly label: string;

	static override getType(): string {
		return "mention";
	}

	static override clone(node: MentionNode): MentionNode {
		return new MentionNode(
			node.label,
			node.mentionId,
			node.getKey(),
		);
	}

	static override importJSON(
		serialized: SerializedMentionNode,
	): MentionNode {
		return $createMentionNode(
			serialized.label,
			serialized.mentionId,
		);
	}

	constructor(
		label: string,
		mentionId: string,
		key?: NodeKey,
	) {
		super(key);
		this.label = label;
		this.mentionId = mentionId;
	}

	override exportJSON(): SerializedMentionNode {
		return {
			...super.exportJSON(),
			type: "mention",
			version: 1,
			mentionId: this.mentionId,
			label: this.label,
		};
	}

	override createDOM(): HTMLElement {
		return document.createElement("span");
	}

	override updateDOM(): boolean {
		return false;
	}

	override getTextContent(): string {
		return serializeMention({
			label: this.label,
			id: this.mentionId,
		});
	}

	override isInline(): boolean {
		return true;
	}

	override isKeyboardSelectable(): boolean {
		return true;
	}

	override decorate(): ReactNode {
		return <MentionPill>{this.label}</MentionPill>;
	}
}

/**
 * Creates a `MentionNode` inside an editor update.
 *
 * @example
 * editor.update(() => $insertNodes([$createMentionNode("AnnDoe", "user-ann")]));
 */
export const $createMentionNode = (
	label: string,
	mentionId: string,
): MentionNode =>
	$applyNodeReplacement(new MentionNode(label, mentionId));

/**
 * Whether a node is a `MentionNode`.
 *
 * @example
 * $isMentionNode(selection.getNodes()[0]); // true
 */
export const $isMentionNode = (
	node: LexicalNode | null | undefined,
): node is MentionNode => node instanceof MentionNode;

/**
 * Registers `MentionNode` with an editor built from extensions.
 *
 * @example
 * defineExtension({ name: "editor", dependencies: [PlainTextExtension, MentionExtension] });
 */
export const MentionExtension: LexicalExtension<
	ExtensionConfigBase,
	"@igne-agency/react-web-ui/Mention",
	unknown,
	unknown
> = defineExtension({
	name: "@igne-agency/react-web-ui/Mention",
	nodes: [MentionNode],
});
