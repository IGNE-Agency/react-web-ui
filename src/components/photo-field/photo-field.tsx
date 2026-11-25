import type { ReactNode } from "react";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import {
	Field,
	type FieldProps,
	useFieldState,
} from "../field/index.ts";
import { RequiredSpokenContext } from "../field/required-spoken.ts";
import { useIcons } from "../icon-provider/index.ts";
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
 * 	value={file}
 * 	onValueChange={setFile}
 * 	hasStoredImage={user.photo !== null}
 * 	defaultPreview={<Avatar name={user.name} />}
 * 	accept={["image/png", "image/jpeg"]}
 * 	icon={<PhotoCameraIcon />}
 * />
 */
export const PhotoField = ({
	label,
	description,
	errors,
	requiredness,
	dirty,
	touched,
	pending,
	readOnly,
	className,
	defaultPreview,
	hasStoredImage,
	icon,
	...controlProps
}: PhotoFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
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
			disabled={field.disabled}
			invalid={invalid}
			dirty={dirty}
			touched={touched}>
			<Field.Label
				id={labelId}
				nativeLabel={false}
				render={<span />}>
				{label}{" "}
				<RequiredSpokenContext value={true}>
					<Field.Requiredness requiredness={requiredness} />
				</RequiredSpokenContext>
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
					<PhotoInput.Face>
						<PhotoInput.Image alt={copy.photo.preview} />
						<PhotoInput.Fallback>
							{defaultPreview}
						</PhotoInput.Fallback>
					</PhotoInput.Face>
					<PhotoInput.Badge>{icon}</PhotoInput.Badge>
				</PhotoInput.Well>
				<PhotoInput.Remove
					render={
						<IconButton
							label={copy.photo.remove}
							variant="secondary">
							{icons.remove}
						</IconButton>
					}
				/>
				<PhotoInput.ValueText />
			</PhotoInput.Root>
			<Field.Description id={descriptionId}>
				{description}
			</Field.Description>
			<Field.Error id={errorId}>{errors}</Field.Error>
		</Field.Root>
	);
};
