import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
	type CloseButtonProps,
	CloseButton as KitCloseButton,
} from "../button/close-button.tsx";
import styles from "./drawer.module.scss";

export type DrawerRootProps<Payload = unknown> = Omit<
	BaseDrawer.Root.Props<Payload>,
	| "open"
	| "defaultOpen"
	| "onOpenChange"
	| "modal"
	| "children"
	| "swipeDirection"
> &
	Readonly<{
		/** Whether the drawer is open. Leave it out for a drawer that keeps its own state. */
		open?: boolean;
		/** Whether the drawer starts open, when it keeps its own state. @default false */
		defaultOpen?: boolean;
		/** Called with the new open state when the drawer opens or closes. */
		onOpenChange?: BaseDrawer.Root.Props<Payload>["onOpenChange"];
		/** Whether focus stays inside the drawer and the page behind it is inert while it is open. @default true */
		modal?: BaseDrawer.Root.Props<Payload>["modal"];
		/** The edge the drawer slides in from, and the way a swipe dismisses it. @default "down" */
		swipeDirection?: BaseDrawer.Root.Props<Payload>["swipeDirection"];
		/** The trigger and the drawer's content. */
		children?: BaseDrawer.Root.Props<Payload>["children"];
	}>;

/** Holds the drawer's open state for its parts. It renders no element of its own. */
const Root = <Payload,>(
	props: DrawerRootProps<Payload>,
): ReactNode => <BaseDrawer.Root {...props} />;

/** The dimmed layer behind a modal drawer. */
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

/** The fixed frame the popup slides within. */
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

/** The drawer's surface: a side panel, or a bottom sheet when swiped down. */
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

/** The drawer's heading, which names it. */
const Title = ({
	className,
	...props
}: ComponentProps<typeof BaseDrawer.Title>): ReactNode => (
	<BaseDrawer.Title
		className={clsx(styles.title, className)}
		{...props}
	/>
);

export type DrawerHeaderProps = ComponentProps<"div">;

/** The title's line. Put a `Drawer.CloseButton` in it to trail a way out. */
const Header = ({
	className,
	...props
}: DrawerHeaderProps): ReactNode => (
	<div
		className={clsx(styles.header, className)}
		{...props}
	/>
);

export type DrawerCloseButtonProps = Pick<
	CloseButtonProps,
	"closeLabel" | "icon"
>;

/** The icon-only way out, for a header or a footer, drawn with the app's `icon`. */
const CloseButton = ({
	closeLabel,
	icon,
}: DrawerCloseButtonProps): ReactNode => (
	<KitCloseButton
		closeLabel={closeLabel}
		icon={icon}
		render={<BaseDrawer.Close />}
	/>
);

export type DrawerSheetProps = DrawerPopupProps &
	Readonly<{
		/** The element the drawer is portalled into. @default document.body */
		container?: BaseDrawer.Portal.Props["container"];
	}>;

/**
 * `Portal`, `Backdrop`, `Viewport`, `Popup` and `Content` in one: the drawer's
 * surface, above the page, holding its children.
 */
const Sheet = ({
	container,
	children,
	...props
}: DrawerSheetProps): ReactNode => (
	<BaseDrawer.Portal container={container}>
		<Backdrop />
		<Viewport>
			<Popup {...props}>
				<BaseDrawer.Content>{children}</BaseDrawer.Content>
			</Popup>
		</Viewport>
	</BaseDrawer.Portal>
);

type DrawerParts = Readonly<{
	Root: typeof Root;
	Trigger: typeof BaseDrawer.Trigger;
	Portal: typeof BaseDrawer.Portal;
	Backdrop: typeof Backdrop;
	Viewport: typeof Viewport;
	Popup: typeof Popup;
	Content: typeof BaseDrawer.Content;
	Sheet: typeof Sheet;
	Header: typeof Header;
	Title: typeof Title;
	Close: typeof BaseDrawer.Close;
	CloseButton: typeof CloseButton;
	createHandle: typeof BaseDrawer.createHandle;
}>;

/**
 * A drawer over base-ui's `Drawer`: `swipeDirection="right"` slides in a side
 * panel, `"down"` raises a bottom sheet. `Sheet` bundles the portal, backdrop,
 * viewport, popup and content; the unbundled parts stay.
 *
 * @example
 * <Drawer.Root swipeDirection={narrow ? "down" : "right"}>
 *   <Drawer.Trigger>Open</Drawer.Trigger>
 *   <Drawer.Sheet>
 *     <Drawer.Header>
 *       <Drawer.Title>Filters</Drawer.Title>
 *       <Drawer.CloseButton closeLabel="Close" icon={<CloseIcon />} />
 *     </Drawer.Header>
 *     <Drawer.Close>Done</Drawer.Close>
 *   </Drawer.Sheet>
 * </Drawer.Root>
 */
export const Drawer: DrawerParts = {
	Root,
	Trigger: BaseDrawer.Trigger,
	Portal: BaseDrawer.Portal,
	Backdrop,
	Viewport,
	Popup,
	Content: BaseDrawer.Content,
	Sheet,
	Header,
	Title,
	Close: BaseDrawer.Close,
	CloseButton,
	createHandle: BaseDrawer.createHandle,
};
