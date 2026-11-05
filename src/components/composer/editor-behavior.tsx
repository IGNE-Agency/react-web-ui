import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createParagraphNode,
	$getRoot,
	COMMAND_PRIORITY_HIGH,
	KEY_ENTER_COMMAND,
} from "lexical";
import { useEffect, useEffectEvent } from "react";
import {
	type ComposerEditorHandle,
	useComposerContext,
} from "./composer.context.ts";

/** Wires the editor to its composer: editable while enabled, its handle, and Enter to send. */
export const EditorBehaviorPlugin = (): null => {
	const [editor] = useLexicalComposerContext();
	const {
		setEditorHandle,
		submit,
		hasSubmit,
		mentionMenuOpen,
		disabled,
	} = useComposerContext();
	const submitFromKeyboard = useEffectEvent(() => {
		void submit();
	});

	useEffect(() => {
		editor.setEditable(!disabled);
	}, [editor, disabled]);

	useEffect(() => {
		const handle: ComposerEditorHandle = {
			clear: () =>
				editor.update(() => {
					const root = $getRoot();
					root.clear();
					const paragraph = $createParagraphNode();
					root.append(paragraph);
					paragraph.select();
				}),
			focus: () => editor.focus(),
		};
		setEditorHandle(handle);
		return () => setEditorHandle(null);
	}, [editor, setEditorHandle]);

	useEffect(() => {
		if (!hasSubmit) {
			return undefined;
		}
		return editor.registerCommand(
			KEY_ENTER_COMMAND,
			event => {
				if (mentionMenuOpen.current) {
					return false;
				}
				if (event !== null && !event.shiftKey) {
					event.preventDefault();
					submitFromKeyboard();
					return true;
				}
				return false;
			},
			COMMAND_PRIORITY_HIGH,
		);
	}, [editor, hasSubmit, mentionMenuOpen]);

	return null;
};
