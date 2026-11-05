import { clsx } from "clsx";
import {
	createContext,
	type ReactNode,
	useRef,
} from "react";
import {
	type BusyPhase,
	useBusyPhase,
} from "../../lib/hooks/use-busy-phase.ts";
import { usePresence } from "../../lib/hooks/use-presence.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { Button } from "../button/button.tsx";
import { Spinner } from "../spinner/spinner.tsx";
import style from "./stale.module.scss";

const StaleContext = createContext<BusyPhase | null>(null);

const usePhase = (): BusyPhase =>
	useRequiredContext(
		StaleContext,
		"Stale.* must be rendered inside <Stale.Root>.",
	);

const isOverlaid = (phase: BusyPhase): boolean =>
	phase === "slow" || phase === "stuck";

export type StaleRootProps = Readonly<{
	/** Whether a background refresh is in flight. */
	busy: boolean;
	/** Ms of `busy` before anything is shown at all. @default 150 */
	busyAfter?: number;
	/**
	 * Ms the busy treatment stays up once shown, even if the refresh finishes
	 * sooner. @default 200
	 */
	busyMinDuration?: number;
	/** Ms of `busy` before the overlay surfaces. @default 4000 */
	slowAfter?: number;
	/** Ms of `busy` before the retry appears. @default 8000 */
	stuckAfter?: number;
	children?: ReactNode;
	className?: string;
}>;

export type StaleContentProps = Readonly<{
	children?: ReactNode;
	className?: string;
}>;

export type StaleOverlayProps = Readonly<{
	children?: ReactNode;
	className?: string;
}>;

export type StaleMessageProps = Readonly<{
	/** The moving indicator above the copy, such as the app's animated logo. @default <Spinner size={2} /> */
	illustration?: ReactNode;
	/** What the overlay says, such as "This is taking longer than usual." */
	children: ReactNode;
	className?: string;
}>;

export type StaleRetryProps = Readonly<{
	onRetry: () => void;
	/** The retry's label, such as "Try again". */
	children: ReactNode;
	className?: string;
}>;

const Root = ({
	busy,
	busyAfter,
	busyMinDuration,
	slowAfter,
	stuckAfter,
	children,
	className,
}: StaleRootProps): ReactNode => {
	const phase = useBusyPhase({
		busy,
		busyAfter,
		busyMinDuration,
		slowAfter,
		stuckAfter,
	});

	return (
		<StaleContext value={phase}>
			<div
				className={clsx(style.root, className)}
				data-phase={phase}>
				{children}
			</div>
		</StaleContext>
	);
};

const Content = ({
	children,
	className,
}: StaleContentProps): ReactNode => {
	const phase = usePhase();
	const busy = phase !== "fresh";
	return (
		<div
			className={clsx(style.content, className)}
			data-busy={busy || undefined}
			aria-busy={busy || undefined}
			inert={isOverlaid(phase)}>
			{children}
		</div>
	);
};

const Overlay = ({
	children,
	className,
}: StaleOverlayProps): ReactNode => {
	const phase = usePhase();
	const overlayRef = useRef<HTMLDivElement>(null);
	const presence = usePresence(
		isOverlaid(phase),
		overlayRef,
	);
	if (!presence.mounted) {
		return null;
	}
	return (
		<div
			ref={overlayRef}
			className={clsx(style.overlay, className)}
			{...presence.props}>
			{children}
		</div>
	);
};

const Message = ({
	illustration,
	children,
	className,
}: StaleMessageProps): ReactNode => (
	<p
		className={clsx(style.message, className)}
		role="status">
		<span className={style.illustration} aria-hidden="true">
			{illustration ?? <Spinner size={2} />}
		</span>
		{children}
	</p>
);

const Retry = ({
	onRetry,
	children,
	className,
}: StaleRetryProps): ReactNode => {
	const phase = usePhase();
	const retryRef = useRef<HTMLButtonElement>(null);
	const presence = usePresence(phase === "stuck", retryRef);
	if (!presence.mounted) {
		return null;
	}
	return (
		<Button
			ref={retryRef}
			variant="tertiary"
			size="sm"
			onClick={onRetry}
			className={clsx(style.retry, className)}
			{...presence.props}>
			{children}
		</Button>
	);
};

type StaleNamespace = Readonly<{
	Root: typeof Root;
	Content: typeof Content;
	Overlay: typeof Overlay;
	Message: typeof Message;
	Retry: typeof Retry;
}>;

/**
 * Content that stays visible while a background refresh runs, escalating the
 * longer the refresh takes: `Content` dims once busy, `Overlay` surfaces once
 * slow with its `Message`, and `Retry` appears once stuck. A refresh that
 * finishes within `busyAfter` shows nothing.
 *
 * @example
 * <Stale.Root busy={query.isFetching}>
 * 	<Stale.Content>{table}</Stale.Content>
 * 	<Stale.Overlay>
 * 		<Stale.Message>This is taking longer than usual.</Stale.Message>
 * 		<Stale.Retry onRetry={() => query.refetch()}>Try again</Stale.Retry>
 * 	</Stale.Overlay>
 * </Stale.Root>
 */
export const Stale: StaleNamespace = {
	Root,
	Content,
	Overlay,
	Message,
	Retry,
};
