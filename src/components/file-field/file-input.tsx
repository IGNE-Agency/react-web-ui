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
import style from "./file-field.module.scss";

export type FileInputRootProps = FieldRootProps &
	Readonly<{
		/** The states projected onto the field as `data-*` attributes. */
		state?: FieldState;
	}>;

/** The fieldset around the file input, which projects its state as `data-*` attributes. */
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

/** The legend that names the fieldset. */
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
		"aria-label": string;

		/** The states projected onto the target as `data-*` attributes. */
		state?: FieldState;

		className?: string;
	}>;

/** The area files are dropped on, holding the hint, the picker button and the staged files. */
const FileInputDropTarget = ({
	state,
	className,
	...props
}: FileInputDropTargetProps): ReactNode => (
	<AriaDropZone
		className={clsx(style.dropTarget, className)}
		{...fieldStateAttributes(state ?? {})}
		{...props}
	/>
);

export type FileInputHintProps = ComponentProps<"p"> &
	Readonly<{
		/** Drawn above the prompt, such as an upload icon. */
		icon?: ReactNode;
	}>;

/** The prompt inside the drop target, with an optional `icon` above it. */
const FileInputHint = ({
	className,
	icon,
	children,
	...props
}: FileInputHintProps): ReactNode => (
	<p className={clsx(style.hint, className)} {...props}>
		{icon === undefined ? null : (
			<span aria-hidden="true" className={style.hintIcon}>
				{icon}
			</span>
		)}
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
		/** Drawn before the button's label, such as an attach icon. */
		icon?: ReactNode;
	}>;

/** The button that opens the file dialog. */
const FileInputTrigger = ({
	label,
	disabled,
	describedBy,
	buttonRef,
	invalid,
	icon,
	...props
}: FileInputTriggerProps): ReactNode => (
	<AriaFileTrigger {...props}>
		<Button
			variant="secondary"
			size="sm"
			icon={icon}
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

/** The staged files, as a group of removable tiles. */
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

/** A tile's remove button: its name and icon together, or neither for a fixed tile. */
export type FileInputItemRemoval =
	| Readonly<{
			/** Accessible name for the remove button. */
			removeLabel: string;
			/** The remove button's icon, such as a cross. */
			removeIcon: ReactNode;
	  }>
	| Readonly<{
			removeLabel?: undefined;
			removeIcon?: undefined;
	  }>;

export type FileInputItemProps = Readonly<{
	/** Key the surrounding list removes this file by. */
	id: string;

	file: File;

	/** Tooltip text for the tile, such as "invoice.pdf (12 kB)". */
	hint: string;

	/** Marks the tile as rejected, such as over the size limit. */
	invalid?: boolean;

	disabled?: boolean;

	/** Drawn on a tile that has no image preview, such as a file icon. */
	icon?: ReactNode;
}> &
	FileInputItemRemoval;

/** One staged file as an `AttachmentTile`. */
const FileInputItem = ({
	invalid = false,
	disabled = false,
	...props
}: FileInputItemProps): ReactNode => (
	<AttachmentTile
		invalid={invalid}
		disabled={disabled}
		{...props}
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
 * 	<FileInput.DropTarget aria-label="Drop zone for attachments" onDrop={onDrop}>
 * 		<FileInput.Hint icon={<UploadFileIcon />}>Drag files here</FileInput.Hint>
 * 		<FileInput.Trigger label="Choose files" icon={<AttachFileIcon />} onSelect={onSelect} />
 * 		<FileInput.List label="Files for attachments" onRemove={onRemove}>
 * 			<FileInput.Item id={id} file={file} hint="invoice.pdf (12 kB)" removeLabel="Remove" removeIcon={<CloseIcon />} />
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
