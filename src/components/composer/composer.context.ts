import {
	type Context,
	createContext,
	type RefObject,
} from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";

export type ComposerSendPayload = Readonly<{
	/** The plain-text body, with each mention flattened to its bare label. */
	text: string;
	/** The id of every mention in the message, in document order. */
	mentionIds: readonly string[];
	/** The files staged in the composer, in the order they were added. */
	attachments: readonly File[];
}>;

/** A staged file, plus the id its tile is keyed and removed by. */
export type ComposerAttachment = Readonly<{
	id: string;
	file: File;
}>;

/** What `canSubmit` decides on: the draft and the staged files. */
export type ComposerContent = Readonly<{
	value: string;
	files: readonly File[];
}>;

export type ComposerEditorHandle = Readonly<{
	clear: () => void;
	focus: () => void;
}>;

export type ComposerContextValue = Readonly<{
	value: string;
	initialValue: string;
	setValue: (value: string) => void;
	disabled: boolean;
	maxLength: number | undefined;
	maxFileSize: number | undefined;
	textLength: number;
	attachments: readonly ComposerAttachment[];
	addFiles: (files: readonly File[]) => void;
	removeAttachment: (id: string) => void;
	focusEditor: () => void;
	hasSubmit: boolean;
	canSend: boolean;
	isSubmitting: boolean;
	submit: () => Promise<void>;
	setEditorHandle: (
		handle: ComposerEditorHandle | null,
	) => void;
	mentionMenuOpen: RefObject<boolean>;
	setMentionMenuOpen: (open: boolean) => void;
	mentionsListboxId: string | null;
	registerMentions: (listboxId: string | null) => void;
	mentionsOpen: boolean;
	mentionsActiveOptionId: string | null;
	setMentionsActiveOption: (id: string | null) => void;
}>;

export const ComposerContext: Context<ComposerContextValue | null> =
	createContext<ComposerContextValue | null>(null);

/**
 * The state of the nearest `Composer.Root`; it throws outside one.
 *
 * @example
 * const { canSend, submit } = useComposerContext();
 */
export const useComposerContext =
	(): ComposerContextValue =>
		useRequiredContext(
			ComposerContext,
			"Composer components must be rendered within <Composer.Root>.",
		);
