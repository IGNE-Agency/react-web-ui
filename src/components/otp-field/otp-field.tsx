import type { ReactNode } from "react";
import { Field, type FieldProps } from "../field/index.ts";
import {
	OtpInput,
	type OtpInputRootProps,
	type OtpSlotLabel,
} from "./otp-input.tsx";
import { Spinner } from "../spinner/index.ts";

export type OtpFieldProps = FieldProps &
	Omit<OtpInputRootProps, keyof FieldProps | "children"> &
	Readonly<{
		/** Names a slot past the first by its 1-based position, such as "character 2 of 6". */
		slotLabel: OtpSlotLabel;
	}>;

/**
 * A labelled one-time-code field: label, a row of character slots, then the
 * description and error. Assembled from `OtpInput`'s parts.
 *
 * @example
 * <OtpField
 * 	label="Verification code"
 * 	optionalLabel="optional"
 * 	slotLabel={(index, total) => `character ${index} of ${total}`}
 * 	value={code}
 * 	onValueChange={setCode}
 * 	length={6}
 * />
 */
export const OtpField = ({
	label,
	description,
	slotLabel,
	optionalLabel,
	...rootProps
}: OtpFieldProps): ReactNode => (
	<OtpInput.Root {...rootProps}>
		<OtpInput.Label>
			{label}{" "}
			<Field.Requiredness optionalLabel={optionalLabel} />
		</OtpInput.Label>
		<OtpInput.Group>
			<OtpInput.Slots slotLabel={slotLabel} />
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
