import { Toast } from "@base-ui/react/toast";
import CheckCircleIcon from "@material-design-icons/svg/outlined/check_circle.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import ErrorIcon from "@material-design-icons/svg/outlined/error.svg?react";
import InfoIcon from "@material-design-icons/svg/outlined/info.svg?react";
import WarningIcon from "@material-design-icons/svg/outlined/warning_amber.svg?react";
import { type ReactNode, useEffect } from "react";
import { Button } from "../button/button.tsx";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
import {
	flushBufferedToasts,
	type ToastData,
	type ToastTone,
	toastManager,
} from "./toast.ts";
import styles from "./toast-provider.module.scss";

const TONE_ICON: Readonly<Record<ToastTone, SvgComponent>> =
	{
		success: CheckCircleIcon,
		error: ErrorIcon,
		warning: WarningIcon,
		info: InfoIcon,
	};

type ToastBodyProps = Readonly<{
	data: ToastData | undefined;
	closeLabel: string;
	onClose: () => void;
}>;

const ToastBody = ({
	data,
	closeLabel,
	onClose,
}: ToastBodyProps) => {
	if (!data) {
		return null;
	}

	return (
		<>
			<div className={styles.header}>
				<div className={styles.headingMain}>
					<Icon
						svg={TONE_ICON[data.tone]}
						size={1.2}
						label=""
					/>
					<Toast.Title className={styles.title}>
						{data.title ?? data.body}
					</Toast.Title>
				</div>
				<Button
					className={styles.closeButton}
					variant="tertiary"
					size="sm"
					iconOnly
					icon={CloseIcon}
					label={closeLabel}
					onClick={onClose}
				/>
			</div>
			{data.title !== undefined && (
				<Toast.Description className={styles.description}>
					{data.body}
				</Toast.Description>
			)}
			{data.actions && data.actions.length > 0 && (
				<div className={styles.actions}>
					{data.actions.map(action => (
						<Button
							key={action.label}
							className={styles.action}
							size="sm"
							variant={action.variant ?? "secondary"}
							onClick={action.onClick}>
							{action.label}
						</Button>
					))}
				</div>
			)}
		</>
	);
};

const ToastList = ({
	closeLabel,
}: Readonly<{ closeLabel: string }>): ReactNode => {
	const { toasts, close } =
		Toast.useToastManager<ToastData>();

	return toasts.map(toast => (
		<Toast.Root
			key={toast.id}
			toast={toast}
			className={styles.toast}
			data-tone={toast.data?.tone}>
			<div className={styles.content}>
				<ToastBody
					data={toast.data}
					closeLabel={closeLabel}
					onClose={() => close(toast.id)}
				/>
			</div>
		</Toast.Root>
	));
};

export type ToastProviderProps = Readonly<{
	/** Accessible name of each toast's close button, also its tooltip. */
	closeLabel: string;
	/** Accessible name of the region the toasts appear in, reached with F6. */
	viewportLabel: string;
	children: ReactNode;
}>;

/**
 * Mounts the toast system once at the app root: provides the global
 * {@link toastManager} to base-ui and renders the viewport alongside the app.
 *
 * @example
 * <ToastProvider closeLabel="Close" viewportLabel="Notifications">
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider = ({
	closeLabel,
	viewportLabel,
	children,
}: ToastProviderProps): ReactNode => {
	useEffect(flushBufferedToasts, []);

	return (
		<Toast.Provider toastManager={toastManager}>
			{children}
			<Toast.Portal>
				<Toast.Viewport
					className={styles.viewport}
					aria-label={viewportLabel}>
					<ToastList closeLabel={closeLabel} />
				</Toast.Viewport>
			</Toast.Portal>
		</Toast.Provider>
	);
};
