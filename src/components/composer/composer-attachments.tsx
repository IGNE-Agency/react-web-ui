import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	FileTrigger as AriaFileTrigger,
	type Key,
	TagGroup as AriaTagGroup,
	TagList as AriaTagList,
} from "react-aria-components";
import { formatBytes } from "../../lib/format-bytes.ts";
import { IconButton } from "../button/index.ts";
import { useLocale } from "../locale-provider/index.ts";
import {
	type ComposerAttachment,
	useComposerContext,
} from "./composer.context.ts";
import style from "./composer.module.scss";

const isOversized = (
	file: File,
	maxFileSize: number | undefined,
): boolean =>
	maxFileSize !== undefined && file.size > maxFileSize;

export type ComposerAttachButtonProps = Readonly<{
	/** The button's accessible name and tooltip, such as "Add attachment". */
	label: string;
	/** The MIME types and extensions the file picker offers. */
	accept?: readonly string[];
	/** The attach glyph. */
	children: ReactNode;
	className?: string;
}>;

/** An icon button, its children the glyph, that opens the file picker and stages what is picked. */
export const ComposerAttachButton = ({
	label,
	accept,
	children,
	className,
}: ComposerAttachButtonProps): ReactNode => {
	const { addFiles, disabled } = useComposerContext();

	return (
		<AriaFileTrigger
			allowsMultiple
			acceptedFileTypes={accept}
			onSelect={files => {
				if (files !== null) {
					addFiles(Array.from(files));
				}
			}}>
			<IconButton
				className={className}
				variant="tertiary"
				size="md"
				disabled={disabled}
				label={label}
				render={<AriaButton isDisabled={disabled} />}>
				{children}
			</IconButton>
		</AriaFileTrigger>
	);
};

/** What a staged file's tile renders from, besides the file. */
export type ComposerAttachmentState = Readonly<{
	/** Whether the file is over `maxFileSize`, and blocks sending. */
	oversized: boolean;
	/** The file's size, formatted for the locale, such as "12 kB". */
	size: string;
	/** Whether the composer is disabled. */
	disabled: boolean;
}>;

export type ComposerAttachmentsProps = Readonly<{
	/** The tile list's accessible name, such as "Attachments". */
	label: string;
	/** The tile for one staged file, such as an `AttachmentTile` with the attachment's `id`. */
	children: (
		attachment: ComposerAttachment,
		state: ComposerAttachmentState,
	) => ReactNode;
	className?: string;
}>;

/**
 * The staged files, each as the tile `children` returns. Removing the last one
 * returns focus to the editor. Renders nothing while no file is staged.
 *
 * @example
 * <Composer.Attachments label="Attachments">
 * 	{(attachment, { oversized, size, disabled }) => (
 * 		<AttachmentTile
 * 			id={attachment.id}
 * 			file={attachment.file}
 * 			hint={`${attachment.file.name} (${size})`}
 * 			removeLabel="Remove"
 * 			removeIcon={<CloseIcon />}
 * 			invalid={oversized}
 * 			disabled={disabled}
 * 		/>
 * 	)}
 * </Composer.Attachments>
 */
export const ComposerAttachments = ({
	label,
	children,
	className,
}: ComposerAttachmentsProps): ReactNode => {
	const locale = useLocale();
	const {
		attachments,
		removeAttachment,
		focusEditor,
		disabled,
		maxFileSize,
	} = useComposerContext();

	if (attachments.length === 0) {
		return null;
	}

	const remove = (keys: Set<Key>): void => {
		const removed = attachments.filter(attachment =>
			keys.has(attachment.id),
		);
		if (removed.length === attachments.length) {
			focusEditor();
		}
		for (const attachment of removed) {
			removeAttachment(attachment.id);
		}
	};

	return (
		<AriaTagGroup aria-label={label} onRemove={remove}>
			<AriaTagList
				items={attachments}
				className={clsx(style.attachments, className)}>
				{attachment =>
					children(attachment, {
						oversized: isOversized(
							attachment.file,
							maxFileSize,
						),
						size: formatBytes(attachment.file.size, locale),
						disabled,
					})
				}
			</AriaTagList>
		</AriaTagGroup>
	);
};

export type ComposerAttachmentsErrorProps = Readonly<{
	/** The alert, from the formatted `maxFileSize`, such as "Files over 5 MB must be removed before sending." */
	tooLargeError: (maxSize: string) => string;
}>;

/**
 * An alert while any staged file is over `maxFileSize`. Renders nothing while
 * every file fits.
 */
export const ComposerAttachmentsError = ({
	tooLargeError,
}: ComposerAttachmentsErrorProps): ReactNode => {
	const locale = useLocale();
	const { attachments, maxFileSize } = useComposerContext();

	if (
		maxFileSize === undefined ||
		!attachments.some(attachment =>
			isOversized(attachment.file, maxFileSize),
		)
	) {
		return null;
	}

	return (
		<p role="alert" className={style.attachmentsError}>
			{tooLargeError(formatBytes(maxFileSize, locale))}
		</p>
	);
};
