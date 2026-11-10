import {
	Toast as BaseToast,
	type ToastRootToastObject,
} from "@base-ui/react/toast";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	createContext,
	Fragment,
	type ReactNode,
	useEffect,
} from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { Button, IconButton } from "../button/button.tsx";
import {
	flushBufferedToasts,
	type ToastData,
	toastManager,
} from "./toast.ts";
import styles from "./toast-provider.module.scss";

/** One toast in the viewport, as `ToastProvider` hands it to `renderToast`. */
export type ToastObject = ToastRootToastObject<ToastData>;

export type ToastRootProps = Omit<
	BaseToast.Root.Props,
	"toast" | "className"
> &
	Readonly<{
		/** The toast this frame shows, as `renderToast` received it. */
		toast: ToastObject;
		className?: string;
	}>;

const ToastIdContext = createContext<string | null>(null);

/** A toast's frame, in its tone: a dialog that holds the other parts. */
const Root = ({
	toast,
	className,
	...props
}: ToastRootProps): ReactNode => (
	<ToastIdContext value={toast.id}>
		<BaseToast.Root
			toast={toast}
			data-tone={toast.data?.tone}
			{...props}
			className={clsx(styles.toast, className)}
		/>
	</ToastIdContext>
);

export type ToastIconProps = ComponentPropsWithRef<"span">;

/** The caller's glyph before the title, sized and coloured by the toast. Renders nothing without children. */
const Icon = ({
	className,
	children,
	...props
}: ToastIconProps): ReactNode =>
	children === undefined ||
	children === null ||
	children === false ? null : (
		<span
			aria-hidden="true"
			{...props}
			className={clsx(styles.icon, className)}>
			{children}
		</span>
	);

export type ToastTitleProps = Omit<
	BaseToast.Title.Props,
	"className"
> &
	Readonly<{ className?: string }>;

/** The toast's heading, which names its dialog. */
const Title = ({
	className,
	...props
}: ToastTitleProps): ReactNode => (
	<BaseToast.Title
		{...props}
		className={clsx(styles.title, className)}
	/>
);

export type ToastDescriptionProps = Omit<
	BaseToast.Description.Props,
	"className"
> &
	Readonly<{ className?: string }>;

/** The text under the title, which describes its dialog. */
const Description = ({
	className,
	...props
}: ToastDescriptionProps): ReactNode => (
	<BaseToast.Description
		{...props}
		className={clsx(styles.description, className)}
	/>
);

export type ToastActionsProps =
	ComponentPropsWithRef<"div">;

/** The row of buttons under the text, re-coloured for the toast's tone. */
const Actions = ({
	className,
	...props
}: ToastActionsProps): ReactNode => (
	<div
		{...props}
		className={clsx(styles.actions, className)}
	/>
);

export type ToastCloseProps = Readonly<{
	/** Accessible name, such as "Close", surfaced as the tooltip hint and the `aria-label`. */
	label: string;
	/** The close glyph. */
	children: ReactNode;
	className?: string;
}>;

/** The icon-only button that closes the toast, named for every input. */
const Close = ({
	label,
	children,
	className,
}: ToastCloseProps): ReactNode => {
	const id = useRequiredContext(
		ToastIdContext,
		"Toast.Close must be rendered inside <Toast.Root>.",
	);
	const { close } = BaseToast.useToastManager();

	return (
		<IconButton
			className={clsx(styles.close, className)}
			variant="tertiary"
			size="sm"
			label={label}
			onClick={() => {
				close(id);
			}}>
			{children}
		</IconButton>
	);
};

/** The parts of a toast, for `ToastProvider`'s `renderToast`. */
export type ToastParts = Readonly<{
	Root: typeof Root;
	Icon: typeof Icon;
	Title: typeof Title;
	Description: typeof Description;
	Actions: typeof Actions;
	Close: typeof Close;
}>;

/**
 * The parts of one toast: the `Root` frame in its tone, the `Icon`, `Title`,
 * `Description` and `Actions`, and the `Close` button.
 *
 * @example
 * <Toast.Root toast={toast}>
 * 	<Toast.Title>{toast.data?.body}</Toast.Title>
 * 	<Toast.Close label="Close"><CloseIcon /></Toast.Close>
 * </Toast.Root>
 */
export const Toast: ToastParts = {
	Root,
	Icon,
	Title,
	Description,
	Actions,
	Close,
};

type DefaultToastProps = Readonly<{
	toast: ToastObject;
	closeLabel: string;
	closeIcon: ReactNode;
}>;

const DefaultToast = ({
	toast,
	closeLabel,
	closeIcon,
}: DefaultToastProps): ReactNode => {
	const { data } = toast;

	return (
		<Root toast={toast}>
			{data === undefined ? null : (
				<>
					<Icon>{data.icon}</Icon>
					<Title>{data.title ?? data.body}</Title>
					<Close label={closeLabel}>{closeIcon}</Close>
					{data.title === undefined ? null : (
						<Description>{data.body}</Description>
					)}
					{data.actions && data.actions.length > 0 ? (
						<Actions>
							{data.actions.map(action => (
								<Button
									key={action.label}
									size="sm"
									variant={action.variant ?? "secondary"}
									onClick={action.onClick}>
									{action.label}
								</Button>
							))}
						</Actions>
					) : null}
				</>
			)}
		</Root>
	);
};

type ToastListProps = Readonly<{
	renderToast: (toast: ToastObject) => ReactNode;
}>;

const ToastList = ({
	renderToast,
}: ToastListProps): ReactNode => {
	const { toasts } = BaseToast.useToastManager<ToastData>();

	return toasts.map(toast => (
		<Fragment key={toast.id}>{renderToast(toast)}</Fragment>
	));
};

export type ToastProviderProps = Readonly<{
	/** Accessible name of each toast's close button, also its tooltip. */
	closeLabel: string;
	/** The close button's glyph. */
	closeIcon: ReactNode;
	/** Accessible name of the region the toasts appear in, reached with F6. */
	viewportLabel: string;
	/** Draws each toast from the `Toast` parts, in place of the default. */
	renderToast?: (toast: ToastObject) => ReactNode;
	/** The app, which the viewport renders beside. */
	children: ReactNode;
}>;

/**
 * Mounts the toast system once at the app root: provides the global
 * {@link toastManager} to base-ui and renders the viewport alongside the app.
 *
 * @example
 * <ToastProvider closeLabel="Close" closeIcon={<CloseIcon />} viewportLabel="Notifications">
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider = ({
	closeLabel,
	closeIcon,
	viewportLabel,
	renderToast,
	children,
}: ToastProviderProps): ReactNode => {
	useEffect(flushBufferedToasts, []);

	return (
		<BaseToast.Provider toastManager={toastManager}>
			{children}
			<BaseToast.Portal>
				<BaseToast.Viewport
					className={styles.viewport}
					aria-label={viewportLabel}>
					<ToastList
						renderToast={
							renderToast ??
							(toast => (
								<DefaultToast
									toast={toast}
									closeLabel={closeLabel}
									closeIcon={closeIcon}
								/>
							))
						}
					/>
				</BaseToast.Viewport>
			</BaseToast.Portal>
		</BaseToast.Provider>
	);
};
