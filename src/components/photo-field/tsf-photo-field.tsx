import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	PhotoField,
	type PhotoFieldProps,
} from "./photo-field.tsx";
import type { PhotoInputPreviewProps } from "./photo-input.tsx";

export type TSFPhotoFieldProps = Omit<
	PhotoFieldProps,
	| keyof ConnectedFieldProps
	| keyof PhotoInputPreviewProps
	| "value"
	| "onValueChange"
> &
	PhotoInputPreviewProps &
	Readonly<{
		/** Runs alongside the field's own change handling, for side effects. */
		onValueChange?: (file: File | undefined) => void;
	}>;

/**
 * `PhotoField` bound to the TanStack Form field it renders in, reached as
 * `field.PhotoField`. The field's value is the picked `File`, or nothing while
 * the stored photo stands.
 *
 * @example
 * <form.AppField name="photo">
 * 	{field => <field.PhotoField label="Profile photo" optionalLabel="optional" hasStoredImage defaultPreview={<Avatar name={user.name} src={user.photo} />} {...photoCopy} />}
 * </form.AppField>
 */
export const TSFPhotoField = ({
	onValueChange,
	...props
}: TSFPhotoFieldProps): ReactNode => {
	const { field, props: connected } = useConnectedField<
		File | undefined
	>();

	return (
		<PhotoField
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={file => {
				field.handleChange(file);
				onValueChange?.(file);
			}}
		/>
	);
};
