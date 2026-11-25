import type { ReactNode } from "react";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import { Field, type FieldProps } from "../field/index.ts";
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
 * `aria-labelledby` and also announces whether a photo is set. Assembled from
 * `PhotoInput`'s parts.
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
	defaultPreview,
	icon,
	...rootProps
}: PhotoFieldProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();

	return (
		<PhotoInput.Root {...rootProps}>
			<PhotoInput.Label>
				{label} <Field.Requiredness />
			</PhotoInput.Label>
			<PhotoInput.Group>
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
			</PhotoInput.Group>
			<PhotoInput.Description>
				{description}
			</PhotoInput.Description>
			<PhotoInput.Error />
		</PhotoInput.Root>
	);
};
