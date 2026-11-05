import { mergeProps } from "@base-ui/react/merge-props";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type HTMLAttributes,
	type ReactNode,
	type RefCallback,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { Button } from "../button/index.ts";
import {
	type FieldBlurHandler,
	fieldStateAttributes,
} from "../field/index.ts";
import {
	PhotoInputContext,
	usePhotoInput,
} from "./photo-input-context.ts";
import style from "./photo-input.module.scss";

const IMAGES: readonly string[] = ["image/*"];

/** Points an image at the file through an object URL, made once per file and revoked when the file changes or the image unmounts. */
const usePreviewSource = (
	file: File | undefined,
): RefCallback<HTMLImageElement> =>
	useCallback(
		(image: HTMLImageElement | null) => {
			if (image === null || file === undefined) {
				return undefined;
			}
			const url = URL.createObjectURL(file);
			image.src = url;
			return () => URL.revokeObjectURL(url);
		},
		[file],
	);

/** What the circle shows until a photo is picked: a placeholder, or the stored photo. */
export type PhotoInputPreviewProps =
	| Readonly<{
			/** Shown until a photo is picked, such as a placeholder. */
			defaultPreview?: ReactNode;
			/** Whether `defaultPreview` is a stored photo rather than a placeholder. */
			hasStoredImage?: false;
	  }>
	| Readonly<{
			/** The stored photo, shown until another is picked. */
			defaultPreview: NonNullable<ReactNode>;
			/** Whether `defaultPreview` is a stored photo rather than a placeholder. */
			hasStoredImage: true;
	  }>;

export type PhotoInputRootProps = Omit<
	ComponentProps<"div">,
	"onBlur"
> &
	Readonly<{
		/** The picked file, or nothing while the stored photo stands. */
		value: File | undefined;

		/** Called with a picked or dropped file, or with nothing once it is removed. */
		onValueChange?: (
			file: File | undefined,
		) => Promise<void> | void;

		/** Whether a stored photo stands until another is picked. */
		hasStoredImage?: boolean;

		/** Mime types, wildcards or extensions the file dialog offers. @default ["image/*"] */
		accept?: readonly string[];

		/** The id of the label that names the control. */
		labelledBy: string;

		/** The ids of the description and error, joined. */
		describedBy?: string;

		/** Submits the picked file under this name. */
		name?: string;

		/** Shows the photo without letting it be changed. */
		readOnly?: boolean;

		invalid?: boolean;

		/** Background work, such as an upload, is in flight. */
		pending?: boolean;

		onBlur?: FieldBlurHandler;
	}>;

/** The photo input's state and frame, which holds the hidden file input the well opens. */
const PhotoInputRoot = ({
	value,
	onValueChange,
	hasStoredImage = false,
	accept = IMAGES,
	labelledBy,
	describedBy,
	name,
	readOnly = false,
	invalid = false,
	pending = false,
	onBlur,
	className,
	children,
	...props
}: PhotoInputRootProps): ReactNode => {
	const valueId = useId();
	const well = useRef<HTMLButtonElement>(null);
	const picker = useRef<HTMLInputElement>(null);

	const pick = async (file: File) => {
		await onValueChange?.(file);
	};
	const remove = async () => {
		await onValueChange?.(undefined);
		well.current?.focus();
	};

	return (
		<PhotoInputContext
			value={{
				value,
				filled: value !== undefined || hasStoredImage,
				readOnly,
				invalid,
				pending,
				labelledBy,
				describedBy: [valueId, describedBy]
					.filter(id => id !== undefined)
					.join(" "),
				valueId,
				well,
				picker,
				pick,
				remove,
				onBlur,
			}}>
			<div
				className={clsx(style.photoInput, className)}
				{...props}>
				{children}
				{readOnly ? null : (
					<input
						ref={picker}
						type="file"
						name={name}
						accept={accept.join(",")}
						tabIndex={-1}
						aria-hidden="true"
						className={style.picker}
						onChange={async event => {
							const file = event.target.files?.[0];
							event.target.value = "";
							if (file !== undefined) {
								await pick(file);
							}
						}}
					/>
				)}
			</div>
		</PhotoInputContext>
	);
};

export type PhotoInputWellProps =
	HTMLAttributes<HTMLElement>;

/**
 * The circle that shows the photo. It is the button that opens the file dialog
 * and the target a file is dropped on, and Delete removes a picked photo.
 * Read-only, it is a focusable image that opens nothing.
 */
const PhotoInputWell = ({
	className,
	...props
}: PhotoInputWellProps): ReactNode => {
	const {
		value,
		filled,
		readOnly,
		invalid,
		pending,
		labelledBy,
		describedBy,
		well,
		picker,
		pick,
		remove,
		onBlur,
	} = usePhotoInput();
	const [dragOver, setDragOver] = useState(false);

	if (readOnly) {
		return (
			<span
				{...mergeProps<"span">(
					{
						role: "img",
						tabIndex: 0,
						"aria-labelledby": labelledBy,
						"aria-describedby": describedBy,
						className: clsx(style.well, className),
						onBlur,
						...fieldStateAttributes({
							readonly: true,
							filled,
							pending,
						}),
					},
					props,
				)}
			/>
		);
	}

	return (
		<button
			ref={well}
			type="button"
			{...mergeProps<"button">(
				{
					"aria-labelledby": labelledBy,
					"aria-describedby": describedBy,
					"aria-keyshortcuts":
						value === undefined ? undefined : "Delete",
					className: clsx(style.well, className),
					onClick: () => picker.current?.click(),
					onBlur,
					onKeyDown: event => {
						if (
							event.key === "Delete" &&
							value !== undefined
						) {
							event.preventDefault();
							void remove();
						}
					},
					onDragOver: event => {
						event.preventDefault();
						setDragOver(true);
					},
					onDragLeave: () => setDragOver(false),
					onDrop: event => {
						event.preventDefault();
						setDragOver(false);
						const file = event.dataTransfer.files[0];
						if (file !== undefined) {
							void pick(file);
						}
					},
					...fieldStateAttributes({
						validity: invalid ? "invalid" : undefined,
						filled,
						pending,
					}),
				},
				props,
			)}
			data-dragover={dragOver || undefined}
		/>
	);
};

export type PhotoInputFaceProps = ComponentProps<"span"> &
	Readonly<{
		/** The picked photo's alternative text, such as "Preview". */
		previewLabel: string;
	}>;

/** The picture inside the well: the picked photo, else its children, such as a placeholder or the stored photo. */
const PhotoInputFace = ({
	previewLabel,
	className,
	children,
	...props
}: PhotoInputFaceProps): ReactNode => {
	const { value } = usePhotoInput();
	const previewSource = usePreviewSource(value);
	return (
		<span
			className={clsx(style.face, className)}
			{...props}>
			{value === undefined ? (
				children
			) : (
				<img ref={previewSource} alt={previewLabel} />
			)}
		</span>
	);
};

/** The badge on the well's rim. Its children are the icon, such as a camera; without them, or read-only, it renders nothing. */
const PhotoInputBadge = ({
	className,
	children,
	...props
}: ComponentProps<"span">): ReactNode => {
	const { readOnly } = usePhotoInput();
	if (
		readOnly ||
		children === undefined ||
		children === null ||
		children === false
	) {
		return null;
	}
	return (
		<span
			className={clsx(style.badge, className)}
			aria-hidden="true"
			{...props}>
			{children}
		</span>
	);
};

export type PhotoInputRemoveProps = Omit<
	ComponentProps<"button">,
	"children"
> &
	Readonly<{
		/** The button's accessible name and tooltip, such as "Remove photo". */
		label: string;
		/** The button's icon, such as a cross. */
		icon: ReactNode;
	}>;

/** The icon-only button on the rim that removes a picked photo. It renders only while one is picked. */
const PhotoInputRemove = ({
	label,
	icon,
	className,
	onClick,
	...props
}: PhotoInputRemoveProps): ReactNode => {
	const { value, readOnly, remove } = usePhotoInput();
	if (readOnly || value === undefined) {
		return null;
	}
	return (
		<Button
			iconOnly
			icon={icon}
			label={label}
			variant="secondary"
			className={clsx(style.remove, className)}
			onClick={event => {
				onClick?.(event);
				void remove();
			}}
			{...props}
		/>
	);
};

export type PhotoInputValueTextProps = Omit<
	ComponentProps<"span">,
	"children" | "id"
> &
	Readonly<{
		/** What the well announces while a photo is set, such as "Photo set". */
		photoSetLabel: string;
		/** What the well announces while no photo is set, such as "No photo". */
		noPhotoLabel: string;
	}>;

/** The hidden text that describes the well, saying whether a photo is set. */
const PhotoInputValueText = ({
	photoSetLabel,
	noPhotoLabel,
	className,
	...props
}: PhotoInputValueTextProps): ReactNode => {
	const { filled, valueId } = usePhotoInput();
	return (
		<span
			id={valueId}
			className={clsx(style.valueText, className)}
			{...props}>
			{filled ? photoSetLabel : noPhotoLabel}
		</span>
	);
};

/** The parts of a photo input. */
export type PhotoInputParts = Readonly<{
	Root: typeof PhotoInputRoot;
	Well: typeof PhotoInputWell;
	Face: typeof PhotoInputFace;
	Badge: typeof PhotoInputBadge;
	Remove: typeof PhotoInputRemove;
	ValueText: typeof PhotoInputValueText;
}>;

/**
 * The parts of a photo picker: a circle showing the photo, which is itself the
 * button that opens the file dialog and the target a file is dropped on, with
 * a remove button on its rim. It carries no name of its own, so an enclosing
 * field names it. For the ordinary case, use `PhotoField`.
 *
 * @example
 * <PhotoInput.Root labelledBy={labelId} value={file} onValueChange={setFile}>
 * 	<PhotoInput.Well>
 * 		<PhotoInput.Face previewLabel="Preview">
 * 			<Avatar name={user.name} />
 * 		</PhotoInput.Face>
 * 		<PhotoInput.Badge><PhotoCameraIcon /></PhotoInput.Badge>
 * 	</PhotoInput.Well>
 * 	<PhotoInput.Remove label="Remove photo" icon={<CloseIcon />} />
 * 	<PhotoInput.ValueText photoSetLabel="Photo set" noPhotoLabel="No photo" />
 * </PhotoInput.Root>
 */
export const PhotoInput: PhotoInputParts = {
	Root: PhotoInputRoot,
	Well: PhotoInputWell,
	Face: PhotoInputFace,
	Badge: PhotoInputBadge,
	Remove: PhotoInputRemove,
	ValueText: PhotoInputValueText,
};
