import type { ErrorInfo, ReactNode } from "react";
import {
	type ErrorBoundaryPropsWithRender,
	type FallbackProps,
	ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";
import { Button } from "../button/button.tsx";
import {
	ErrorMessage,
	type ErrorMessageProps,
} from "../error-message/error-message.tsx";

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
		/** The retry button's label; without it, the fallback offers no retry. */
		retryLabel?: string;
		/** The retry button's leading glyph, such as the app's restart icon. */
		retryIcon?: ReactNode;
		fallbackRender?: never;
	}>;

type CustomFallbackProps = SharedProps &
	Readonly<{
		/** Renders the fallback in place of `ErrorMessage`. */
		fallbackRender: (props: FallbackProps) => ReactNode;
		title?: never;
		description?: never;
		icon?: never;
		retryLabel?: never;
		retryIcon?: never;
	}>;

export type ErrorBoundaryProps =
	| DefaultFallbackProps
	| CustomFallbackProps;

const defaultFallback =
	({
		title,
		description,
		icon,
		retryLabel,
		retryIcon,
	}: DefaultFallbackProps) =>
	({ resetErrorBoundary }: FallbackProps): ReactNode => (
		<ErrorMessage
			title={title}
			description={description}
			icon={icon}
			action={
				retryLabel === undefined ? undefined : (
					<Button
						variant="primary"
						icon={retryIcon}
						onClick={() => resetErrorBoundary()}>
						{retryLabel}
					</Button>
				)
			}
		/>
	);

/**
 * Renders a fallback in place of `children` once rendering them throws: an
 * `ErrorMessage` with the given copy, or whatever `fallbackRender` returns.
 *
 * @example
 * <ErrorBoundary title="This widget failed to load" retryLabel="Try again">
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
