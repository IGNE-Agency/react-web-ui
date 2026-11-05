import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import { Button } from "../button/button.tsx";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
import styles from "./menu.module.scss";

type TriggerBaseProps = Omit<
	ComponentProps<typeof BaseMenu.Trigger>,
	"children" | "render"
>;

type IconTriggerProps = TriggerBaseProps &
	Readonly<{
		icon: SvgComponent;
		/** Accessible name, surfaced as the tooltip hint and the `aria-label`. */
		label: string;
		children?: never;
	}>;

type TextTriggerProps = TriggerBaseProps &
	Readonly<{
		/** Optional leading icon rendered before the label. */
		icon?: SvgComponent;
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

const Popup = ({
	className,
	...props
}: ComponentProps<typeof BaseMenu.Popup>): ReactNode => (
	<BaseMenu.Popup
		className={clsx(styles.popup, className)}
		{...props}
	/>
);

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
		icon?: SvgComponent;
	}>;

const Item = ({
	icon,
	className,
	children,
	...props
}: MenuItemProps): ReactNode => (
	<BaseMenu.Item
		className={clsx(styles.item, className)}
		{...props}>
		{icon && <Icon svg={icon} label="" />}
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
	Root: typeof BaseMenu.Root;
	Trigger: typeof Trigger;
	Portal: typeof BaseMenu.Portal;
	Positioner: typeof Positioner;
	Popup: typeof Popup;
	Arrow: typeof Arrow;
	Item: typeof Item;
	LinkItem: typeof LinkItem;
	Separator: typeof Separator;
	Group: typeof BaseMenu.Group;
	GroupLabel: typeof GroupLabel;
	createHandle: typeof BaseMenu.createHandle;
}>;

/**
 * Dropdown menu over base-ui's Menu, with an arrow pointing at the trigger.
 * `Menu.Item` accepts an optional leading `icon`. The positioner keeps
 * `--popup-edge-padding` from the viewport's edges.
 *
 * @example
 * import RowActionsIcon from "@material-design-icons/svg/outlined/more_vert.svg?react";
 * import DownloadIcon from "@material-design-icons/svg/outlined/download.svg?react";
 *
 * <Menu.Root>
 *   <Menu.Trigger icon={RowActionsIcon} label="Row actions" />
 *   <Menu.Portal>
 *     <Menu.Positioner sideOffset={8}>
 *       <Menu.Popup>
 *         <Menu.Arrow />
 *         <Menu.Item icon={DownloadIcon} onClick={download}>
 *           Download
 *         </Menu.Item>
 *       </Menu.Popup>
 *     </Menu.Positioner>
 *   </Menu.Portal>
 * </Menu.Root>
 */
export const Menu: MenuParts = {
	Root: BaseMenu.Root,
	Trigger,
	Portal: BaseMenu.Portal,
	Positioner,
	Popup,
	Arrow,
	Item,
	LinkItem,
	Separator,
	Group: BaseMenu.Group,
	GroupLabel,
	createHandle: BaseMenu.createHandle,
};
