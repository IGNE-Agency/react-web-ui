import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	type ReactNode,
	use,
	useState,
} from "react";
import { useSlidingIndicator } from "../../lib/sliding-indicator/index.ts";
import { IconButton } from "../button/button.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import {
	NavContext,
	type NavOrientation,
} from "./nav-context.ts";
import {
	EntryShell,
	entryAttributes,
	type NavEntryProps,
} from "./nav-item-view.tsx";
import style from "./nav.module.scss";

const useOrientation = (): NavOrientation =>
	use(NavContext)?.orientation ?? "vertical";

export type NavRootProps = Omit<
	ComponentPropsWithRef<"nav">,
	"aria-label"
> &
	Readonly<{
		/** What the nav leads through, such as "Main". */
		"aria-label": string;
		/** A bar of tabs that lead to pages, or the app's rail. @default "vertical" */
		orientation?: NavOrientation;
	}>;

const Root = ({
	orientation = "vertical",
	className,
	children,
	...props
}: NavRootProps): ReactNode => {
	const [hint] = useState(() =>
		BaseTooltip.createHandle<string>(),
	);

	return (
		<NavContext value={{ orientation, hint }}>
			<nav
				data-orientation={orientation}
				className={clsx(style.root, className)}
				{...props}>
				{children}
			</nav>
			<Tooltip.Root handle={hint}>
				{({ payload }) => (
					<Tooltip.Portal>
						<Tooltip.Positioner
							side={
								orientation === "vertical"
									? "right"
									: "bottom"
							}
							className={style.hintPositioner}>
							<Tooltip.Popup>
								<Tooltip.Viewport
									className={style.hintViewport}>
									{payload}
								</Tooltip.Viewport>
							</Tooltip.Popup>
						</Tooltip.Positioner>
					</Tooltip.Portal>
				)}
			</Tooltip.Root>
		</NavContext>
	);
};

export type NavListProps = ComponentPropsWithRef<"ul">;

const ACTIVE_ENTRY =
	':scope > li:has(> [aria-current="page"]), :scope > li:has(> [data-active="true"])';

/**
 * The entries. In a horizontal nav a pill slides to the entry marked
 * `aria-current="page"` or `data-active="true"`.
 */
const List = ({
	className,
	children,
	ref,
	...props
}: NavListProps): ReactNode => {
	const orientation = useOrientation();
	const horizontal = orientation === "horizontal";
	const indicator = useSlidingIndicator<HTMLLIElement>({
		active: ACTIVE_ENTRY,
		prefix: "--active-tab",
		publishOn: "parent",
	});
	const list = useRender({
		defaultTagName: "ul",
		ref,
		props: {
			"data-orientation": orientation,
			className: clsx(style.list, className),
			...props,
			children: (
				<>
					{horizontal ? (
						<li
							ref={indicator}
							aria-hidden="true"
							className={style.indicator}
						/>
					) : null}
					{children}
				</>
			),
		},
	});

	return horizontal ? (
		<div className={style.scroller}>{list}</div>
	) : (
		list
	);
};

export type NavItemProps = ComponentPropsWithRef<"li">;

const Item = (props: NavItemProps): ReactNode => (
	<li {...props} />
);

export type NavLinkProps = ComponentPropsWithRef<"a"> &
	NavEntryProps;

/**
 * A destination. It spreads every other prop onto the `<a>` and forwards its
 * ref, so a router's `createLink` can wrap it; the router's
 * `aria-current="page"` marks the current one.
 */
const Link = ({
	layout,
	labelled,
	label,
	className,
	...props
}: NavLinkProps): ReactNode => {
	const orientation = useOrientation();

	return (
		<EntryShell
			layout={layout}
			labelled={labelled}
			label={label}
			element={
				<a
					{...entryAttributes({ layout, labelled, label })}
					className={clsx(
						orientation === "horizontal"
							? style.tab
							: style.item,
						className,
					)}
					{...props}
				/>
			}
		/>
	);
};

export type NavGroupProps = Omit<
	ComponentPropsWithRef<"div">,
	"onToggle"
> &
	(
		| Readonly<{
				/** Whether the subpages show, when controlled. */
				open: boolean;
				onOpenChange: (open: boolean) => void;
				defaultOpen?: never;
		  }>
		| Readonly<{
				open?: never;
				/** Whether the subpages show at first, when uncontrolled. @default false */
				defaultOpen?: boolean;
				onOpenChange?: (open: boolean) => void;
		  }>
	);

/**
 * A destination with subpages: a `GroupHeader` holding its own `Link` and a
 * `GroupToggle`, over a `GroupPanel` that folds open a `GroupList` of subpages.
 */
const Group = ({
	open,
	defaultOpen = false,
	onOpenChange,
	className,
	children,
	...props
}: NavGroupProps): ReactNode => {
	const [own, setOwn] = useState(defaultOpen);
	const current = open ?? own;

	return (
		<BaseCollapsible.Root
			open={current}
			onOpenChange={next => {
				setOwn(next);
				onOpenChange?.(next);
			}}
			className={clsx(style.group, className)}
			{...props}>
			{children}
		</BaseCollapsible.Root>
	);
};

export type NavGroupHeaderProps =
	ComponentPropsWithRef<"div">;

/** The group's row: its own `Link`, then its `GroupToggle`. Filled while that link is current. */
const GroupHeader = ({
	className,
	...props
}: NavGroupHeaderProps): ReactNode => (
	<div
		className={clsx(style.groupHeader, className)}
		{...props}
	/>
);

export type NavGroupToggleProps = Omit<
	ComponentPropsWithRef<"button">,
	"children" | "aria-label"
> &
	Readonly<{
		/** Accessible name, such as "Show subpages", surfaced as the tooltip hint and the `aria-label`. */
		label: string;
		/** The expand chevron, pointing down while closed; it turns over while open. */
		children: ReactNode;
	}>;

/** The icon-only button that folds the group's subpages open and shut; its children are the chevron. */
const GroupToggle = ({
	label,
	children,
	className,
	...props
}: NavGroupToggleProps): ReactNode => (
	<IconButton
		{...props}
		variant="tertiary"
		className={clsx(style.groupToggle, className)}
		label={label}
		render={<BaseCollapsible.Trigger />}>
		{children}
	</IconButton>
);

export type NavGroupPanelProps = Omit<
	BaseCollapsible.Panel.Props,
	"className"
> &
	Readonly<{ className?: string }>;

/** The fold that opens and shuts the group's `GroupList`. */
const GroupPanel = ({
	className,
	...props
}: NavGroupPanelProps): ReactNode => (
	<BaseCollapsible.Panel
		{...props}
		className={clsx(style.groupPanel, className)}
	/>
);

export type NavGroupListProps = ComponentPropsWithRef<"ul">;

/** The subpages, each a `Nav.Item` holding a `Nav.Link`, joined to the group by branch lines. */
const GroupList = ({
	className,
	...props
}: NavGroupListProps): ReactNode => (
	<ul
		{...props}
		className={clsx(style.groupList, className)}
	/>
);

type NavParts = Readonly<{
	Root: typeof Root;
	List: typeof List;
	Item: typeof Item;
	Link: typeof Link;
	Group: typeof Group;
	GroupHeader: typeof GroupHeader;
	GroupToggle: typeof GroupToggle;
	GroupPanel: typeof GroupPanel;
	GroupList: typeof GroupList;
}>;

/**
 * Navigation between pages as `nav > ul > li > a`: a horizontal bar of tabs
 * with a pill that slides to the current page, or the app's vertical rail,
 * whose destinations with subpages fold them open in a `Group`. An entry that
 * is not a link is a `NavItemView.Root`.
 *
 * @example
 * const NavLink = createLink(Nav.Link);
 *
 * <Nav.Root aria-label="Main">
 * 	<Nav.List>
 * 		<Nav.Item>
 * 			<NavLink to="/" label="Home" activeOptions={{ exact: true }}>
 * 				<NavItemView.Icon><HomeIcon /></NavItemView.Icon>
 * 				<NavItemView.Label>Home</NavItemView.Label>
 * 			</NavLink>
 * 		</Nav.Item>
 * 	</Nav.List>
 * </Nav.Root>
 */
export const Nav: NavParts = {
	Root,
	List,
	Item,
	Link,
	Group,
	GroupHeader,
	GroupToggle,
	GroupPanel,
	GroupList,
};
