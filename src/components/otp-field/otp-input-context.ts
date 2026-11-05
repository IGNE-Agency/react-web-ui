import type { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { type Context, createContext } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import type {
	FieldBlurHandler,
	FieldState,
} from "../field/index.ts";

/** The behavioural props a caller hands `Root`, which `Group` passes on to base-ui. */
export type OtpInputBaseProps = Pick<
	BaseOTPField.Root.Props,
	| "onValueComplete"
	| "validationType"
	| "mask"
	| "autoSubmit"
	| "disabled"
	| "readOnly"
	| "name"
	| "id"
> &
	Readonly<{
		onBlur?: FieldBlurHandler;
	}>;

/** What an OTP input's `Root` hands its parts. */
export type OtpInputContextValue = Readonly<{
	/** Projected by `Root`; every part reads it, none of them own it. */
	state: FieldState;
	length: number;
	base: OtpInputBaseProps &
		Readonly<{
			value: string;
			onValueChange: (value: string) => void;
			length: number;
		}>;
}>;

/** The context an OTP input's `Root` provides. */
export const OtpInputContext: Context<OtpInputContextValue | null> =
	createContext<OtpInputContextValue | null>(null);

/**
 * The surrounding OTP input's projected state and slot count.
 *
 * @example
 * const { length } = useOtpInputContext();
 */
export const useOtpInputContext =
	(): OtpInputContextValue =>
		useRequiredContext(
			OtpInputContext,
			"OTP input parts must be rendered within <OtpInput.Root>.",
		);
