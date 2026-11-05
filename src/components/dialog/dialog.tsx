import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "../button/button.tsx";
import styles from "./dialog.module.scss";

const Backdrop = ({
	className,
	...props
}: ComponentProps<
	typeof BaseDialog.Backdrop
>): ReactNode => (
	<BaseDialog.Backdrop
		className={clsx(styles.backdrop, className)}
		{...props}
	/>
);

const Popup = ({
	className,
	...props
}: ComponentProps<typeof BaseDialog.Popup>): ReactNode => (
	<BaseDialog.Popup
		className={clsx(styles.popup, className)}
		{...props}
	/>
);

const Title = ({
	className,
	...props
}: ComponentProps<typeof BaseDialog.Title>): ReactNode => (
	<BaseDialog.Title
		className={clsx(styles.title, className)}
		{...props}
	/>
);

export type DialogHeaderProps = Readonly<{
	children?: ReactNode;
	className?: string;
}>;

/** The title's line. Put a `Dialog.CloseButton` in it to trail a way out. */
const Header = ({
	children,
	className,
}: DialogHeaderProps): ReactNode => (
	<div className={clsx(styles.header, className)}>
		{children}
	</div>
);

export type DialogCloseButtonProps = Readonly<{
	/** Accessible name, surfaced as the tooltip hint and the `aria-label`. */
	label: string;
}>;

/** The icon-only way out, for a header or a footer. */
const CloseButton = ({
	label,
}: DialogCloseButtonProps): ReactNode => (
	<Button
		variant="tertiary"
		iconOnly
		icon={CloseIcon}
		label={label}
		render={<BaseDialog.Close />}
	/>
);

const Body = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(styles.body, className)}
		{...props}
	/>
);

const Footer = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(styles.footer, className)}
		{...props}
	/>
);

type DialogParts = Readonly<{
	Root: typeof BaseDialog.Root;
	Trigger: typeof BaseDialog.Trigger;
	Portal: typeof BaseDialog.Portal;
	Backdrop: typeof Backdrop;
	Popup: typeof Popup;
	Title: typeof Title;
	Description: typeof BaseDialog.Description;
	Close: typeof BaseDialog.Close;
	CloseButton: typeof CloseButton;
	Header: typeof Header;
	Body: typeof Body;
	Footer: typeof Footer;
	createHandle: typeof BaseDialog.createHandle;
}>;

/**
 * Dialog chrome over base-ui's Dialog. Provides `Header` / `Body` / `Footer`
 * regions plus a styled `Backdrop` and `Popup`. Footer actions are a slot.
 *
 * @example
 * <Dialog.Root>
 *   <Dialog.Trigger>Edit</Dialog.Trigger>
 *   <Dialog.Portal>
 *     <Dialog.Backdrop />
 *     <Dialog.Popup>
 *       <Dialog.Header>
 *         <Dialog.Title>Discard changes?</Dialog.Title>
 *         <Dialog.CloseButton label="Close" />
 *       </Dialog.Header>
 *       <Dialog.Body>
 *         <Dialog.Description>Your edits will be lost.</Dialog.Description>
 *       </Dialog.Body>
 *       <Dialog.Footer>
 *         <Dialog.Close>Keep editing</Dialog.Close>
 *         <button onClick={discard}>Discard</button>
 *       </Dialog.Footer>
 *     </Dialog.Popup>
 *   </Dialog.Portal>
 * </Dialog.Root>
 */
export const Dialog: DialogParts = {
	Root: BaseDialog.Root,
	Trigger: BaseDialog.Trigger,
	Portal: BaseDialog.Portal,
	Backdrop,
	Popup,
	Title,
	Description: BaseDialog.Description,
	Close: BaseDialog.Close,
	CloseButton,
	Header,
	Body,
	Footer,
	createHandle: BaseDialog.createHandle,
};
