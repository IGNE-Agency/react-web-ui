import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode, Ref } from "react";
import type { useRender } from "@base-ui/react/use-render";
import {
	Button as AriaButton,
	DropZone as AriaDropZone,
	type DropZoneProps as AriaDropZoneProps,
	FileTrigger as AriaFileTrigger,
	type FileTriggerProps as AriaFileTriggerProps,
	type Key,
	Tag as AriaTag,
	TagGroup as AriaTagGroup,
	TagList as AriaTagList,
} from "react-aria-components";
import { renderAs } from "../../lib/render-as.tsx";
import {
	AttachmentTile,
	type AttachmentTileRootProps,
} from "../attachment-tile/index.ts";
import {
	Field,
	type FieldLabelProps,
	type FieldRootProps,
	type FieldState,
	fieldStateAttributes,
} from "../field/index.ts";
import style from "./file-field.module.scss";

export type FileInputRootProps = Omit<
	FieldRootProps,
	"requiredness"
> &
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
		requiredness={state?.requiredness}
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

/**
 * The prompt inside the drop target, holding its text and an optional
 * `HintIcon` above it.
 *
 * @example
 * <FileInput.Hint>
 * 	<FileInput.HintIcon><UploadFileIcon /></FileInput.HintIcon>
 * 	Drag files here
 * </FileInput.Hint>
 */
const FileInputHint = ({
	className,
	...props
}: ComponentProps<"p">): ReactNode => (
	<p className={clsx(style.hint, className)} {...props} />
);

/**
 * The glyph above the prompt, such as an upload icon. Renders nothing without
 * children.
 *
 * @example
 * <FileInput.HintIcon><UploadFileIcon /></FileInput.HintIcon>
 */
const FileInputHintIcon = ({
	className,
	children,
	...props
}: ComponentProps<"span">): ReactNode =>
	children === undefined ||
	children === null ||
	children === false ? null : (
		<span
			aria-hidden="true"
			className={clsx(style.hintIcon, className)}
			{...props}>
			{children}
		</span>
	);

export type FileInputTriggerProps = Omit<
	AriaFileTriggerProps,
	"children"
> &
	Readonly<{
		/** The button to render, such as `<Button variant="secondary" size="sm">Choose files</Button>`. */
		render: useRender.RenderProp;
		disabled?: boolean;
		/** Ids of the description and error text, chained onto the button. */
		describedBy?: string;
		/** The picker button itself, for returning focus to it. */
		buttonRef?: Ref<HTMLButtonElement>;
		/** Marks the picker button as the field's invalid control. */
		invalid?: boolean;
	}>;

/**
 * The button that opens the file dialog. It renders whichever button it is
 * given.
 *
 * @example
 * <FileInput.Trigger
 * 	onSelect={onSelect}
 * 	render={<Button variant="secondary" size="sm" icon={<AttachFileIcon />}>Choose files</Button>}
 * />
 */
const FileInputTrigger = ({
	render,
	disabled,
	describedBy,
	buttonRef,
	invalid,
	...props
}: FileInputTriggerProps): ReactNode => (
	<AriaFileTrigger {...props}>
		<AriaButton
			ref={buttonRef}
			isDisabled={disabled}
			aria-describedby={describedBy}
			render={renderAs(render, {
				...fieldStateAttributes({
					validity:
						invalid === true ? "invalid" : undefined,
				}),
			})}
		/>
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

export type FileInputItemProps = Omit<
	AttachmentTileRootProps,
	"render" | "id"
> &
	Readonly<{
		/** Key the surrounding list removes this file by. */
		id: string;
		/** The file's name, which the tile is read and typed to as. */
		textValue: string;
		disabled?: boolean;
	}>;

/**
 * One staged file's tile in the `List`, holding `AttachmentTile`'s parts.
 *
 * @example
 * <FileInput.Item id={id} textValue={file.name}>
 * 	<AttachmentTile.Preview name={file.name} src={src}>…</AttachmentTile.Preview>
 * </FileInput.Item>
 */
const FileInputItem = ({
	id,
	textValue,
	disabled = false,
	...props
}: FileInputItemProps): ReactNode => (
	<AttachmentTile.Root
		render={
			<AriaTag
				id={id}
				textValue={textValue}
				isDisabled={disabled}
			/>
		}
		{...props}
	/>
);

/** The parts of a file input. */
export type FileInputParts = Readonly<{
	Root: typeof FileInputRoot;
	Legend: typeof FileInputLegend;
	DropTarget: typeof FileInputDropTarget;
	Hint: typeof FileInputHint;
	HintIcon: typeof FileInputHintIcon;
	Trigger: typeof FileInputTrigger;
	Pending: typeof Field.Pending;
	List: typeof FileInputList;
	Item: typeof FileInputItem;
	Description: typeof Field.Description;
	Error: typeof Field.Error;
}>;

/**
 * The styled parts of a file input: the field frame around react-aria's
 * `DropZone` and `FileTrigger`, plus the staged files as removable tiles built
 * from `AttachmentTile`'s parts. The `Root` is a fieldset named by its `Legend`. For the
 * ordinary case, use `FileField`.
 *
 * @example
 * <FileInput.Root state={{ requiredness: "optional" }}>
 * 	<FileInput.Legend>Attachments <Field.Requiredness optionalLabel="optional" /></FileInput.Legend>
 * 	<FileInput.DropTarget aria-label="Drop zone for attachments" onDrop={onDrop}>
 * 		<FileInput.Hint>
 * 			<FileInput.HintIcon><UploadFileIcon /></FileInput.HintIcon>
 * 			Drag files here
 * 		</FileInput.Hint>
 * 		<FileInput.Trigger
 * 			onSelect={onSelect}
 * 			render={<Button variant="secondary" size="sm" icon={<AttachFileIcon />}>Choose files</Button>}
 * 		/>
 * 		<FileInput.List label="Files for attachments" onRemove={onRemove}>
 * 			<FileInput.Item id={id} textValue={file.name}>
 * 				<AttachmentTile.Preview name={file.name} src={undefined}>
 * 					<AttachmentTile.Extension />
 * 					<AttachmentTile.Name />
 * 				</AttachmentTile.Preview>
 * 			</FileInput.Item>
 * 		</FileInput.List>
 * 	</FileInput.DropTarget>
 * </FileInput.Root>
 */
export const FileInput: FileInputParts = {
	Root: FileInputRoot,
	Legend: FileInputLegend,
	DropTarget: FileInputDropTarget,
	Hint: FileInputHint,
	HintIcon: FileInputHintIcon,
	Trigger: FileInputTrigger,
	Pending: Field.Pending,
	List: FileInputList,
	Item: FileInputItem,
	Description: Field.Description,
	Error: Field.Error,
};
