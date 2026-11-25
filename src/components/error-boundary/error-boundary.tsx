import type { ErrorInfo, ReactNode } from "react";
import {
	type ErrorBoundaryPropsWithRender,
	type FallbackProps,
	ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";
import { Button } from "../button/button.tsx";
import { useCopy } from "../copy-provider/index.ts";
import {
	ErrorMessage,
	type ErrorMessageProps,
} from "../error-message/error-message.tsx";
import { useIcons } from "../icon-provider/index.ts";

type SharedProps = Readonly<{
	children: ReactNode;
	/** Called with what was thrown, such as to log it. */
	onError?: (error: unknown, info: ErrorInfo) => void;
	/** Called when the boundary resets, from a retry or a change in `resetKeys`. */
	onReset?: ErrorBoundaryPropsWithRender["onReset"];
	/** Values that reset the boundary when one of them changes. */
	resetKeys?: ReadonlyArray<unknown>;
}>;

type DefaultFallbackProps = SharedProps &
	Readonly<{
		/** The fallback's title: what happened. */
		title: string;
		/** The fallback's description: what to do next, or who can help. */
		description?: string;
		/** A glyph on the fallback's error disc. */
		icon?: ErrorMessageProps["icon"];
		/** Offers a retry button in the fallback. @default false */
		retryable?: boolean;
		fallbackRender?: never;
	}>;

type CustomFallbackProps = SharedProps &
	Readonly<{
		/** Renders the fallback in place of `ErrorMessage`. */
		fallbackRender: (props: FallbackProps) => ReactNode;
		title?: never;
		description?: never;
		icon?: never;
		retryable?: never;
	}>;

export type ErrorBoundaryProps =
	| DefaultFallbackProps
	| CustomFallbackProps;

const RetryButton = ({
	onRetry,
}: Readonly<{ onRetry: () => void }>): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	return (
		<Button
			variant="primary"
			icon={icons.retry}
			onClick={onRetry}>
			{copy.retry}
		</Button>
	);
};

const defaultFallback =
	({
		title,
		description,
		icon,
		retryable = false,
	}: DefaultFallbackProps) =>
	({ resetErrorBoundary }: FallbackProps): ReactNode => (
		<ErrorMessage
			title={title}
			description={description}
			icon={icon}
			action={
				retryable ? (
					<RetryButton
						onRetry={() => resetErrorBoundary()}
					/>
				) : undefined
			}
		/>
	);

/**
 * Renders a fallback in place of `children` once rendering them throws: an
 * `ErrorMessage` with the given copy, or whatever `fallbackRender` returns.
 *
 * @example
 * <ErrorBoundary title="This widget failed to load" retryable>
 * 	<Widget />
 * </ErrorBoundary>
 */
export const ErrorBoundary = (
	props: ErrorBoundaryProps,
): ReactNode => (
	<ReactErrorBoundary
		fallbackRender={
			props.fallbackRender === undefined
				? defaultFallback(props)
				: props.fallbackRender
		}
		onError={props.onError}
		onReset={props.onReset}
		resetKeys={
			props.resetKeys === undefined
				? undefined
				: [...props.resetKeys]
		}>
		{props.children}
	</ReactErrorBoundary>
);
