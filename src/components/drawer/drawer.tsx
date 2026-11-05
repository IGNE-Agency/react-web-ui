import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
	type CloseButtonProps,
	CloseButton as KitCloseButton,
} from "../button/close-button.tsx";
import styles from "./drawer.module.scss";

const Backdrop = ({
	className,
	...props
}: ComponentProps<
	typeof BaseDrawer.Backdrop
>): ReactNode => (
	<BaseDrawer.Backdrop
		className={clsx(styles.backdrop, className)}
		{...props}
	/>
);

const Viewport = ({
	className,
	...props
}: ComponentProps<
	typeof BaseDrawer.Viewport
>): ReactNode => (
	<BaseDrawer.Viewport
		className={clsx(styles.viewport, className)}
		{...props}
	/>
);

export type DrawerPopupProps = ComponentProps<
	typeof BaseDrawer.Popup
> &
	Readonly<{
		/**
		 * Takes the full height of the bottom sheet, for content that scrolls
		 * inside it rather than sizing it.
		 */
		filled?: boolean;
	}>;

const Popup = ({
	className,
	filled,
	...props
}: DrawerPopupProps): ReactNode => (
	<BaseDrawer.Popup
		className={clsx(
			styles.popup,
			filled === true && styles.filled,
			className,
		)}
		{...props}
	/>
);

const Title = ({
	className,
	...props
}: ComponentProps<typeof BaseDrawer.Title>): ReactNode => (
	<BaseDrawer.Title
		className={clsx(styles.title, className)}
		{...props}
	/>
);

export type DrawerHeaderProps = Readonly<{
	children?: ReactNode;
	className?: string;
}>;

/** The title's line. Put a `Drawer.CloseButton` in it to trail a way out. */
const Header = ({
	children,
	className,
}: DrawerHeaderProps): ReactNode => (
	<div className={clsx(styles.header, className)}>
		{children}
	</div>
);

export type DrawerCloseButtonProps = Pick<
	CloseButtonProps,
	"closeLabel"
>;

/** The icon-only way out, for a header or a footer. */
const CloseButton = ({
	closeLabel,
}: DrawerCloseButtonProps): ReactNode => (
	<KitCloseButton
		closeLabel={closeLabel}
		render={<BaseDrawer.Close />}
	/>
);

type DrawerParts = Readonly<{
	Root: typeof BaseDrawer.Root;
	Trigger: typeof BaseDrawer.Trigger;
	Portal: typeof BaseDrawer.Portal;
	Backdrop: typeof Backdrop;
	Viewport: typeof Viewport;
	Popup: typeof Popup;
	Content: typeof BaseDrawer.Content;
	Header: typeof Header;
	Title: typeof Title;
	Close: typeof BaseDrawer.Close;
	CloseButton: typeof CloseButton;
	createHandle: typeof BaseDrawer.createHandle;
}>;

/**
 * Shared wrapper over base-ui's Drawer, mirroring its parts. Its look follows
 * `swipeDirection` on `Drawer.Root`: `"right"` slides a side panel in from the
 * right, `"down"` raises a bottom sheet up to 85dvh tall. The caller picks the
 * direction, for example from its own viewport query.
 *
 * @example
 * const handle = Drawer.createHandle();
 * const narrow = useMediaQuery("(width < 40rem)");
 *
 * <Drawer.Root handle={handle} swipeDirection={narrow ? "down" : "right"}>
 *   <Drawer.Trigger handle={handle}>Open</Drawer.Trigger>
 *   <Drawer.Portal>
 *     <Drawer.Backdrop />
 *     <Drawer.Viewport>
 *       <Drawer.Popup>
 *         <Drawer.Content>
 *           <Drawer.Title>Filters</Drawer.Title>
 *           ...
 *           <Drawer.Close>Done</Drawer.Close>
 *         </Drawer.Content>
 *       </Drawer.Popup>
 *     </Drawer.Viewport>
 *   </Drawer.Portal>
 * </Drawer.Root>
 */
export const Drawer: DrawerParts = {
	Root: BaseDrawer.Root,
	Trigger: BaseDrawer.Trigger,
	Portal: BaseDrawer.Portal,
	Backdrop,
	Viewport,
	Popup,
	Content: BaseDrawer.Content,
	Header,
	Title,
	Close: BaseDrawer.Close,
	CloseButton,
	createHandle: BaseDrawer.createHandle,
};
