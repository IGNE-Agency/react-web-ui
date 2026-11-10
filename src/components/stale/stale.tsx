import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentProps,
	createContext,
	type ReactElement,
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

export type StaleRootProps =
	useRender.ComponentProps<"div"> &
		Readonly<{
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
		}>;

export type StaleContentProps =
	useRender.ComponentProps<"div">;

export type StaleOverlayProps =
	useRender.ComponentProps<"div">;

export type StaleStatusProps =
	useRender.ComponentProps<"p">;

export type StaleIllustrationProps =
	useRender.ComponentProps<"span">;

export type StaleMessageProps =
	useRender.ComponentProps<"p"> &
		Readonly<{
			/** The moving indicator above the copy, such as the app's animated logo. @default <Spinner size={2} /> */
			illustration?: ReactNode;
			/** What the overlay says, such as "This is taking longer than usual." */
			children: ReactNode;
		}>;

export type StaleRetryProps = Omit<
	ComponentProps<"button">,
	"ref" | "children" | "onClick"
> &
	Readonly<{
		onRetry: () => void;
		/** The retry's label, such as "Try again". */
		children: ReactNode;
	}>;

/** The region that refreshes, holding how long the refresh has run in its `data-phase`. */
const Root = ({
	busy,
	busyAfter,
	busyMinDuration,
	slowAfter,
	stuckAfter,
	render,
	className,
	ref,
	...props
}: StaleRootProps): ReactNode => {
	const phase = useBusyPhase({
		busy,
		busyAfter,
		busyMinDuration,
		slowAfter,
		stuckAfter,
	});
	const element = useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			"data-phase": phase,
			className: clsx(style.root, className),
		},
	});

	return (
		<StaleContext value={phase}>{element}</StaleContext>
	);
};

/** The content that stays on screen: dimmed and busy once the refresh is seen, inert once overlaid. */
const Content = ({
	render,
	className,
	ref,
	...props
}: StaleContentProps): ReactElement => {
	const phase = usePhase();
	const busy = phase !== "fresh";
	return useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			"data-busy": busy || undefined,
			"aria-busy": busy || undefined,
			inert: isOverlaid(phase),
			className: clsx(style.content, className),
		},
	});
};

/** What covers the content once the refresh is slow, fading in and out. */
const Overlay = ({
	render,
	className,
	ref,
	...props
}: StaleOverlayProps): ReactElement | null => {
	const phase = usePhase();
	const overlayRef = useRef<HTMLDivElement>(null);
	const presence = usePresence(
		isOverlaid(phase),
		overlayRef,
	);
	return useRender({
		defaultTagName: "div",
		render,
		ref: ref === undefined ? overlayRef : [overlayRef, ref],
		enabled: presence.mounted,
		props: {
			...props,
			...presence.props,
			className: clsx(style.overlay, className),
		},
	});
};

/**
 * The overlay's status line, announced as it appears: an `Illustration` over
 * its copy.
 *
 * @example
 * <Stale.Status>
 * 	<Stale.Illustration><Logo animated /></Stale.Illustration>
 * 	This is taking longer than usual.
 * </Stale.Status>
 */
const Status = ({
	render,
	className,
	ref,
	...props
}: StaleStatusProps): ReactElement =>
	useRender({
		defaultTagName: "p",
		render,
		ref,
		props: {
			role: "status",
			...props,
			className: clsx(style.message, className),
		},
	});

/**
 * The moving indicator above the status's copy, such as a spinner or the
 * app's animated logo, hidden from assistive technology.
 *
 * @example
 * <Stale.Illustration><Spinner size={2} /></Stale.Illustration>
 */
const Illustration = ({
	render,
	className,
	ref,
	...props
}: StaleIllustrationProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.illustration, className),
		},
	});

/** The overlay's status: a moving indicator over its copy, a spinner unless `illustration` names another. */
const Message = ({
	illustration,
	children,
	...props
}: StaleMessageProps): ReactElement => (
	<Status {...props}>
		<Illustration>
			{illustration ?? <Spinner size={2} />}
		</Illustration>
		{children}
	</Status>
);

/** The way out once the refresh looks stuck: a button that appears only then. */
const Retry = ({
	onRetry,
	children,
	className,
	...props
}: StaleRetryProps): ReactNode => {
	const phase = usePhase();
	const retryRef = useRef<HTMLButtonElement>(null);
	const presence = usePresence(phase === "stuck", retryRef);
	if (!presence.mounted) {
		return null;
	}
	return (
		<Button
			variant="tertiary"
			size="sm"
			{...props}
			ref={retryRef}
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
	Status: typeof Status;
	Illustration: typeof Illustration;
	Retry: typeof Retry;
}>;

/**
 * Content that stays visible while a background refresh runs, escalating the
 * longer the refresh takes: `Content` dims once busy, `Overlay` surfaces once
 * slow with its `Message`, and `Retry` appears once stuck. A refresh that
 * finishes within `busyAfter` shows nothing. `Message` composes a `Status`
 * and its `Illustration`, which compose one by hand.
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
	Status,
	Illustration,
	Retry,
};
