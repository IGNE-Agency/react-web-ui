import { type ReactNode, useRef } from "react";
import {
	isFileDropItem,
	type Key,
} from "react-aria-components";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import { formatBytes } from "../../lib/format-bytes.ts";
import {
	type FieldBlurHandler,
	type FieldProps,
	Field,
} from "../field/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import { useLocale } from "../locale-provider/index.ts";
import {
	AttachmentTile,
	useAttachmentPreview,
} from "../attachment-tile/index.ts";
import { Button, IconButton } from "../button/index.ts";
import { Spinner } from "../spinner/index.ts";
import { Tooltip } from "../tooltip/index.ts";
import { FileInput } from "./file-input.tsx";
import {
	isOversized,
	oversizedFiles,
} from "./file-size.ts";
import { isAccepted, wrongTypeFiles } from "./file-type.ts";

export type FileFieldProps = FieldProps &
	Readonly<{
		/** The staged files. A rejected file stays here until it is removed. */
		value: readonly File[];

		/** Called with the new value. */
		onValueChange: (files: readonly File[]) => void;

		/** Called when focus leaves the whole field, not when it moves within it. */
		onBlur?: FieldBlurHandler;

		/** Per-file size limit in bytes, set by the endpoint the files post to. */
		maxFileSize: number;

		/** Mime types, wildcards or extensions the field accepts. */
		accept?: readonly string[];

		/** Allows more than one file; a single-file field replaces its value. */
		multiple?: boolean;

		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Shows the value without letting it be changed. */
		readOnly?: boolean;

		/** Accessible name of the drop target, such as "Drop zone for attachments". */
		dropTargetLabel: string;

		/** Accessible name of the staged files, such as "Files for attachments". */
		filesLabel: string;

		/** Applied to the fieldset, so callers can place the field. */
		className?: string;
	}>;

type StagedFileProps = Readonly<{
	id: string;
	file: File;
	hint: string;
	invalid: boolean;
	removable: boolean;
}>;

const StagedFile = ({
	id,
	file,
	hint,
	invalid,
	removable,
}: StagedFileProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const preview = useAttachmentPreview(file);
	return (
		<FileInput.Item
			id={id}
			textValue={file.name}
			invalid={invalid}>
			<Tooltip content={hint}>
				<AttachmentTile.Preview
					name={file.name}
					src={preview.src}
					pending={preview.pending}>
					<AttachmentTile.Image />
					<AttachmentTile.Icon>
						{icons.file}
					</AttachmentTile.Icon>
					<AttachmentTile.Extension />
					<AttachmentTile.Skeleton />
					<AttachmentTile.Name />
				</AttachmentTile.Preview>
			</Tooltip>
			{removable ? (
				<AttachmentTile.Corner>
					<AttachmentTile.Remove
						render={
							<IconButton
								variant="tertiary"
								size="sm"
								label={copy.remove}>
								{icons.remove}
							</IconButton>
						}
					/>
				</AttachmentTile.Corner>
			) : null}
		</FileInput.Item>
	);
};

/**
 * A labelled drop target holding the staged files as removable tiles, with a
 * file picker button. Files over `maxFileSize` or of a type outside `accept`
 * stay in the target, marked invalid, and are reported through the field's
 * error text, in the `CopyProvider`'s `files` copy. Assembled from
 * `FileInput`'s parts.
 *
 * @example
 * <FileField
 * 	label="Attachments"
 * 	value={files}
 * 	onValueChange={setFiles}
 * 	maxFileSize={10 * 1024 ** 2}
 * 	multiple
 * 	dropTargetLabel="Drop zone for attachments"
 * 	filesLabel="Files for attachments"
 * />
 */
export const FileField = ({
	label,
	description,
	errors,
	requiredness,
	dirty,
	touched,
	pending,
	value,
	onValueChange,
	onBlur,
	maxFileSize,
	accept,
	multiple,
	disabled,
	readOnly,
	dropTargetLabel,
	filesLabel,
	className,
}: FileFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const locale = useLocale();
	const triggerRef = useRef<HTMLButtonElement>(null);

	const maxSize = formatBytes(maxFileSize, locale);
	const messages = [
		...normalizeFieldErrors(errors),
		...oversizedFiles(value, maxFileSize).map(file =>
			copy.files.tooLargeFile(file.name, maxSize),
		),
		...wrongTypeFiles(value, accept ?? []).map(file =>
			copy.files.wrongType(file.name),
		),
	];

	const add = (incoming: readonly File[]) => {
		if (incoming.length === 0) {
			return;
		}
		onValueChange(
			multiple === true
				? [...value, ...incoming]
				: incoming.slice(0, 1),
		);
	};

	const keyOf = (file: File, index: number) =>
		`${index}-${file.name}`;

	const remove = (keys: Set<Key>) => {
		const kept = value.filter(
			(file, index) => !keys.has(keyOf(file, index)),
		);
		onValueChange(kept);
		if (kept.length === 0) {
			triggerRef.current?.focus();
		}
	};

	const tiles =
		value.length === 0 ? null : (
			<FileInput.List
				label={filesLabel}
				onRemove={readOnly === true ? undefined : remove}>
				{value.map((file, index) => (
					<StagedFile
						key={keyOf(file, index)}
						id={keyOf(file, index)}
						file={file}
						hint={copy.files.fileHint(
							file.name,
							formatBytes(file.size, locale),
						)}
						invalid={
							isOversized(file, maxFileSize) ||
							!isAccepted(file, accept ?? [])
						}
						removable={readOnly !== true}
					/>
				))}
			</FileInput.List>
		);

	return (
		<FileInput.Root
			errors={messages}
			requiredness={requiredness}
			dirty={dirty}
			touched={touched}
			pending={pending}
			filled={value.length > 0}
			disabled={disabled}
			readOnly={readOnly}
			onBlur={onBlur}
			className={className}>
			<FileInput.Legend>
				{label} <Field.Requiredness />
			</FileInput.Legend>

			<FileInput.DropTarget
				aria-label={dropTargetLabel}
				onDrop={async event => {
					add(
						await Promise.all(
							event.items
								.filter(isFileDropItem)
								.map(item => item.getFile()),
						),
					);
				}}>
				{readOnly === true ? null : (
					<>
						<FileInput.Hint>
							<FileInput.HintIcon>
								{icons.drop}
							</FileInput.HintIcon>
							{copy.files.dropHint}
						</FileInput.Hint>
						<FileInput.Trigger
							render={
								<Button
									variant="secondary"
									size="sm"
									icon={icons.choose}>
									{copy.files.choose}
								</Button>
							}
							buttonRef={triggerRef}
							allowsMultiple={multiple}
							acceptedFileTypes={accept}
							onSelect={files =>
								add(files === null ? [] : [...files])
							}
						/>
					</>
				)}
				{tiles}
				<FileInput.Pending>
					<Spinner size={1} />
				</FileInput.Pending>
			</FileInput.DropTarget>

			<FileInput.Description>
				{description}
			</FileInput.Description>
			<FileInput.Error />
		</FileInput.Root>
	);
};
