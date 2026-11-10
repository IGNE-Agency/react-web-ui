import { AlertDialog } from "@base-ui/react/alert-dialog";
import { clsx } from "clsx";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	useContext,
	useRef,
	useState,
} from "react";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import {
	Button,
	type ButtonTone,
} from "../button/button.tsx";
import {
	Spinner,
	type SpinnerProps,
} from "../spinner/spinner.tsx";
import styles from "./confirm-dialog.module.scss";

/** What a confirm runs: a promise keeps the dialog open and busy until it settles. */
export type ConfirmAction = () => void | Promise<unknown>;

type ConfirmAttempt = Readonly<{
	pending: boolean;
	confirm: (onConfirm: ConfirmAction) => void;
	reset: () => void;
}>;

const ConfirmContext = createContext<ConfirmAttempt>({
	pending: false,
	confirm: onConfirm => {
		void onConfirm();
	},
	reset: () => undefined,
});

const useConfirmAttempt = (
	close: () => void,
): ConfirmAttempt => {
	const [pending, setPending] = useState(false);
	const current = useRef<symbol | null>(null);

	const settle = (token: symbol, resolved: boolean) => {
		if (current.current !== token) {
			return;
		}
		current.current = null;
		setPending(false);
		if (resolved) {
			close();
		}
	};

	const confirm = (onConfirm: ConfirmAction) => {
		if (current.current !== null) {
			return;
		}
		const result = onConfirm();
		if (!(result instanceof Promise)) {
			close();
			return;
		}
		const token = Symbol("confirm");
		current.current = token;
		setPending(true);
		void result.then(
			() => settle(token, true),
			() => settle(token, false),
		);
	};

	const reset = () => {
		current.current = null;
		setPending(false);
	};

	return { pending, confirm, reset };
};

export type ConfirmDialogRootProps = Readonly<{
	/** Controlled open state. */
	open: boolean;
	/** Fired when the dialog requests to open or close. Never fired to close while a confirm is pending. */
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
}>;

/**
 * Holds the controlled alert dialog's open state and its confirm for the parts
 * inside it. It renders no element of its own.
 *
 * @example
 * <ConfirmDialog.Root open={open} onOpenChange={setOpen}>
 * 	<ConfirmDialog.Content>…</ConfirmDialog.Content>
 * </ConfirmDialog.Root>
 */
const ConfirmDialogRoot = ({
	open,
	onOpenChange,
	children,
}: ConfirmDialogRootProps): ReactNode => {
	const attempt = useConfirmAttempt(() =>
		onOpenChange(false),
	);

	return (
		<AlertDialog.Root
			open={open}
			onOpenChange={next => {
				if (!attempt.pending) {
					onOpenChange(next);
				}
			}}
			onOpenChangeComplete={next => {
				if (!next) {
					attempt.reset();
				}
			}}>
			<ConfirmContext value={attempt}>
				{children}
			</ConfirmContext>
		</AlertDialog.Root>
	);
};

/**
 * The dimmed layer behind the dialog.
 *
 * @example
 * <ConfirmDialog.Backdrop />
 */
const ConfirmDialogBackdrop = ({
	className,
	...props
}: AlertDialog.Backdrop.Props): ReactNode => (
	<AlertDialog.Backdrop
		className={clsx(styles.backdrop, className)}
		{...props}
	/>
);

/**
 * The dialog's surface, marked busy while a confirm is pending.
 *
 * @example
 * <ConfirmDialog.Popup>…</ConfirmDialog.Popup>
 */
const ConfirmDialogPopup = ({
	className,
	...props
}: AlertDialog.Popup.Props): ReactNode => {
	const { pending } = useContext(ConfirmContext);

	return (
		<AlertDialog.Popup
			className={clsx(styles.popup, className)}
			aria-busy={pending || undefined}
			{...props}
		/>
	);
};

export type ConfirmDialogContentProps =
	AlertDialog.Popup.Props &
		Readonly<{
			/** The element the dialog is portalled into. @default document.body */
			container?: AlertDialog.Portal.Props["container"];
		}>;

/**
 * `Portal`, `Backdrop` and `Popup` in one: the dialog's surface, above the page.
 *
 * @example
 * <ConfirmDialog.Content>
 * 	<ConfirmDialog.Title>Delete this invoice?</ConfirmDialog.Title>
 * </ConfirmDialog.Content>
 */
const ConfirmDialogContent = ({
	container,
	...props
}: ConfirmDialogContentProps): ReactNode => (
	<AlertDialog.Portal container={container}>
		<ConfirmDialogBackdrop />
		<ConfirmDialogPopup {...props} />
	</AlertDialog.Portal>
);

/** The question the dialog asks. */
const ConfirmDialogTitle = ({
	className,
	...props
}: AlertDialog.Title.Props): ReactNode => (
	<AlertDialog.Title
		className={clsx(styles.title, className)}
		{...props}
	/>
);

/** What confirming does; renders nothing without children. */
const ConfirmDialogDescription = ({
	className,
	children,
	...props
}: AlertDialog.Description.Props): ReactNode =>
	children ? (
		<AlertDialog.Description
			className={clsx(styles.description, className)}
			{...props}>
			{children}
		</AlertDialog.Description>
	) : null;

/** The row the actions sit on, the way out first. */
const ConfirmDialogFooter = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(styles.actions, className)}
		{...props}
	/>
);

export type ConfirmDialogCancelProps = Readonly<{
	children: ReactNode;
}>;

/** Closes without acting. Disabled while a confirm is pending. */
const ConfirmDialogCancel = ({
	children,
}: ConfirmDialogCancelProps): ReactNode => {
	const { pending } = useContext(ConfirmContext);

	return (
		<AlertDialog.Close
			disabled={pending}
			render={
				<Button variant="tertiary">{children}</Button>
			}
		/>
	);
};

export type ConfirmDialogConfirmProps = Readonly<{
	/**
	 * Invoked on confirm. Return a promise to keep the dialog open, busy and
	 * undismissable until it settles: it closes when the promise resolves and
	 * stays open when it rejects, so the caller can show the error.
	 */
	onConfirm: ConfirmAction;
	/** The action's colour role; `danger` for something irreversible. @default "brand" */
	tone?: ButtonTone;
	children: ReactNode;
}>;

/** Acts, then closes once the action has settled. Put a `Spinner` in it to show the wait. */
const ConfirmDialogConfirm = ({
	onConfirm,
	tone = "brand",
	children,
}: ConfirmDialogConfirmProps): ReactNode => {
	const { pending, confirm } = useContext(ConfirmContext);

	return (
		<Button
			variant="primary"
			tone={tone}
			aria-busy={pending || undefined}
			aria-disabled={pending || undefined}
			onClick={() => confirm(onConfirm)}>
			{children}
		</Button>
	);
};

export type ConfirmDialogSpinnerProps = Omit<
	SpinnerProps,
	"size"
> &
	Readonly<{
		/** Size relative to the current font size (in `em`). @default 1 */
		size?: number;
	}>;

/**
 * The spinner a pending confirm shows once it has run long enough to notice.
 * Renders nothing otherwise.
 *
 * @example
 * <ConfirmDialog.Confirm onConfirm={send}><ConfirmDialog.Spinner />Send</ConfirmDialog.Confirm>
 */
const ConfirmDialogSpinner = ({
	size = 1,
	...props
}: ConfirmDialogSpinnerProps): ReactNode => {
	const { pending } = useContext(ConfirmContext);
	const phase = useBusyPhase({ busy: pending });

	return phase === "fresh" ? null : (
		<Spinner size={size} {...props} />
	);
};

export type ConfirmDialogProps = Omit<
	ConfirmDialogRootProps,
	"children"
> &
	Omit<ConfirmDialogConfirmProps, "children"> &
	Readonly<{
		/** Heading text. */
		title: ReactNode;
		/** Optional supporting description. */
		description?: ReactNode;
		/** Label for the confirming action button. */
		confirmLabel: string;
		/** Label for the cancelling action button. */
		cancelLabel: string;
	}>;

const ConfirmDialogShorthand = ({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel,
	onConfirm,
	tone,
}: ConfirmDialogProps): ReactNode => (
	<ConfirmDialogRoot
		open={open}
		onOpenChange={onOpenChange}>
		<ConfirmDialogContent>
			<ConfirmDialogTitle>{title}</ConfirmDialogTitle>
			<ConfirmDialogDescription>
				{description}
			</ConfirmDialogDescription>
			<ConfirmDialogFooter>
				<ConfirmDialogCancel>
					{cancelLabel}
				</ConfirmDialogCancel>
				<ConfirmDialogConfirm
					onConfirm={onConfirm}
					tone={tone}>
					<ConfirmDialogSpinner />
					{confirmLabel}
				</ConfirmDialogConfirm>
			</ConfirmDialogFooter>
		</ConfirmDialogContent>
	</ConfirmDialogRoot>
);

type ConfirmDialogParts = typeof ConfirmDialogShorthand &
	Readonly<{
		Root: typeof ConfirmDialogRoot;
		Portal: typeof AlertDialog.Portal;
		Backdrop: typeof ConfirmDialogBackdrop;
		Popup: typeof ConfirmDialogPopup;
		Content: typeof ConfirmDialogContent;
		Title: typeof ConfirmDialogTitle;
		Description: typeof ConfirmDialogDescription;
		Footer: typeof ConfirmDialogFooter;
		Cancel: typeof ConfirmDialogCancel;
		Confirm: typeof ConfirmDialogConfirm;
		Spinner: typeof ConfirmDialogSpinner;
	}>;

/**
 * A controlled confirmation over base-ui's `AlertDialog`. A promise from
 * `onConfirm` keeps it busy until it settles, closing on resolve and staying open
 * on reject; the parts hanging off it build one by hand, with `Content`
 * bundling the portal, backdrop and popup.
 *
 * @example
 * <ConfirmDialog
 * 	open={open}
 * 	onOpenChange={setOpen}
 * 	title="Delete this invoice?"
 * 	description="This cannot be undone."
 * 	confirmLabel="Delete"
 * 	cancelLabel="Cancel"
 * 	onConfirm={() => deleteInvoice(id)}
 * 	tone="danger"
 * />
 */
export const ConfirmDialog: ConfirmDialogParts =
	Object.assign(ConfirmDialogShorthand, {
		Root: ConfirmDialogRoot,
		Portal: AlertDialog.Portal,
		Backdrop: ConfirmDialogBackdrop,
		Popup: ConfirmDialogPopup,
		Content: ConfirmDialogContent,
		Title: ConfirmDialogTitle,
		Description: ConfirmDialogDescription,
		Footer: ConfirmDialogFooter,
		Cancel: ConfirmDialogCancel,
		Confirm: ConfirmDialogConfirm,
		Spinner: ConfirmDialogSpinner,
	});
