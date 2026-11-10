import {
	Toast as BaseToast,
	type ToastRootToastObject,
} from "@base-ui/react/toast";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	Fragment,
	type ReactNode,
	useEffect,
} from "react";
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

export type ToastProviderPartProps = Readonly<{
	/** The app, and the `Portal` holding the `Viewport`. */
	children: ReactNode;
}>;

/**
 * Provides the global {@link toastManager} to the parts inside it. It renders
 * no element of its own.
 *
 * @example
 * <Toast.Provider>
 * 	<App />
 * 	<Toast.Portal>
 * 		<Toast.Viewport aria-label="Notifications">…</Toast.Viewport>
 * 	</Toast.Portal>
 * </Toast.Provider>
 */
const Provider = ({
	children,
}: ToastProviderPartProps): ReactNode => {
	useEffect(flushBufferedToasts, []);

	return (
		<BaseToast.Provider toastManager={toastManager}>
			{children}
		</BaseToast.Provider>
	);
};

export type ToastViewportProps = Omit<
	BaseToast.Viewport.Props,
	"className" | "aria-label"
> &
	Readonly<{
		/** The region's name, reached with F6, such as "Notifications". */
		"aria-label": string;
		className?: string;
	}>;

/**
 * The region the toasts stack in, at the corner of the screen.
 *
 * @example
 * <Toast.Viewport aria-label="Notifications">{toasts}</Toast.Viewport>
 */
const Viewport = ({
	className,
	...props
}: ToastViewportProps): ReactNode => (
	<BaseToast.Viewport
		{...props}
		className={clsx(styles.viewport, className)}
	/>
);

/**
 * A toast's frame, in its tone: a dialog that holds the other parts.
 *
 * @example
 * <Toast.Root toast={toast}>…</Toast.Root>
 */
const Root = ({
	toast,
	className,
	...props
}: ToastRootProps): ReactNode => (
	<BaseToast.Root
		toast={toast}
		data-tone={toast.data?.tone}
		{...props}
		className={clsx(styles.toast, className)}
	/>
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

export type ToastCloseProps = Omit<
	BaseToast.Close.Props,
	"className" | "render"
> &
	Readonly<{
		/** The button to render, such as `<IconButton label="Close" variant="tertiary" size="sm"><CloseIcon /></IconButton>`. */
		render: NonNullable<BaseToast.Close.Props["render"]>;
		className?: string;
	}>;

/**
 * The button that closes the toast, exposed to assistive tech whether or not
 * the stack is expanded. It renders whichever button it is given.
 *
 * @example
 * <Toast.Close render={<IconButton label="Close" variant="tertiary" size="sm"><CloseIcon /></IconButton>} />
 */
const Close = ({
	className,
	...props
}: ToastCloseProps): ReactNode => (
	<BaseToast.Close
		aria-hidden={undefined}
		{...props}
		className={clsx(styles.close, className)}
	/>
);

/** The parts of a toast, for `ToastProvider`'s `renderToast` or a viewport of the app's own. */
export type ToastParts = Readonly<{
	Provider: typeof Provider;
	Portal: typeof BaseToast.Portal;
	Viewport: typeof Viewport;
	Root: typeof Root;
	Icon: typeof Icon;
	Title: typeof Title;
	Description: typeof Description;
	Actions: typeof Actions;
	Close: typeof Close;
}>;

/**
 * The parts of the toast system: the `Provider`, the `Portal` and the
 * `Viewport` the toasts stack in, and for one toast the `Root` frame in its
 * tone, the `Icon`, `Title`, `Description` and `Actions`, and the `Close`
 * button. `ToastProvider` assembles the first three.
 *
 * @example
 * <Toast.Root toast={toast}>
 * 	<Toast.Title>{toast.data?.body}</Toast.Title>
 * 	<Toast.Close
 * 		render={
 * 			<IconButton label="Close" variant="tertiary" size="sm">
 * 				<CloseIcon />
 * 			</IconButton>
 * 		}
 * 	/>
 * </Toast.Root>
 */
export const Toast: ToastParts = {
	Provider,
	Portal: BaseToast.Portal,
	Viewport,
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
					<Close
						render={
							<IconButton
								variant="tertiary"
								size="sm"
								label={closeLabel}>
								{closeIcon}
							</IconButton>
						}
					/>
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
 * Mounts the toast system once at the app root: the `Toast.Provider`, and the
 * `Toast.Viewport` in its `Toast.Portal` alongside the app, drawing each toast.
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
}: ToastProviderProps): ReactNode => (
	<Provider>
		{children}
		<BaseToast.Portal>
			<Viewport aria-label={viewportLabel}>
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
			</Viewport>
		</BaseToast.Portal>
	</Provider>
);
