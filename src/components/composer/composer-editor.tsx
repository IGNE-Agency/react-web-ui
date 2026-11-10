import { HistoryExtension } from "@lexical/history";
import { PlainTextExtension } from "@lexical/plain-text";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
	$createLineBreakNode,
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	defineExtension,
} from "lexical";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	createContext,
	type ReactElement,
	type ReactNode,
	useEffect,
	useId,
	useState,
} from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { useComposerContext } from "./composer.context.ts";
import style from "./composer-editor.module.scss";
import { EditorBehaviorPlugin } from "./editor-behavior.tsx";
import {
	$createMentionNode,
	MentionExtension,
} from "./mention-node.tsx";
import { parseMentionString } from "./mention-text.tsx";

const seedEditorState = (value: string) => (): void => {
	const root = $getRoot();
	if (root.getFirstChild() !== null) {
		return;
	}
	const paragraph = $createParagraphNode();
	for (const token of parseMentionString(value)) {
		if (token.type === "mention") {
			paragraph.append(
				$createMentionNode(token.label, token.id),
			);
			continue;
		}
		token.text.split("\n").forEach((line, index) => {
			if (index > 0) {
				paragraph.append($createLineBreakNode());
			}
			if (line !== "") {
				paragraph.append($createTextNode(line));
			}
		});
	}
	root.append(paragraph);
};

type PlaceholderSlot = Readonly<{
	id: string;
	register: (mounted: boolean) => void;
}>;

const PlaceholderContext =
	createContext<PlaceholderSlot | null>(null);

export type ComposerEditorProps = Readonly<{
	/** The editor's accessible name, such as "Comment". */
	label: string;
	/** Lines of height while short. @default 3 */
	minLines?: number;
	/** Lines of height before it scrolls. */
	maxLines?: number;
	/** Editor plugins, such as `Composer.Mentions`. */
	children?: ReactNode;
	className?: string;
}>;

/** The composer's plain-text editor, with mentions and Enter to send. */
export const ComposerEditor = ({
	label,
	minLines = 3,
	maxLines,
	children,
	className,
}: ComposerEditorProps): ReactNode => {
	const {
		initialValue,
		disabled,
		setValue,
		mentionsListboxId,
		mentionsOpen,
		mentionsActiveOptionId,
	} = useComposerContext();
	const placeholderId = useId();
	const [described, setDescribed] = useState(false);

	const [extension] = useState(() =>
		defineExtension({
			name: "@igne-agency/react-web-ui/Composer",
			namespace: "composer",
			dependencies: [
				PlainTextExtension,
				HistoryExtension,
				MentionExtension,
			],
			editable: !disabled,
			onError: error => {
				throw error;
			},
			$initialEditorState: seedEditorState(initialValue),
		}),
	);

	return (
		<LexicalExtensionComposer
			extension={extension}
			contentEditable={null}>
			<div
				className={clsx(style.editor, className)}
				style={{
					"--composer-min-lines": minLines,
					"--composer-max-lines": maxLines,
				}}>
				<ContentEditable
					className={style.content}
					aria-label={label}
					aria-describedby={
						described ? placeholderId : undefined
					}
					aria-disabled={disabled || undefined}
					{...(mentionsListboxId === null
						? {
								role: "textbox",
								"aria-autocomplete": "none",
							}
						: {
								role: "combobox",
								"aria-autocomplete": "list",
								"aria-expanded": mentionsOpen,
								"aria-activedescendant":
									mentionsActiveOptionId ?? undefined,
							})}
				/>
				<OnChangePlugin
					ignoreSelectionChange
					onChange={editorState =>
						editorState.read(() =>
							setValue($getRoot().getTextContent()),
						)
					}
				/>
				<EditorBehaviorPlugin />
				<PlaceholderContext
					value={{
						id: placeholderId,
						register: setDescribed,
					}}>
					{children}
				</PlaceholderContext>
			</div>
		</LexicalExtensionComposer>
	);
};

export type ComposerPlaceholderProps =
	useRender.ComponentProps<"div">;

/**
 * What the editor shows while the draft is empty, inside the `Editor`. It also
 * describes the editor.
 *
 * @example
 * <Composer.Editor label="Comment">
 * 	<Composer.Placeholder>Write a comment</Composer.Placeholder>
 * </Composer.Editor>
 */
export const ComposerPlaceholder = ({
	render,
	className,
	ref,
	...props
}: ComposerPlaceholderProps): ReactElement => {
	const { value } = useComposerContext();
	const { id, register } = useRequiredContext(
		PlaceholderContext,
		"Composer.Placeholder must be rendered within <Composer.Editor>.",
	);

	useEffect(() => {
		register(true);
		return () => register(false);
	}, [register]);

	return useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			"aria-hidden": true,
			...props,
			id,
			hidden: value !== "",
			className: clsx(style.placeholder, className),
		},
	});
};
