import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import styles from "./menu.module.scss";

export type MenuRootProps<Payload = unknown> = Omit<
	BaseMenu.Root.Props<Payload>,
	| "open"
	| "defaultOpen"
	| "onOpenChange"
	| "modal"
	| "children"
> &
	Readonly<{
		/** Whether the menu is open. Leave it out for a menu that keeps its own state. */
		open?: boolean;
		/** Whether the menu starts open, when it keeps its own state. @default false */
		defaultOpen?: boolean;
		/** Called with the new open state when the menu opens or closes. */
		onOpenChange?: BaseMenu.Root.Props<Payload>["onOpenChange"];
		/** Whether the page behind the menu is inert while it is open. @default true */
		modal?: BaseMenu.Root.Props<Payload>["modal"];
		/** The trigger and the menu's content. */
		children?: BaseMenu.Root.Props<Payload>["children"];
	}>;

/** Holds the menu's open state for its parts. It renders no element of its own. */
const Root = <Payload,>(
	props: MenuRootProps<Payload>,
): ReactNode => <BaseMenu.Root {...props} />;

export type MenuTriggerProps = Omit<
	ComponentProps<typeof BaseMenu.Trigger>,
	"render"
> &
	Readonly<{
		/** The button to render, such as `<IconButton label="Row actions" variant="tertiary"><MoreIcon /></IconButton>`. */
		render: NonNullable<
			ComponentProps<typeof BaseMenu.Trigger>["render"]
		>;
	}>;

/**
 * The button that opens a menu. It renders whichever button it is given.
 *
 * @example
 * <Menu.Trigger render={<IconButton label="Row actions" variant="tertiary"><MoreIcon /></IconButton>} />
 */
const Trigger = (props: MenuTriggerProps): ReactNode => (
	<BaseMenu.Trigger {...props} />
);

export type MenuPositionerProps = Omit<
	ComponentProps<typeof BaseMenu.Positioner>,
	"ref"
>;

/** Places the popup against its trigger, clear of the viewport's edges. */
const Positioner = ({
	className,
	...props
}: MenuPositionerProps): ReactNode => (
	<BaseMenu.Positioner
		{...usePopupEdgePadding()}
		className={clsx(styles.positioner, className)}
		{...props}
	/>
);

/** The menu's surface, holding its items. */
const Popup = ({
	className,
	...props
}: ComponentProps<typeof BaseMenu.Popup>): ReactNode => (
	<BaseMenu.Popup
		className={clsx(styles.popup, className)}
		{...props}
	/>
);

export type MenuContentProps = ComponentProps<
	typeof BaseMenu.Popup
> &
	Readonly<
		Pick<
			MenuPositionerProps,
			"side" | "sideOffset" | "align" | "alignOffset"
		> & {
			/** The element the menu is portalled into. @default document.body */
			container?: BaseMenu.Portal.Props["container"];
		}
	>;

/** `Portal`, `Positioner` and `Popup` in one: the menu's surface, placed against its trigger. */
const Content = ({
	container,
	side,
	sideOffset,
	align,
	alignOffset,
	...props
}: MenuContentProps): ReactNode => (
	<BaseMenu.Portal container={container}>
		<Positioner
			side={side}
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}>
			<Popup {...props} />
		</Positioner>
	</BaseMenu.Portal>
);

/**
 * The arrow pointing from the popup at its trigger: the kit's own shape, or the
 * children given in its place.
 *
 * @example
 * <Menu.Arrow />
 */
const Arrow = ({
	className,
	children,
	...props
}: ComponentProps<typeof BaseMenu.Arrow>): ReactNode => (
	<BaseMenu.Arrow
		className={clsx(styles.arrow, className)}
		{...props}>
		{children ?? (
			<svg
				width="16"
				height="8"
				viewBox="0 0 16 8"
				overflow="visible">
				<path
					className={styles.arrowFill}
					d="M0 9 V8 L8 0 L16 8 V9 Z"
				/>
			</svg>
		)}
	</BaseMenu.Arrow>
);

export type MenuItemProps = ComponentProps<
	typeof BaseMenu.Item
>;

/**
 * An action. A leading icon goes in its children, before the label.
 *
 * @example
 * <Menu.Item onClick={download}><DownloadIcon />Download</Menu.Item>
 */
const Item = ({
	className,
	...props
}: MenuItemProps): ReactNode => (
	<BaseMenu.Item
		className={clsx(styles.item, className)}
		{...props}
	/>
);

export type MenuLinkItemProps = ComponentProps<
	typeof BaseMenu.LinkItem
>;

/**
 * An item that leads to a page. It spreads every other prop onto the `<a>` and
 * forwards its ref, so a router's `createLink` can wrap it.
 */
const LinkItem = ({
	className,
	...props
}: MenuLinkItemProps): ReactNode => (
	<BaseMenu.LinkItem
		className={clsx(
			styles.item,
			styles.linkItem,
			className,
		)}
		{...props}
	/>
);

/** A line between groups of items. */
const Separator = ({
	className,
	...props
}: ComponentProps<
	typeof BaseMenu.Separator
>): ReactNode => (
	<BaseMenu.Separator
		className={clsx(styles.separator, className)}
		{...props}
	/>
);

/** The heading that names a `Group`. */
const GroupLabel = ({
	className,
	...props
}: ComponentProps<
	typeof BaseMenu.GroupLabel
>): ReactNode => (
	<BaseMenu.GroupLabel
		className={clsx(styles.groupLabel, className)}
		{...props}
	/>
);

type MenuParts = Readonly<{
	Root: typeof Root;
	Trigger: typeof Trigger;
	Portal: typeof BaseMenu.Portal;
	Positioner: typeof Positioner;
	Popup: typeof Popup;
	Content: typeof Content;
	Arrow: typeof Arrow;
	Item: typeof Item;
	LinkItem: typeof LinkItem;
	Separator: typeof Separator;
	Group: typeof BaseMenu.Group;
	GroupLabel: typeof GroupLabel;
	createHandle: typeof BaseMenu.createHandle;
}>;

/**
 * A dropdown menu over base-ui's `Menu`. `Content` bundles the portal,
 * positioner and popup; the unbundled parts stay. Icons are the app's own.
 *
 * @example
 * <Menu.Root>
 *   <Menu.Trigger
 *     render={
 *       <IconButton label="Row actions" variant="tertiary">
 *         <MoreIcon />
 *       </IconButton>
 *     }
 *   />
 *   <Menu.Content sideOffset={8}>
 *     <Menu.Arrow />
 *     <Menu.Item onClick={download}>
 *       <DownloadIcon />
 *       Download
 *     </Menu.Item>
 *   </Menu.Content>
 * </Menu.Root>
 */
export const Menu: MenuParts = {
	Root,
	Trigger,
	Portal: BaseMenu.Portal,
	Positioner,
	Popup,
	Content,
	Arrow,
	Item,
	LinkItem,
	Separator,
	Group: BaseMenu.Group,
	GroupLabel,
	createHandle: BaseMenu.createHandle,
};
