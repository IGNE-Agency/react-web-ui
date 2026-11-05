import type { ReactNode } from "react";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import {
	Field,
	type FieldProps,
	useFieldIds,
} from "../field/index.ts";
import {
	PhotoInput,
	type PhotoInputProps,
} from "./photo-input.tsx";

export type PhotoFieldProps = Omit<
	PhotoInputProps,
	"labelledBy" | "describedBy" | "invalid" | "pending"
> &
	FieldProps &
	Readonly<{
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
 * 	previewLabel="Preview"
 * 	photoSetLabel="Photo set"
 * 	noPhotoLabel="No photo"
 * 	removeLabel="Remove photo"
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
	...controlProps
}: PhotoFieldProps): ReactNode => {
	const ids = useFieldIds();
	const { labelId, descriptionId, errorId } = ids;
	const invalid = normalizeFieldErrors(errors).length > 0;

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
			<PhotoInput
				{...controlProps}
				labelledBy={labelId}
				describedBy={ids.describedBy(
					description !== undefined,
					invalid,
				)}
				readOnly={readOnly}
				invalid={invalid}
				pending={pending}
			/>
			<Field.Description id={descriptionId}>
				{description}
			</Field.Description>
			<Field.Error id={errorId}>{errors}</Field.Error>
		</Field.Root>
	);
};
