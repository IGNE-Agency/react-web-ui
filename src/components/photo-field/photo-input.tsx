import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ComponentPropsWithRef,
	type HTMLAttributes,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
	type RefCallback,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { useCopy } from "../copy-provider/index.ts";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldState,
} from "../field/index.ts";
import {
	FieldWiringContext,
	useFieldWiring,
	useFieldWiringContext,
	WiredDescription,
	WiredError,
	WiredLabel,
} from "../field/field-wiring.tsx";
import {
	InputPartsContext,
	useInputPartsContext,
} from "../field/input-parts.tsx";
import { RequiredSpokenContext } from "../field/required-spoken.ts";
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
	FieldProps,
	"label" | "description"
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

		/** Submits the picked file under this name. */
		name?: string;

		/** Whether the field is disabled. */
		disabled?: boolean;

		/** Shows the photo without letting it be changed. */
		readOnly?: boolean;

		/** States no prop here owns, projected over the ones that do. */
		state?: FieldState;

		/** Called once focus has left the well. */
		onBlur?: FieldBlurHandler;

		/** Applied to the field frame, where a caller lays it out itself. */
		className?: string;

		/** The field's parts. */
		children?: ReactNode;
	}>;

/**
 * The field frame around a photo input, holding its value and the hidden file
 * input the well opens, and projecting its state onto every part. Its required
 * mark says "required" in words, because the well cannot carry
 * `aria-required`.
 *
 * @example
 * <PhotoInput.Root value={file} onValueChange={setFile} requiredness="required">…</PhotoInput.Root>
 */
const PhotoInputRoot = ({
	value,
	onValueChange,
	hasStoredImage = false,
	accept = IMAGES,
	name,
	errors,
	requiredness,
	dirty,
	touched,
	pending = false,
	disabled,
	readOnly,
	state,
	onBlur,
	className,
	children,
}: PhotoInputRootProps): ReactNode => {
	const valueId = useId();
	const well = useRef<HTMLButtonElement>(null);
	const picker = useRef<HTMLInputElement>(null);
	const filled = value !== undefined || hasStoredImage;
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled,
		readOnly,
		filled,
		state,
	});
	const wiring = useFieldWiring(field.invalid);
	const locked = field.state.readonly === true;

	const pick = async (file: File) => {
		await onValueChange?.(file);
	};
	const remove = async () => {
		await onValueChange?.(undefined);
		well.current?.focus();
	};

	return (
		<InputPartsContext
			value={{
				state: field.state,
				errors,
				phase: field.phase,
			}}>
			<FieldWiringContext value={wiring}>
				<PhotoInputContext
					value={{
						value,
						filled,
						readOnly: locked,
						valueId,
						well,
						picker,
						pick,
						remove,
						onBlur,
					}}>
					<Field.Root
						disabled={field.disabled}
						invalid={field.invalid}
						requiredness={field.state.requiredness}
						dirty={dirty}
						touched={touched}
						className={className}
						{...fieldStateAttributes(field.state)}>
						<RequiredSpokenContext value={true}>
							{children}
						</RequiredSpokenContext>
						{locked ? null : (
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
					</Field.Root>
				</PhotoInputContext>
			</FieldWiringContext>
		</InputPartsContext>
	);
};

/**
 * The box the well and the buttons on its rim sit in, sized by
 * `--kit-photo-input-size`.
 *
 * @example
 * <PhotoInput.Group>
 * 	<PhotoInput.Well>…</PhotoInput.Well>
 * 	<PhotoInput.Remove render={…} />
 * </PhotoInput.Group>
 */
const PhotoInputGroup = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(style.photoInput, className)}
		{...props}
	/>
);

export type PhotoInputWellProps =
	HTMLAttributes<HTMLElement>;

/**
 * The circle that shows the photo, named by its root's `Label` and described
 * by its `ValueText`, `Description` and `Error`. It is the button that opens
 * the file dialog and the target a file is dropped on, and Delete removes a
 * picked photo. Read-only, it is a focusable image that opens nothing.
 *
 * @example
 * <PhotoInput.Well><PhotoInput.Face>…</PhotoInput.Face></PhotoInput.Well>
 */
const PhotoInputWell = ({
	className,
	...props
}: PhotoInputWellProps): ReactNode => {
	const {
		value,
		filled,
		readOnly,
		valueId,
		well,
		picker,
		pick,
		remove,
		onBlur,
	} = usePhotoInput();
	const { state } = useInputPartsContext();
	const { ids, describedBy: fieldDescribedBy } =
		useFieldWiringContext();
	const labelledBy = ids.labelId;
	const describedBy = [valueId, fieldDescribedBy]
		.filter(id => id !== undefined)
		.join(" ");
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
							pending: state.pending,
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
					disabled: state.disabled,
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
						validity: state.validity,
						disabled: state.disabled,
						filled,
						pending: state.pending,
					}),
				},
				props,
			)}
			data-dragover={dragOver || undefined}
		/>
	);
};

/**
 * The picture inside the well, holding the picked photo's `Image` and the
 * `Fallback` shown until one is picked.
 *
 * @example
 * <PhotoInput.Face>
 * 	<PhotoInput.Image alt="Preview" />
 * 	<PhotoInput.Fallback><Avatar name={user.name} /></PhotoInput.Fallback>
 * </PhotoInput.Face>
 */
const PhotoInputFace = ({
	className,
	...props
}: ComponentProps<"span">): ReactNode => (
	<span
		className={clsx(style.face, className)}
		{...props}
	/>
);

export type PhotoInputImageProps = Omit<
	ComponentProps<"img">,
	"src" | "alt"
> &
	Readonly<{
		/** The picked photo's alternative text, such as "Preview". */
		alt: string;
	}>;

/**
 * The picked photo. Renders nothing until one is picked.
 *
 * @example
 * <PhotoInput.Image alt="Preview" />
 */
const PhotoInputImage = ({
	alt,
	...props
}: PhotoInputImageProps): ReactNode => {
	const { value } = usePhotoInput();
	const previewSource = usePreviewSource(value);
	return value === undefined ? null : (
		<img ref={previewSource} alt={alt} {...props} />
	);
};

/**
 * What the face shows until a photo is picked, such as a placeholder or the
 * stored photo. Renders nothing once one is picked, or without children.
 *
 * @example
 * <PhotoInput.Fallback><Avatar name={user.name} /></PhotoInput.Fallback>
 */
const PhotoInputFallback = ({
	className,
	children,
	...props
}: ComponentProps<"span">): ReactNode => {
	const { value } = usePhotoInput();
	return value !== undefined ||
		children === undefined ||
		children === null ||
		children === false ? null : (
		<span
			className={clsx(style.fallback, className)}
			{...props}>
			{children}
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
	ComponentPropsWithRef<"button">,
	"children"
> &
	Readonly<{
		/** The button to render, such as `<IconButton label="Remove photo" variant="secondary"><CloseIcon /></IconButton>`. */
		render: useRender.RenderProp;
	}>;

/**
 * The button on the rim that removes a picked photo. It renders whichever
 * button it is given, only while a photo is picked.
 *
 * @example
 * <PhotoInput.Remove
 * 	render={
 * 		<IconButton label="Remove photo" variant="secondary">
 * 			<CloseIcon />
 * 		</IconButton>
 * 	}
 * />
 */
const PhotoInputRemove = ({
	render,
	className,
	onClick,
	...props
}: PhotoInputRemoveProps): ReactElement | null => {
	const { value, readOnly, remove } = usePhotoInput();
	const { state } = useInputPartsContext();
	return useRender({
		render,
		enabled: !readOnly && value !== undefined,
		props: {
			type: "button",
			disabled: state.disabled,
			...props,
			className: clsx(style.remove, className),
			onClick: (event: MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				void remove();
			},
		},
	});
};

export type PhotoInputValueTextProps = Omit<
	ComponentProps<"span">,
	"children" | "id"
>;

/** The hidden text that describes the well, saying the `CopyProvider`'s `photo.set` or `photo.none`. */
const PhotoInputValueText = ({
	className,
	...props
}: PhotoInputValueTextProps): ReactNode => {
	const copy = useCopy();
	const { filled, valueId } = usePhotoInput();
	return (
		<span
			id={valueId}
			className={clsx(style.valueText, className)}
			{...props}>
			{filled ? copy.photo.set : copy.photo.none}
		</span>
	);
};

/** The parts of a photo input. */
export type PhotoInputParts = Readonly<{
	Root: typeof PhotoInputRoot;
	Label: typeof WiredLabel;
	Group: typeof PhotoInputGroup;
	Well: typeof PhotoInputWell;
	Face: typeof PhotoInputFace;
	Image: typeof PhotoInputImage;
	Fallback: typeof PhotoInputFallback;
	Badge: typeof PhotoInputBadge;
	Remove: typeof PhotoInputRemove;
	ValueText: typeof PhotoInputValueText;
	Description: typeof WiredDescription;
	Error: typeof WiredError;
}>;

/**
 * The parts of a photo picker: a circle showing the photo, which is itself the
 * button that opens the file dialog and the target a file is dropped on, with
 * a remove button on its rim. `Root` draws the field frame and holds the value
 * and the field's states, and names and describes the well by its `Label`,
 * `ValueText`, `Description` and `Error`, so no part below it takes either
 * again. For the ordinary case, use `PhotoField`, which is assembled from
 * exactly these parts.
 *
 * @example
 * <PhotoInput.Root value={file} onValueChange={setFile} errors={errors} requiredness="required">
 * 	<PhotoInput.Label>Profile photo <Field.Requiredness /></PhotoInput.Label>
 * 	<PhotoInput.Group>
 * 		<PhotoInput.Well>
 * 			<PhotoInput.Face>
 * 				<PhotoInput.Image alt="Preview" />
 * 				<PhotoInput.Fallback><Avatar name={user.name} /></PhotoInput.Fallback>
 * 			</PhotoInput.Face>
 * 			<PhotoInput.Badge><PhotoCameraIcon /></PhotoInput.Badge>
 * 		</PhotoInput.Well>
 * 		<PhotoInput.Remove
 * 			render={
 * 				<IconButton label="Remove photo" variant="secondary">
 * 					<CloseIcon />
 * 				</IconButton>
 * 			}
 * 		/>
 * 		<PhotoInput.ValueText />
 * 	</PhotoInput.Group>
 * 	<PhotoInput.Description>A square photo works best.</PhotoInput.Description>
 * 	<PhotoInput.Error />
 * </PhotoInput.Root>
 */
export const PhotoInput: PhotoInputParts = {
	Root: PhotoInputRoot,
	Label: WiredLabel,
	Group: PhotoInputGroup,
	Well: PhotoInputWell,
	Face: PhotoInputFace,
	Image: PhotoInputImage,
	Fallback: PhotoInputFallback,
	Badge: PhotoInputBadge,
	Remove: PhotoInputRemove,
	ValueText: PhotoInputValueText,
	Description: WiredDescription,
	Error: WiredError,
};
