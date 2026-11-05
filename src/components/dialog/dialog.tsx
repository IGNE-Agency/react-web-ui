import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
	type CloseButtonProps,
	CloseButton as KitCloseButton,
} from "../button/close-button.tsx";
import styles from "./dialog.module.scss";

export type DialogRootProps<Payload = unknown> = Omit<
	BaseDialog.Root.Props<Payload>,
	"open" | "defaultOpen" | "onOpenChange" | "modal" | "children"
> &
	Readonly<{
		/** Whether the dialog is open. Leave it out for a dialog that keeps its own state. */
		open?: boolean;
		/** Whether the dialog starts open, when it keeps its own state. @default false */
		defaultOpen?: boolean;
		/** Called with the new open state when the dialog opens or closes. */
		onOpenChange?: BaseDialog.Root.Props<Payload>["onOpenChange"];
		/** Whether focus stays inside the dialog and the page behind it is inert while it is open. @default true */
		modal?: BaseDialog.Root.Props<Payload>["modal"];
		/** The trigger and the dialog's content. */
		children?: BaseDialog.Root.Props<Payload>["children"];
	}>;

/** Holds the dialog's open state for its parts. It renders no element of its own. */
const Root = <Payload,>(
	props: DialogRootProps<Payload>,
): ReactNode => <BaseDialog.Root {...props} />;

/** The dimmed layer behind a modal dialog. */
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

/** The dialog's surface. */
const Popup = ({
	className,
	...props
}: ComponentProps<typeof BaseDialog.Popup>): ReactNode => (
	<BaseDialog.Popup
		className={clsx(styles.popup, className)}
		{...props}
	/>
);

/** The dialog's heading, which names it. */
const Title = ({
	className,
	...props
}: ComponentProps<typeof BaseDialog.Title>): ReactNode => (
	<BaseDialog.Title
		className={clsx(styles.title, className)}
		{...props}
	/>
);

export type DialogHeaderProps = ComponentProps<"div">;

/** The title's line. Put a `Dialog.CloseButton` in it to trail a way out. */
const Header = ({
	className,
	...props
}: DialogHeaderProps): ReactNode => (
	<div
		className={clsx(styles.header, className)}
		{...props}
	/>
);

export type DialogCloseButtonProps = Pick<
	CloseButtonProps,
	"closeLabel" | "icon"
>;

/** The icon-only way out, for a header or a footer, drawn with the app's `icon`. */
const CloseButton = ({
	closeLabel,
	icon,
}: DialogCloseButtonProps): ReactNode => (
	<KitCloseButton
		closeLabel={closeLabel}
		icon={icon}
		render={<BaseDialog.Close />}
	/>
);

export type DialogContentProps = ComponentProps<
	typeof BaseDialog.Popup
> &
	Readonly<{
		/** The element the dialog is portalled into. @default document.body */
		container?: BaseDialog.Portal.Props["container"];
	}>;

/** `Portal`, `Backdrop` and `Popup` in one: the dialog's surface, above the page. */
const Content = ({
	container,
	...props
}: DialogContentProps): ReactNode => (
	<BaseDialog.Portal container={container}>
		<Backdrop />
		<Popup {...props} />
	</BaseDialog.Portal>
);

/** The dialog's content, scrolling when it outgrows the surface. */
const Body = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(styles.body, className)}
		{...props}
	/>
);

/** The row the dialog's actions sit on. */
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
	Root: typeof Root;
	Trigger: typeof BaseDialog.Trigger;
	Portal: typeof BaseDialog.Portal;
	Backdrop: typeof Backdrop;
	Popup: typeof Popup;
	Content: typeof Content;
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
 * A dialog over base-ui's `Dialog`, in `Header`, `Body` and `Footer` regions.
 * `Content` bundles the portal, backdrop and popup; the unbundled parts stay.
 *
 * @example
 * <Dialog.Root>
 *   <Dialog.Trigger>Edit</Dialog.Trigger>
 *   <Dialog.Content>
 *     <Dialog.Header>
 *       <Dialog.Title>Discard changes?</Dialog.Title>
 *       <Dialog.CloseButton closeLabel="Close" icon={<CloseIcon />} />
 *     </Dialog.Header>
 *     <Dialog.Body>
 *       <Dialog.Description>Your edits will be lost.</Dialog.Description>
 *     </Dialog.Body>
 *     <Dialog.Footer>
 *       <Dialog.Close>Keep editing</Dialog.Close>
 *       <button onClick={discard}>Discard</button>
 *     </Dialog.Footer>
 *   </Dialog.Content>
 * </Dialog.Root>
 */
export const Dialog: DialogParts = {
	Root,
	Trigger: BaseDialog.Trigger,
	Portal: BaseDialog.Portal,
	Backdrop,
	Popup,
	Content,
	Title,
	Description: BaseDialog.Description,
	Close: BaseDialog.Close,
	CloseButton,
	Header,
	Body,
	Footer,
	createHandle: BaseDialog.createHandle,
};
