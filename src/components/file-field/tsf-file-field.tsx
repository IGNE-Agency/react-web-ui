import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	FileField,
	type FileFieldProps,
} from "./file-field.tsx";

export type TSFFileFieldProps = Omit<
	FileFieldProps,
	keyof ConnectedFieldProps | "value" | "onValueChange"
>;

/**
 * `FileField` bound to the TanStack Form field it renders in, reached as
 * `field.FileField`. The field's value is the staged `File` list.
 *
 * @example
 * <form.AppField name="attachments">
 * 	{field => <field.FileField label="Attachments" optionalLabel="optional" maxFileSize={limit} {...fileCopy} />}
 * </form.AppField>
 */
export const TSFFileField = (
	props: TSFFileFieldProps,
): ReactNode => {
	const { field, props: connected } =
		useConnectedField<readonly File[]>();

	return (
		<FileField
			{...props}
			errors={connected.errors}
			dirty={connected.dirty}
			touched={connected.touched}
			pending={connected.pending}
			onBlur={connected.onBlur}
			value={field.state.value}
			onValueChange={files => field.handleChange(files)}
		/>
	);
};
