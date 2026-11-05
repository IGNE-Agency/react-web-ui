import CameraIcon from "@material-design-icons/svg/outlined/photo_camera.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import {
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
import { Icon } from "../icon/index.ts";
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

export type PhotoInputProps = Readonly<{
	/** The picked file, or nothing while the stored photo stands. */
	value: File | undefined;

	/** Called with a picked or dropped file, or with nothing once it is removed. */
	onValueChange?: (
		file: File | undefined,
	) => Promise<void> | void;

	/** Shown until a photo is picked, typically the stored one. */
	defaultPreview?: ReactNode;

	/** Whether `defaultPreview` is a stored photo rather than a placeholder. */
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

	/** The picked photo's alternative text, such as "Preview". */
	previewLabel: string;

	/** What the control announces while a photo is set, such as "Photo set". */
	photoSetLabel: string;

	/** What the control announces while no photo is set, such as "No photo". */
	noPhotoLabel: string;

	/** Accessible name of the button that removes a picked photo, such as "Remove photo". */
	removeLabel: string;
}>;

/**
 * The bare photo picker: a circle showing the photo, which is itself the
 * button that opens the file dialog and the target a file is dropped on. A
 * picked photo can be removed with the button on the rim, or with Delete on
 * the circle. Read-only, the circle stays focusable and opens nothing. It
 * carries no name of its own, so an enclosing field names it. For the
 * ordinary case, use `PhotoField`.
 *
 * @example
 * <PhotoInput
 * 	labelledBy={labelId}
 * 	value={file}
 * 	onValueChange={setFile}
 * 	defaultPreview={<Avatar name={user.name} />}
 * 	previewLabel="Preview"
 * 	photoSetLabel="Photo set"
 * 	noPhotoLabel="No photo"
 * 	removeLabel="Remove photo"
 * />
 */
export const PhotoInput = ({
	value,
	onValueChange,
	defaultPreview,
	hasStoredImage = false,
	accept = IMAGES,
	labelledBy,
	describedBy,
	name,
	readOnly = false,
	invalid = false,
	pending = false,
	onBlur,
	previewLabel,
	photoSetLabel,
	noPhotoLabel,
	removeLabel,
}: PhotoInputProps): ReactNode => {
	const valueId = useId();
	const well = useRef<HTMLButtonElement>(null);
	const picker = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const previewSource = usePreviewSource(value);

	const filled = value !== undefined || hasStoredImage;
	const face = (
		<span className={style.face}>
			{value === undefined ? (
				defaultPreview
			) : (
				<img ref={previewSource} alt={previewLabel} />
			)}
		</span>
	);
	const description = [valueId, describedBy]
		.filter(id => id !== undefined)
		.join(" ");
	const valueText = (
		<span id={valueId} className={style.valueText}>
			{filled ? photoSetLabel : noPhotoLabel}
		</span>
	);

	const remove = async () => {
		await onValueChange?.(undefined);
		well.current?.focus();
	};

	if (readOnly) {
		return (
			<div className={style.photoInput}>
				<span
					role="img"
					tabIndex={0}
					aria-labelledby={labelledBy}
					aria-describedby={description}
					className={style.well}
					onBlur={onBlur}
					{...fieldStateAttributes({
						readonly: true,
						filled,
						pending,
					})}>
					{face}
				</span>
				{valueText}
			</div>
		);
	}

	return (
		<div className={style.photoInput}>
			<button
				ref={well}
				type="button"
				aria-labelledby={labelledBy}
				aria-describedby={description}
				aria-keyshortcuts={
					value === undefined ? undefined : "Delete"
				}
				className={style.well}
				onClick={() => picker.current?.click()}
				onBlur={onBlur}
				onKeyDown={event => {
					if (
						event.key === "Delete" &&
						value !== undefined
					) {
						event.preventDefault();
						void remove();
					}
				}}
				onDragOver={event => {
					event.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={event => {
					event.preventDefault();
					setDragOver(false);
					const file = event.dataTransfer.files[0];
					if (file !== undefined) {
						void onValueChange?.(file);
					}
				}}
				data-dragover={dragOver || undefined}
				{...fieldStateAttributes({
					validity: invalid ? "invalid" : undefined,
					filled,
					pending,
				})}>
				{face}
				<span className={style.badge} aria-hidden="true">
					<Icon svg={CameraIcon} label="" />
				</span>
			</button>
			{value !== undefined && (
				<Button
					iconOnly
					icon={CloseIcon}
					label={removeLabel}
					variant="secondary"
					className={style.remove}
					onClick={() => void remove()}
				/>
			)}
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
						await onValueChange?.(file);
					}
				}}
			/>
			{valueText}
		</div>
	);
};
