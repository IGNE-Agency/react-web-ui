import AttachIcon from "@material-design-icons/svg/outlined/attach_file.svg?react";
import UploadIcon from "@material-design-icons/svg/outlined/upload_file.svg?react";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode, Ref } from "react";
import {
	Button as AriaButton,
	DropZone as AriaDropZone,
	type DropZoneProps as AriaDropZoneProps,
	FileTrigger as AriaFileTrigger,
	type FileTriggerProps as AriaFileTriggerProps,
	type Key,
	TagGroup as AriaTagGroup,
	TagList as AriaTagList,
} from "react-aria-components";
import { AttachmentTile } from "../attachment-tile/index.ts";
import { Button } from "../button/index.ts";
import {
	Field,
	type FieldLabelProps,
	type FieldRootProps,
	type FieldState,
	fieldStateAttributes,
} from "../field/index.ts";
import { Icon } from "../icon/index.ts";
import style from "./file-field.module.scss";

export type FileInputRootProps = FieldRootProps &
	Readonly<{
		/** The states projected onto the field as `data-*` attributes. */
		state?: FieldState;
	}>;

const FileInputRoot = ({
	state,
	disabled,
	...props
}: FileInputRootProps): ReactNode => (
	<Field.Root
		render={<BaseFieldset.Root disabled={disabled} />}
		disabled={disabled}
		{...fieldStateAttributes(state ?? {})}
		{...props}
	/>
);

const FileInputLegend = (
	props: FieldLabelProps,
): ReactNode => (
	<Field.Label
		nativeLabel={false}
		render={<BaseFieldset.Legend />}
		{...props}
	/>
);

export type FileInputDropTargetProps = Omit<
	AriaDropZoneProps,
	"className" | "aria-label"
> &
	Readonly<{
		/** Accessible name for the drop target, which is not a labelable element. */
		label: string;

		/** The states projected onto the target as `data-*` attributes. */
		state?: FieldState;

		className?: string;
	}>;

const FileInputDropTarget = ({
	label,
	state,
	className,
	...props
}: FileInputDropTargetProps): ReactNode => (
	<AriaDropZone
		aria-label={label}
		className={clsx(style.dropTarget, className)}
		{...fieldStateAttributes(state ?? {})}
		{...props}
	/>
);

const FileInputHint = ({
	className,
	children,
	...props
}: ComponentProps<"p">): ReactNode => (
	<p className={clsx(style.hint, className)} {...props}>
		<Icon svg={UploadIcon} label="" size={1.5} />
		{children}
	</p>
);

export type FileInputTriggerProps = Omit<
	AriaFileTriggerProps,
	"children"
> &
	Readonly<{
		/** Visible label on the picker button. */
		label: string;
		disabled?: boolean;
		/** Ids of the description and error text, chained onto the button. */
		describedBy?: string;
		/** The picker button itself, for returning focus to it. */
		buttonRef?: Ref<HTMLButtonElement>;
		/** Marks the picker button as the field's invalid control. */
		invalid?: boolean;
	}>;

const FileInputTrigger = ({
	label,
	disabled,
	describedBy,
	buttonRef,
	invalid,
	...props
}: FileInputTriggerProps): ReactNode => (
	<AriaFileTrigger {...props}>
		<Button
			variant="secondary"
			size="sm"
			icon={AttachIcon}
			ref={buttonRef}
			aria-describedby={describedBy}
			{...fieldStateAttributes({
				validity: invalid === true ? "invalid" : undefined,
			})}
			render={<AriaButton isDisabled={disabled} />}>
			{label}
		</Button>
	</AriaFileTrigger>
);

export type FileInputListProps = Readonly<{
	/** Accessible name for the group of tiles. */
	label: string;

	/** Removal of the tiles whose keys are given; without it tiles are fixed. */
	onRemove?: (keys: Set<Key>) => void;

	children: ReactNode;

	className?: string;
}>;

const FileInputList = ({
	label,
	onRemove,
	children,
	className,
}: FileInputListProps): ReactNode => (
	<AriaTagGroup aria-label={label} onRemove={onRemove}>
		<AriaTagList className={clsx(style.list, className)}>
			{children}
		</AriaTagList>
	</AriaTagGroup>
);

export type FileInputItemProps = Readonly<{
	/** Key the surrounding list removes this file by. */
	id: string;

	file: File;

	/** Tooltip text for the tile, such as "invoice.pdf (12 kB)". */
	hint: string;

	/** Marks the tile as rejected, such as over the size limit. */
	invalid?: boolean;

	disabled?: boolean;

	/** Accessible name for the remove button; without one the tile is fixed. */
	removeLabel?: string;
}>;

const FileInputItem = ({
	id,
	file,
	hint,
	invalid = false,
	disabled = false,
	removeLabel,
}: FileInputItemProps): ReactNode => (
	<AttachmentTile
		id={id}
		file={file}
		hint={hint}
		removeLabel={removeLabel}
		invalid={invalid}
		disabled={disabled}
	/>
);

/** The parts of a file input. */
export type FileInputParts = Readonly<{
	Root: typeof FileInputRoot;
	Legend: typeof FileInputLegend;
	DropTarget: typeof FileInputDropTarget;
	Hint: typeof FileInputHint;
	Trigger: typeof FileInputTrigger;
	Pending: typeof Field.Pending;
	List: typeof FileInputList;
	Item: typeof FileInputItem;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
}>;

/**
 * The styled parts of a file input: the field frame around react-aria's
 * `DropZone` and `FileTrigger`, plus the staged files as removable
 * `AttachmentTile`s. The `Root` is a fieldset named by its `Legend`. For the
 * ordinary case, use `FileField`.
 *
 * @example
 * <FileInput.Root state={{ requiredness: "optional" }}>
 * 	<FileInput.Legend optionalLabel="optional">Attachments</FileInput.Legend>
 * 	<FileInput.DropTarget label="Drop zone for attachments" onDrop={onDrop}>
 * 		<FileInput.Hint>Drag files here</FileInput.Hint>
 * 		<FileInput.Trigger label="Choose files" onSelect={onSelect} />
 * 		<FileInput.List label="Files for attachments" onRemove={onRemove}>
 * 			<FileInput.Item id={id} file={file} hint="invoice.pdf (12 kB)" removeLabel="Remove" />
 * 		</FileInput.List>
 * 	</FileInput.DropTarget>
 * </FileInput.Root>
 */
export const FileInput: FileInputParts = {
	Root: FileInputRoot,
	Legend: FileInputLegend,
	DropTarget: FileInputDropTarget,
	Hint: FileInputHint,
	Trigger: FileInputTrigger,
	Pending: Field.Pending,
	List: FileInputList,
	Item: FileInputItem,
	Description: Field.Description,
	Error: Field.Error,
};
