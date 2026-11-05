import SendIcon from "@material-design-icons/svg/outlined/arrow_forward.svg?react";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { lengthTone } from "../../lib/text-length.ts";
import { Button } from "../button/index.ts";
import {
	fieldStateAttributes,
	useFieldFocus,
} from "../field/index.ts";
import {
	type ComposerAttachment,
	type ComposerContent,
	ComposerContext,
	type ComposerEditorHandle,
	type ComposerSendPayload,
	useComposerContext,
} from "./composer.context.ts";
import {
	type ComposerHandle,
	createComposerHandle,
} from "./composer.handle.ts";
import style from "./composer.module.scss";
import {
	ComposerAttachButton,
	ComposerAttachments,
	ComposerAttachmentsError,
} from "./composer-attachments.tsx";
import { ComposerEditor } from "./composer-editor.tsx";
import { ComposerMentions } from "./composer-mentions.tsx";
import {
	parseMentionString,
	toPlainText,
} from "./mention-text.tsx";

export type ComposerRootProps = Readonly<{
	children: ReactNode;
	/** The starting draft, with mentions as `@[label](id)`. */
	defaultValue?: string;
	disabled?: boolean;
	/** The most characters a message holds, mentions counted by their label. */
	maxLength?: number;
	/** The per-file size limit in bytes; a larger file blocks sending until it is removed. */
	maxFileSize?: number;
	/** Whether the content may be sent. @default text or a file */
	canSubmit?: (content: ComposerContent) => boolean;
	/** Sends the message; the composer stays busy until it settles. */
	onSend?: (
		payload: ComposerSendPayload,
	) => void | Promise<void>;
	className?: string;
	/** Controls the composer from outside, from `Composer.createHandle()`. */
	handle?: ComposerHandle;
}>;

const defaultCanSubmit = ({
	value,
	files,
}: ComposerContent): boolean =>
	value.trim() !== "" || files.length > 0;

const INTERACTIVE =
	"button, a, input, textarea, [contenteditable], [tabindex]";

/**
 * The message composer: holds the draft, its attachments and its mentions,
 * and sends them through `onSend` once `canSubmit` allows it, within
 * `maxLength` and `maxFileSize`.
 */
const Root = ({
	children,
	defaultValue = "",
	disabled = false,
	maxLength,
	maxFileSize,
	canSubmit = defaultCanSubmit,
	onSend,
	className,
	handle,
}: ComposerRootProps): ReactNode => {
	const [value, setValue] = useState(defaultValue);
	const [attachments, setAttachments] = useState<
		readonly ComposerAttachment[]
	>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [mentionsListboxId, setMentionsListboxId] =
		useState<string | null>(null);
	const [mentionsOpen, setMentionsOpen] = useState(false);
	const [
		mentionsActiveOptionId,
		setMentionsActiveOptionId,
	] = useState<string | null>(null);
	const fieldFocus = useFieldFocus();
	const editorHandle = useRef<ComposerEditorHandle | null>(
		null,
	);
	const nextAttachmentId = useRef(0);
	const mentionMenuOpen = useRef(false);

	const files = attachments.map(
		attachment => attachment.file,
	);
	const tokens = parseMentionString(value);
	const mentionIds = tokens.flatMap(token =>
		token.type === "mention" ? [token.id] : [],
	);
	const textLength = tokens.reduce(
		(total, token) =>
			total +
			(token.type === "text"
				? token.text.length
				: token.label.length),
		0,
	);
	const hasOversizedFile =
		maxFileSize !== undefined &&
		files.some(file => file.size > maxFileSize);
	const canSend =
		!disabled &&
		!isSubmitting &&
		!hasOversizedFile &&
		canSubmit({ value, files });

	const clear = (): void => {
		editorHandle.current?.clear();
		setValue("");
		setAttachments([]);
	};

	const focus = (): void => editorHandle.current?.focus();

	useEffect(
		() => handle?.connect({ clear, focus }),
		[handle, clear, focus],
	);

	const submit = async (): Promise<void> => {
		if (onSend === undefined || !canSend) {
			return;
		}
		setIsSubmitting(true);
		try {
			await onSend({
				text: toPlainText(value),
				mentionIds,
				attachments: files,
			});
		} catch (error) {
			setIsSubmitting(false);
			throw error;
		}
		setIsSubmitting(false);
	};

	return (
		<ComposerContext
			value={{
				value,
				initialValue: defaultValue,
				setValue,
				disabled,
				maxLength,
				maxFileSize,
				textLength,
				attachments,
				addFiles: incoming => {
					const staged = incoming.map(file => {
						const id = `attachment-${nextAttachmentId.current}`;
						nextAttachmentId.current += 1;
						return { id, file };
					});
					setAttachments(previous => [
						...previous,
						...staged,
					]);
				},
				removeAttachment: id =>
					setAttachments(previous =>
						previous.filter(
							attachment => attachment.id !== id,
						),
					),
				focusEditor: focus,
				hasSubmit: onSend !== undefined,
				canSend,
				isSubmitting,
				submit,
				setEditorHandle: next => {
					editorHandle.current = next;
				},
				mentionMenuOpen,
				mentionsListboxId,
				registerMentions: setMentionsListboxId,
				mentionsOpen,
				mentionsActiveOptionId,
				setMentionsActiveOption: setMentionsActiveOptionId,
				setMentionMenuOpen: open => {
					mentionMenuOpen.current = open;
					setMentionsOpen(open);
				},
			}}>
			<div
				role="group"
				aria-disabled={disabled || undefined}
				className={clsx(style.composer, className)}
				{...fieldFocus.props}
				{...fieldStateAttributes({
					disabled,
					focused: fieldFocus.focused,
					focusVisible: fieldFocus.focusVisible,
				})}
				onMouseDown={event => {
					if (
						!(event.target instanceof Element) ||
						!event.currentTarget.contains(event.target) ||
						event.target.closest(INTERACTIVE) !== null
					) {
						return;
					}
					event.preventDefault();
					editorHandle.current?.focus();
				}}>
				{children}
			</div>
		</ComposerContext>
	);
};

export type ComposerToolbarProps = Readonly<{
	children: ReactNode;
	className?: string;
}>;

/** The row under the editor holding the counter and the buttons. */
const Toolbar = ({
	children,
	className,
}: ComposerToolbarProps): ReactNode => (
	<div className={clsx(style.toolbar, className)}>
		{children}
	</div>
);

/** The `length/maxLength` counter, warning near the limit. Renders nothing without a `maxLength`. */
const MaxLength = (): ReactNode => {
	const { maxLength, textLength } = useComposerContext();
	if (maxLength === undefined) {
		return null;
	}
	return (
		<span
			className={style.counter}
			data-tone={lengthTone(textLength, maxLength)}>
			{textLength}/{maxLength}
		</span>
	);
};

export type ComposerSendButtonProps = Readonly<{
	/** The button's accessible name and tooltip, such as "Send". */
	label: string;
	/** @default "primary" */
	variant?: "primary" | "secondary";
}> &
	Omit<ComponentProps<"button">, "children">;

/** The icon button that sends the message; disabled while it can't be sent. */
const SendButton = ({
	label,
	variant = "primary",
	...props
}: ComposerSendButtonProps): ReactNode => {
	const { submit, canSend } = useComposerContext();

	return (
		<Button
			variant={variant}
			size="md"
			iconOnly
			icon={SendIcon}
			label={label}
			disabled={!canSend}
			onClick={() => {
				void submit();
			}}
			{...props}
		/>
	);
};

type ComposerNamespace = Readonly<{
	Root: typeof Root;
	Editor: typeof ComposerEditor;
	Mentions: typeof ComposerMentions;
	Toolbar: typeof Toolbar;
	Attachments: typeof ComposerAttachments;
	AttachmentsError: typeof ComposerAttachmentsError;
	AttachButton: typeof ComposerAttachButton;
	MaxLength: typeof MaxLength;
	SendButton: typeof SendButton;
	createHandle: typeof createComposerHandle;
}>;

/**
 * A message composer: a plain-text editor with `@` mentions, staged
 * attachments, a length counter, and Enter to send (Shift+Enter for a new
 * line).
 *
 * @example
 * <Composer.Root onSend={send} maxLength={2000}>
 * 	<Composer.Attachments label="Attachments" removeLabel="Remove" fileHint={(name, size) => `${name} (${size})`} />
 * 	<Composer.Editor label="Comment">
 * 		<Composer.Mentions label="People to mention" sources={[people]} />
 * 	</Composer.Editor>
 * 	<Composer.Toolbar>
 * 		<Composer.MaxLength />
 * 		<Composer.AttachButton label="Add attachment" />
 * 		<Composer.SendButton label="Send" />
 * 	</Composer.Toolbar>
 * </Composer.Root>
 */
export const Composer: ComposerNamespace = {
	Root,
	Editor: ComposerEditor,
	Mentions: ComposerMentions,
	Toolbar,
	Attachments: ComposerAttachments,
	AttachmentsError: ComposerAttachmentsError,
	AttachButton: ComposerAttachButton,
	MaxLength,
	SendButton,
	createHandle: createComposerHandle,
};
