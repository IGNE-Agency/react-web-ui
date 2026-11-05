import type { ReactNode } from "react";
import {
	Field,
	type FieldProps,
	useFieldState,
} from "../field/index.ts";
import {
	PhotoInput,
	type PhotoInputPreviewProps,
	type PhotoInputRootProps,
} from "./photo-input.tsx";

export type PhotoFieldProps = Pick<
	PhotoInputRootProps,
	| "value"
	| "onValueChange"
	| "accept"
	| "name"
	| "readOnly"
	| "onBlur"
> &
	PhotoInputPreviewProps &
	FieldProps &
	Readonly<{
		/** The picked photo's alternative text, such as "Preview". */
		previewLabel: string;

		/** What the control announces while a photo is set, such as "Photo set". */
		photoSetLabel: string;

		/** What the control announces while no photo is set, such as "No photo". */
		noPhotoLabel: string;

		/** Accessible name of the button that removes a picked photo, such as "Remove photo". */
		removeLabel: string;

		/** The remove button's icon, such as a cross. */
		removeIcon: ReactNode;

		/** The badge on the circle's rim, such as a camera icon. */
		icon?: ReactNode;

		/** Applied to the field, where a caller lays it out itself. */
		className?: string;
	}>;

/**
 * A labelled photo picker: the label, the circle that is both the photo and
 * the button that changes it, then the description and error. The label is
 * not a native one, because the circle is named by it through
 * `aria-labelledby` and also announces whether a photo is set.
 *
 * @example
 * <PhotoField
 * 	label="Profile photo"
 * 	optionalLabel="optional"
 * 	value={file}
 * 	onValueChange={setFile}
 * 	hasStoredImage={user.photo !== null}
 * 	defaultPreview={<Avatar name={user.name} />}
 * 	accept={["image/png", "image/jpeg"]}
 * 	icon={<PhotoCameraIcon />}
 * 	previewLabel="Preview"
 * 	photoSetLabel="Photo set"
 * 	noPhotoLabel="No photo"
 * 	removeLabel="Remove photo"
 * 	removeIcon={<CloseIcon />}
 * />
 */
export const PhotoField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending,
	readOnly,
	className,
	defaultPreview,
	hasStoredImage,
	previewLabel,
	photoSetLabel,
	noPhotoLabel,
	removeLabel,
	removeIcon,
	icon,
	...controlProps
}: PhotoFieldProps): ReactNode => {
	const ids = Field.useIds();
	const { labelId, descriptionId, errorId } = ids;
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		readOnly,
	});
	const { invalid } = field;

	return (
		<Field.Root
			className={className}
			invalid={invalid}
			dirty={dirty}
			touched={touched}>
			<Field.Label
				id={labelId}
				nativeLabel={false}
				requiredness={requiredness}
				optionalLabel={optionalLabel}
				render={<span />}>
				{label}
			</Field.Label>
			<PhotoInput.Root
				{...controlProps}
				hasStoredImage={hasStoredImage}
				labelledBy={labelId}
				describedBy={ids.describedBy(
					description !== undefined,
					invalid,
				)}
				readOnly={readOnly}
				invalid={invalid}
				pending={field.state.pending}>
				<PhotoInput.Well>
					<PhotoInput.Face previewLabel={previewLabel}>
						{defaultPreview}
					</PhotoInput.Face>
					<PhotoInput.Badge>{icon}</PhotoInput.Badge>
				</PhotoInput.Well>
				<PhotoInput.Remove
					label={removeLabel}
					icon={removeIcon}
				/>
				<PhotoInput.ValueText
					photoSetLabel={photoSetLabel}
					noPhotoLabel={noPhotoLabel}
				/>
			</PhotoInput.Root>
			<Field.Description id={descriptionId}>
				{description}
			</Field.Description>
			<Field.Error id={errorId}>{errors}</Field.Error>
		</Field.Root>
	);
};
