import type { ReactNode } from "react";
import {
	StatusPreset,
	type StatusPresetProps,
} from "../status-message/status-preset.tsx";

export type ErrorMessageProps = StatusPresetProps;

/**
 * What a region shows when its content failed to arrive: an icon on an error
 * disc, a title, a description and a way on. Announced at once as an alert.
 *
 * @example
 * <ErrorMessage
 * 	title="The invoices could not be loaded"
 * 	description="Check your connection and try again."
 * 	action={<Button onClick={refetch}>Try again</Button>}
 * />
 */
export const ErrorMessage = (
	props: ErrorMessageProps,
): ReactNode => (
	<StatusPreset live="alert" tone="error" {...props} />
);
