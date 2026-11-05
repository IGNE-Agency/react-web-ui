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
	useFieldState,
} from "../field/index.ts";
import { useLocale } from "../locale-provider/index.ts";
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

		onValueChange: (files: readonly File[]) => void;

		/** Called when focus leaves the whole field, not when it moves within it. */
		onBlur?: FieldBlurHandler;

		/** Per-file size limit in bytes, set by the endpoint the files post to. */
		maxFileSize: number;

		/** Mime types, wildcards or extensions the field accepts. */
		accept?: readonly string[];

		/** Allows more than one file; a single-file field replaces its value. */
		multiple?: boolean;

		disabled?: boolean;
		readOnly?: boolean;

		/** Accessible name of the drop target, such as "Drop zone for attachments". */
		dropTargetLabel: string;

		/** The prompt inside the drop target, such as "Drag files here". */
		dropHint: string;

		/** The picker button's text, such as "Choose files". */
		chooseLabel: string;

		/** Accessible name of the staged files, such as "Files for attachments". */
		filesLabel: string;

		/** Accessible name of a tile's remove button, such as "Remove". */
		removeLabel: string;

		/** A tile's tooltip, such as `` (name, size) => `${name} (${size})` ``. */
		fileHint: (name: string, size: string) => string;

		/** The error for a file over `maxFileSize`, given its name and the limit. */
		tooLargeError: (
			name: string,
			maxSize: string,
		) => string;

		/** The error for a file outside `accept`, given its name. */
		wrongTypeError: (name: string) => string;

		className?: string;
	}>;

/**
 * A labelled drop target holding the staged files as removable tiles, with a
 * file picker button. Files over `maxFileSize` or of a type outside `accept`
 * stay in the target, marked invalid, and are reported through the field's
 * error text.
 *
 * @example
 * <FileField
 * 	label="Attachments"
 * 	optionalLabel="optional"
 * 	value={files}
 * 	onValueChange={setFiles}
 * 	maxFileSize={10 * 1024 ** 2}
 * 	multiple
 * 	dropTargetLabel="Drop zone for attachments"
 * 	dropHint="Drag files here"
 * 	chooseLabel="Choose files"
 * 	filesLabel="Files for attachments"
 * 	removeLabel="Remove"
 * 	fileHint={(name, size) => `${name} (${size})`}
 * 	tooLargeError={(name, maxSize) => `${name} is larger than ${maxSize}.`}
 * 	wrongTypeError={name => `${name} is not an accepted file type.`}
 * />
 */
export const FileField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
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
	dropHint,
	chooseLabel,
	filesLabel,
	removeLabel,
	fileHint,
	tooLargeError,
	wrongTypeError,
	className,
}: FileFieldProps): ReactNode => {
	const locale = useLocale();
	const ids = Field.useIds();
	const triggerRef = useRef<HTMLButtonElement>(null);

	const maxSize = formatBytes(maxFileSize, locale);
	const messages = [
		...normalizeFieldErrors(errors),
		...oversizedFiles(value, maxFileSize).map(file =>
			tooLargeError(file.name, maxSize),
		),
		...wrongTypeFiles(value, accept ?? []).map(file =>
			wrongTypeError(file.name),
		),
	];

	const field = useFieldState({
		errors: messages,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled: value.length > 0,
	});
	const fieldState = field.state;

	const describedBy = ids.describedBy(
		description !== undefined,
		field.invalid,
	);

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
					<FileInput.Item
						key={keyOf(file, index)}
						id={keyOf(file, index)}
						file={file}
						hint={fileHint(
							file.name,
							formatBytes(file.size, locale),
						)}
						invalid={
							isOversized(file, maxFileSize) ||
							!isAccepted(file, accept ?? [])
						}
						disabled={fieldState.disabled}
						removeLabel={
							readOnly === true ? undefined : removeLabel
						}
					/>
				))}
			</FileInput.List>
		);

	return (
		<FileInput.Root
			state={fieldState}
			disabled={fieldState.disabled}
			className={className}
			onBlur={event => {
				if (
					!(
						event.relatedTarget instanceof Node &&
						event.currentTarget.contains(
							event.relatedTarget,
						)
					)
				) {
					onBlur?.();
				}
			}}>
			<FileInput.Legend
				requiredness={requiredness}
				optionalLabel={optionalLabel}>
				{label}
			</FileInput.Legend>

			<FileInput.DropTarget
				aria-label={dropTargetLabel}
				state={fieldState}
				isDisabled={field.disabled}
				getDropOperation={
					readOnly === true ? () => "cancel" : undefined
				}
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
						<FileInput.Hint>{dropHint}</FileInput.Hint>
						<FileInput.Trigger
							label={chooseLabel}
							disabled={field.disabled}
							describedBy={describedBy}
							buttonRef={triggerRef}
							invalid={field.invalid}
							allowsMultiple={multiple}
							acceptedFileTypes={accept}
							onSelect={files =>
								add(files === null ? [] : [...files])
							}
						/>
					</>
				)}
				{tiles}
				{field.phase !== "fresh" && <FileInput.Pending />}
			</FileInput.DropTarget>

			<FileInput.Description id={ids.descriptionId}>
				{description}
			</FileInput.Description>
			<FileInput.Error id={ids.errorId}>
				{messages}
			</FileInput.Error>
		</FileInput.Root>
	);
};
