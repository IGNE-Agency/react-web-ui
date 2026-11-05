import type { ReactNode } from "react";
import {
	StatusPreset,
	type StatusPresetProps,
} from "../status-message/status-preset.tsx";

export type EmptyMessageProps = StatusPresetProps;

/**
 * What a region shows when its content arrived and holds nothing: an icon on a
 * neutral disc, a title, a description and a way on. Announced politely as a
 * status.
 *
 * @example
 * <EmptyMessage
 * 	icon={InboxIcon}
 * 	title="No declarations yet"
 * 	description="Declarations you send show up here."
 * />
 */
export const EmptyMessage = (
	props: EmptyMessageProps,
): ReactNode => (
	<StatusPreset live="status" tone="neutral" {...props} />
);
