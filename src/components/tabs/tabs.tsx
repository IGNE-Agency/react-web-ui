import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { clsx } from "clsx";
import { createContext, type ReactNode, use } from "react";
import { Badge, type BadgeProps } from "../badge/badge.tsx";
import style from "./tabs.module.scss";

const InkCopyContext = createContext(false);

const ListChildrenContext = createContext<ReactNode>(null);

export type TabsRootProps = Omit<
	BaseTabs.Root.Props,
	| "className"
	| "value"
	| "defaultValue"
	| "onValueChange"
	| "orientation"
> &
	Readonly<{ className?: string }> &
	(
		| Readonly<{
				/** The open tab's `value`, when controlled. */
				value: string;
				onValueChange: (value: string) => void;
				defaultValue?: never;
		  }>
		| Readonly<{
				value?: never;
				/** The tab open at first, when uncontrolled. */
				defaultValue?: string;
				onValueChange?: (value: string) => void;
		  }>
	);

/** The tabs and the panels they open. */
const Root = ({
	value,
	defaultValue,
	onValueChange,
	className,
	...props
}: TabsRootProps): ReactNode => (
	<BaseTabs.Root
		{...props}
		value={value}
		defaultValue={defaultValue}
		onValueChange={next => {
			if (typeof next === "string") {
				onValueChange?.(next);
			}
		}}
		className={clsx(style.root, className)}
	/>
);

export type TabsListProps = Omit<
	BaseTabs.List.Props,
	"className" | "aria-label"
> &
	Readonly<{
		/** What the tabs switch between, such as "Invoice". */
		label: string;
		className?: string;
	}>;

/** The row of tabs, scrolling sideways when it outgrows its room. */
const List = ({
	label,
	className,
	children,
	...props
}: TabsListProps): ReactNode => (
	<div className={style.scroller}>
		<BaseTabs.List
			{...props}
			aria-label={label}
			className={clsx(style.list, className)}>
			<ListChildrenContext value={children}>
				{children}
			</ListChildrenContext>
		</BaseTabs.List>
	</div>
);

export type TabsTabProps = Omit<
	BaseTabs.Tab.Props,
	"className" | "value"
> &
	Readonly<{
		/** The `value` of the panel this tab opens. */
		value: string;
		className?: string;
	}>;

/** One tab: its label, and a `Count` where it has one. */
const Tab = ({
	value,
	className,
	children,
	...props
}: TabsTabProps): ReactNode =>
	use(InkCopyContext) ? (
		<span className={clsx(style.tab, className)}>
			{children}
		</span>
	) : (
		<BaseTabs.Tab
			{...props}
			value={value}
			className={clsx(style.tab, className)}>
			{children}
		</BaseTabs.Tab>
	);

export type TabsCountProps = BadgeProps;

/** A count after a tab's label, as a neutral badge. */
const Count = ({
	tone = "neutral",
	variant = "subtle",
	...props
}: TabsCountProps): ReactNode => (
	<Badge tone={tone} variant={variant} {...props} />
);

export type TabsIndicatorProps = Omit<
	BaseTabs.Indicator.Props,
	"className" | "children"
> &
	Readonly<{ className?: string }>;

/**
 * The pill that slides to the open tab, inside the `List`. It holds a copy of
 * the list's tabs, so the open tab's label turns over as the pill arrives.
 */
const Indicator = ({
	className,
	...props
}: TabsIndicatorProps): ReactNode => {
	const tabs = use(ListChildrenContext);

	return use(InkCopyContext) ? null : (
		<BaseTabs.Indicator
			{...props}
			className={clsx(style.indicator, className)}>
			<span
				className={style.indicatorLabels}
				aria-hidden="true">
				<InkCopyContext value>{tabs}</InkCopyContext>
			</span>
		</BaseTabs.Indicator>
	);
};

export type TabsPanelProps = Omit<
	BaseTabs.Panel.Props,
	"className" | "value"
> &
	Readonly<{
		/** The `value` of the tab that opens this panel. */
		value: string;
		className?: string;
	}>;

/** What one tab opens. */
const Panel = ({
	className,
	...props
}: TabsPanelProps): ReactNode => (
	<BaseTabs.Panel
		{...props}
		className={clsx(style.panel, className)}
	/>
);

type TabsParts = Readonly<{
	Root: typeof Root;
	List: typeof List;
	Tab: typeof Tab;
	Count: typeof Count;
	Indicator: typeof Indicator;
	Panel: typeof Panel;
}>;

/**
 * In-page tabs over base-ui's `Tabs`, with a pill that slides to the open tab.
 * Tabs that lead to pages are a horizontal `Nav`.
 *
 * @example
 * <Tabs.Root defaultValue="details">
 * 	<Tabs.List label="Invoice">
 * 		<Tabs.Tab value="details">Details</Tabs.Tab>
 * 		<Tabs.Tab value="history">History<Tabs.Count>3</Tabs.Count></Tabs.Tab>
 * 		<Tabs.Indicator />
 * 	</Tabs.List>
 * 	<Tabs.Panel value="details">…</Tabs.Panel>
 * 	<Tabs.Panel value="history">…</Tabs.Panel>
 * </Tabs.Root>
 */
export const Tabs: TabsParts = {
	Root,
	List,
	Tab,
	Count,
	Indicator,
	Panel,
};
