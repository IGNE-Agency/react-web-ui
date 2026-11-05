import type { ReactNode } from "react";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import { Spinner } from "../spinner/spinner.tsx";
import { StatusMessage } from "../status-message/status-message.tsx";

export type LoadingMessageProps = Readonly<{
	/** What the wait says and is announced as, such as "Loading your invoices". */
	title: string;
	/** A line under the title, such as what the wait is for. */
	description?: string;
	/** The moving indicator, such as the app's animated logo. @default <Spinner size={2.5} /> */
	illustration?: ReactNode;
	/** Ms before the message shows and is announced. @default 150 */
	busyAfter?: number;
	className?: string;
}>;

/**
 * A region's wait for its first content: a moving indicator and a title. Its
 * live region is in place from the start and stays empty until the wait has
 * lasted `busyAfter`, so a quick load shows nothing and a slow one is
 * announced once.
 *
 * @example
 * <LoadingMessage title="Loading your invoices" illustration={<Logo />} />
 */
export const LoadingMessage = ({
	title,
	description,
	illustration,
	busyAfter,
	className,
}: LoadingMessageProps): ReactNode => {
	const phase = useBusyPhase({ busy: true, busyAfter });

	return (
		<StatusMessage.Root live="status" className={className}>
			{phase === "fresh" ? null : (
				<>
					<StatusMessage.Illustration>
						{illustration ?? <Spinner size={2.5} />}
					</StatusMessage.Illustration>
					<StatusMessage.Title>{title}</StatusMessage.Title>
					{description === undefined ? null : (
						<StatusMessage.Description>
							{description}
						</StatusMessage.Description>
					)}
				</>
			)}
		</StatusMessage.Root>
	);
};
