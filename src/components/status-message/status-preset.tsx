import type { ReactNode } from "react";
import type { Tone } from "../../lib/tone.ts";
import {
	StatusMessage,
	type StatusMessageLive,
} from "./status-message.tsx";

/** What a status preset such as `EmptyMessage` or `ErrorMessage` shows. */
export type StatusPresetProps = Readonly<{
	/** What the region says, such as "No invoices yet". */
	title: string;
	/** What would change it, or who can help. */
	description?: string;
	/** The app's icon, on a disc in the preset's tone. Left out, none shows. */
	icon?: ReactNode;
	/** A way on, such as a button to add one or a retry. */
	action?: ReactNode;
	className?: string;
}>;

/**
 * A status message announced as `live`, with its icon on a `tone` disc.
 *
 * @example
 * <StatusPreset live="status" tone="neutral" title="No invoices yet" />
 */
export const StatusPreset = ({
	live,
	tone,
	title,
	description,
	icon,
	action,
	className,
}: StatusPresetProps &
	Readonly<{
		live: StatusMessageLive;
		tone: Tone;
	}>): ReactNode => (
	<StatusMessage.Root live={live} className={className}>
		{icon === undefined ? null : (
			<StatusMessage.Icon tone={tone}>
				{icon}
			</StatusMessage.Icon>
		)}
		<StatusMessage.Title>{title}</StatusMessage.Title>
		{description === undefined ? null : (
			<StatusMessage.Description>
				{description}
			</StatusMessage.Description>
		)}
		{action === undefined ? null : (
			<StatusMessage.Action>{action}</StatusMessage.Action>
		)}
	</StatusMessage.Root>
);
