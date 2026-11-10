import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	type ReactElement,
	type ReactNode,
	use,
	useState,
} from "react";
import { useSlidingIndicator } from "../../lib/sliding-indicator/index.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { Tooltip } from "../tooltip/tooltip.tsx";
import {
	NavContext,
	type NavContextValue,
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

const useNav = (): NavContextValue =>
	useRequiredContext(
		NavContext,
		"Nav.Hint must be rendered inside <Nav.Root>.",
	);

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

/** The `<nav>`, holding the one hint its entries share. */
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
		</NavContext>
	);
};

export type NavHintProps = Readonly<{ className?: string }>;

/**
 * The one tooltip every entry with a `label` names itself through, so the hint
 * travels between entries rather than one closing as the next opens. Mount it
 * inside `Root` where the entries show no label, such as a collapsed rail.
 *
 * @example
 * <Nav.Root aria-label="Main">
 * 	<Nav.List>…</Nav.List>
 * 	{collapsed ? <Nav.Hint /> : null}
 * </Nav.Root>
 */
const Hint = ({ className }: NavHintProps): ReactNode => {
	const { orientation, hint } = useNav();

	return (
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
						<Tooltip.Popup className={className}>
							<Tooltip.Viewport
								className={style.hintViewport}>
								{payload}
							</Tooltip.Viewport>
						</Tooltip.Popup>
					</Tooltip.Positioner>
				</Tooltip.Portal>
			)}
		</Tooltip.Root>
	);
};

export type NavScrollerProps =
	useRender.ComponentProps<"div">;

/**
 * Lets a horizontal `List` scroll sideways once it outgrows its room.
 *
 * @example
 * <Nav.Scroller>
 * 	<Nav.List>…</Nav.List>
 * </Nav.Scroller>
 */
const Scroller = ({
	render,
	className,
	ref,
	...props
}: NavScrollerProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.scroller, className),
		},
	});

export type NavListProps = ComponentPropsWithRef<"ul">;

/** The entries, laid out along the nav's orientation. */
const List = ({
	className,
	ref,
	...props
}: NavListProps): ReactElement => {
	const orientation = useOrientation();

	return useRender({
		defaultTagName: "ul",
		ref,
		props: {
			"data-orientation": orientation,
			className: clsx(style.list, className),
			...props,
		},
	});
};

const ACTIVE_ENTRY =
	':scope > li:has(> [aria-current="page"]), :scope > li:has(> [data-active="true"])';

export type NavIndicatorProps = Omit<
	useRender.ComponentProps<"li">,
	"children"
>;

/**
 * The pill that slides to the entry marked `aria-current="page"` or
 * `data-active="true"`, inside a horizontal `List`.
 *
 * @example
 * <Nav.List>
 * 	<Nav.Indicator />
 * 	<Nav.Item>…</Nav.Item>
 * </Nav.List>
 */
const Indicator = ({
	render,
	className,
	ref,
	...props
}: NavIndicatorProps): ReactElement => {
	const indicator = useSlidingIndicator<HTMLLIElement>({
		active: ACTIVE_ENTRY,
		prefix: "--active-tab",
		publishOn: "parent",
	});

	return useRender({
		defaultTagName: "li",
		render,
		ref: ref === undefined ? indicator : [indicator, ref],
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.indicator, className),
		},
	});
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
	label,
	className,
	...props
}: NavLinkProps): ReactNode => {
	const orientation = useOrientation();

	return (
		<EntryShell
			label={label}
			element={
				<a
					{...entryAttributes({ layout, label })}
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
	BaseCollapsible.Trigger.Props,
	"render"
> &
	Readonly<{
		/** The button to render, such as `<IconButton label="Show subpages" variant="tertiary"><ExpandIcon /></IconButton>`. */
		render: ReactElement;
	}>;

/**
 * The trigger that folds the group's subpages open and shut, rendered as the
 * button it is given.
 *
 * @example
 * <Nav.GroupToggle render={<IconButton label="Show subpages" variant="tertiary"><ExpandIcon /></IconButton>} />
 */
const GroupToggle = ({
	className,
	...props
}: NavGroupToggleProps): ReactNode => (
	<BaseCollapsible.Trigger
		className={clsx(style.groupToggle, className)}
		{...props}
	/>
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
	Hint: typeof Hint;
	Scroller: typeof Scroller;
	List: typeof List;
	Indicator: typeof Indicator;
	Item: typeof Item;
	Link: typeof Link;
	Group: typeof Group;
	GroupHeader: typeof GroupHeader;
	GroupToggle: typeof GroupToggle;
	GroupPanel: typeof GroupPanel;
	GroupList: typeof GroupList;
}>;

/**
 * Navigation between pages as `nav > ul > li > a`: a horizontal bar of tabs,
 * in a `Scroller` with an `Indicator` that slides to the current page, or the
 * app's vertical rail, whose destinations with subpages fold them open in a
 * `Group` and whose entries without a visible label are named by the `Hint`.
 * An entry that is not a link is a `NavItemView.Root`.
 *
 * @example
 * const NavLink = createLink(Nav.Link);
 *
 * <Nav.Root aria-label="Main">
 * 	<Nav.List>
 * 		<Nav.Item>
 * 			<NavLink to="/" activeOptions={{ exact: true }}>
 * 				<NavItemView.Icon><HomeIcon /></NavItemView.Icon>
 * 				<NavItemView.Label>Home</NavItemView.Label>
 * 			</NavLink>
 * 		</Nav.Item>
 * 	</Nav.List>
 * </Nav.Root>
 */
export const Nav: NavParts = {
	Root,
	Hint,
	Scroller,
	List,
	Indicator,
	Item,
	Link,
	Group,
	GroupHeader,
	GroupToggle,
	GroupPanel,
	GroupList,
};
