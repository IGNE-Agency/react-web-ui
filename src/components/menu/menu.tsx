import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import { Button } from "../button/button.tsx";
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

type TriggerBaseProps = Omit<
	ComponentProps<typeof BaseMenu.Trigger>,
	"children" | "render"
>;

type IconTriggerProps = TriggerBaseProps &
	Readonly<{
		icon: ReactNode;
		/** Accessible name, surfaced as the tooltip hint and the `aria-label`. */
		label: string;
		children?: never;
	}>;

type TextTriggerProps = TriggerBaseProps &
	Readonly<{
		/** Optional leading icon rendered before the label. */
		icon?: ReactNode;
		children: ReactNode;
		label?: never;
	}>;

export type MenuTriggerProps =
	| IconTriggerProps
	| TextTriggerProps;

/**
 * The button that opens a menu: `icon` + `label` for the icon form, `children`
 * for a labelled one. Always a {@link Button}.
 */
const Trigger = (props: MenuTriggerProps): ReactNode => {
	if (props.label !== undefined) {
		const { icon, label, ...triggerProps } = props;
		return (
			<Button
				variant="tertiary"
				iconOnly
				icon={icon}
				label={label}
				render={<BaseMenu.Trigger {...triggerProps} />}
			/>
		);
	}

	const { icon, children, ...triggerProps } = props;
	return (
		<Button
			variant="secondary"
			icon={icon}
			render={<BaseMenu.Trigger {...triggerProps} />}>
			{children}
		</Button>
	);
};

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

/** The arrow pointing from the popup at its trigger. */
const Arrow = ({
	className,
	...props
}: ComponentProps<typeof BaseMenu.Arrow>): ReactNode => (
	<BaseMenu.Arrow
		className={clsx(styles.arrow, className)}
		{...props}>
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
	</BaseMenu.Arrow>
);

export type MenuItemProps = ComponentProps<
	typeof BaseMenu.Item
> &
	Readonly<{
		/** Optional leading icon, rendered decoratively before the label. */
		icon?: ReactNode;
	}>;

/** An action, with an optional leading icon. */
const Item = ({
	icon,
	className,
	children,
	...props
}: MenuItemProps): ReactNode => (
	<BaseMenu.Item
		className={clsx(styles.item, className)}
		{...props}>
		{icon}
		{children}
	</BaseMenu.Item>
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
 *   <Menu.Trigger icon={<MoreIcon />} label="Row actions" />
 *   <Menu.Content sideOffset={8}>
 *     <Menu.Arrow />
 *     <Menu.Item icon={<DownloadIcon />} onClick={download}>
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
