import type { ReactNode } from "react";
import { Field, type FieldProps } from "../field/index.ts";
import {
	OtpInput,
	type OtpInputRootProps,
} from "./otp-input.tsx";
import { Spinner } from "../spinner/index.ts";

export type OtpFieldProps = FieldProps &
	Omit<OtpInputRootProps, keyof FieldProps | "children">;

/**
 * A labelled one-time-code field: label, a row of character slots, then the
 * description and error. Assembled from `OtpInput`'s parts.
 *
 * @example
 * <OtpField
 * 	label="Verification code"
 * 	value={code}
 * 	onValueChange={setCode}
 * 	length={6}
 * />
 */
export const OtpField = ({
	label,
	description,
	...rootProps
}: OtpFieldProps): ReactNode => (
	<OtpInput.Root {...rootProps}>
		<OtpInput.Label>
			{label} <Field.Requiredness />
		</OtpInput.Label>
		<OtpInput.Group>
			<OtpInput.Slots />
			<OtpInput.Pending>
				<Spinner size={1} />
			</OtpInput.Pending>
		</OtpInput.Group>
		<OtpInput.Description>
			{description}
		</OtpInput.Description>
		<OtpInput.Error />
	</OtpInput.Root>
);
