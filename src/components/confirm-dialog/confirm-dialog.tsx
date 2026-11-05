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
import { Spinner } from "../spinner/spinner.tsx";
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

/** The controlled alert dialog: its portal, backdrop and surface. */
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
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className={styles.backdrop} />
				<AlertDialog.Popup
					className={styles.popup}
					aria-busy={attempt.pending || undefined}>
					<ConfirmContext value={attempt}>
						{children}
					</ConfirmContext>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
};

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

/** Acts, then closes once the action has settled. */
const ConfirmDialogConfirm = ({
	onConfirm,
	tone = "brand",
	children,
}: ConfirmDialogConfirmProps): ReactNode => {
	const { pending, confirm } = useContext(ConfirmContext);
	const phase = useBusyPhase({ busy: pending });

	return (
		<Button
			variant="primary"
			tone={tone}
			aria-busy={pending || undefined}
			aria-disabled={pending || undefined}
			onClick={() => confirm(onConfirm)}>
			{phase === "fresh" ? null : <Spinner size={1} />}
			{children}
		</Button>
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
				{confirmLabel}
			</ConfirmDialogConfirm>
		</ConfirmDialogFooter>
	</ConfirmDialogRoot>
);

type ConfirmDialogParts = typeof ConfirmDialogShorthand &
	Readonly<{
		Root: typeof ConfirmDialogRoot;
		Title: typeof ConfirmDialogTitle;
		Description: typeof ConfirmDialogDescription;
		Footer: typeof ConfirmDialogFooter;
		Cancel: typeof ConfirmDialogCancel;
		Confirm: typeof ConfirmDialogConfirm;
	}>;

/**
 * A controlled confirmation over base-ui's `AlertDialog`. A promise from
 * `onConfirm` keeps it busy until it settles, closing on resolve and staying open
 * on reject; the parts hanging off it build one by hand.
 *
 * @example
 * <ConfirmDialog
 * 	open={open}
 * 	onOpenChange={setOpen}
 * 	title="Delete this declaration?"
 * 	description="This cannot be undone."
 * 	confirmLabel="Delete"
 * 	cancelLabel="Cancel"
 * 	onConfirm={() => deleteDeclaration(id)}
 * 	tone="danger"
 * />
 */
export const ConfirmDialog: ConfirmDialogParts =
	Object.assign(ConfirmDialogShorthand, {
		Root: ConfirmDialogRoot,
		Title: ConfirmDialogTitle,
		Description: ConfirmDialogDescription,
		Footer: ConfirmDialogFooter,
		Cancel: ConfirmDialogCancel,
		Confirm: ConfirmDialogConfirm,
	});
