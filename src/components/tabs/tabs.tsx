import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { clsx } from "clsx";
import { createContext, type ReactNode } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { Badge } from "../badge/badge.tsx";
import style from "./tabs.module.scss";

/** One tab in a bar, and the panel it opens. */
export type Tab = Readonly<{
	value: string;
	label: string;
	/** A count shown as a trailing badge. */
	count?: number;
	disabled?: boolean;
}>;

const TabsContext = createContext<readonly Tab[] | null>(
	null,
);

const useTabs = (): readonly Tab[] =>
	useRequiredContext(
		TabsContext,
		"Tabs parts must be rendered inside Tabs.Root.",
	);

export type TabsRootProps = Readonly<{
	tabs: readonly Tab[];
	className?: string;
	children: ReactNode;
}> &
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

const Root = ({
	tabs,
	value,
	defaultValue,
	onValueChange,
	className,
	children,
}: TabsRootProps): ReactNode => (
	<TabsContext value={tabs}>
		<BaseTabs.Root
			value={value}
			defaultValue={defaultValue}
			onValueChange={next => {
				if (typeof next === "string") {
					onValueChange?.(next);
				}
			}}
			className={clsx(style.root, className)}>
			{children}
		</BaseTabs.Root>
	</TabsContext>
);

const TabContent = ({
	tab,
}: Readonly<{ tab: Tab }>): ReactNode => (
	<>
		{tab.label}
		{tab.count === undefined ? null : (
			<Badge tone="neutral" variant="subtle">
				{tab.count}
			</Badge>
		)}
	</>
);

export type TabsBarProps = Readonly<{
	/** What the tabs switch between, such as "Declaration". */
	label: string;
	className?: string;
}>;

const Bar = ({
	label,
	className,
}: TabsBarProps): ReactNode => {
	const tabs = useTabs();

	return (
		<div className={clsx(style.scroller, className)}>
			<BaseTabs.List
				className={style.list}
				aria-label={label}>
				{tabs.map(tab => (
					<BaseTabs.Tab
						key={tab.value}
						value={tab.value}
						disabled={tab.disabled}
						className={style.tab}>
						<TabContent tab={tab} />
					</BaseTabs.Tab>
				))}
				<BaseTabs.Indicator className={style.indicator}>
					<span
						className={style.indicatorLabels}
						aria-hidden="true">
						{tabs.map(tab => (
							<span key={tab.value} className={style.tab}>
								<TabContent tab={tab} />
							</span>
						))}
					</span>
				</BaseTabs.Indicator>
			</BaseTabs.List>
		</div>
	);
};

export type TabsPanelProps = Readonly<{
	/** The `value` of the tab that opens this panel. */
	value: string;
	className?: string;
	children: ReactNode;
}>;

const Panel = ({
	value,
	className,
	children,
}: TabsPanelProps): ReactNode => (
	<BaseTabs.Panel
		value={value}
		className={clsx(style.panel, className)}>
		{children}
	</BaseTabs.Panel>
);

type TabsParts = Readonly<{
	Root: typeof Root;
	Bar: typeof Bar;
	Panel: typeof Panel;
}>;

/**
 * In-page tabs over base-ui's `Tabs`: `Root` takes the tabs, `Bar` lays them
 * out with a pill that slides to the open one, and each `Panel` holds what its
 * tab opens. Tabs that lead to pages are a horizontal `Nav`.
 *
 * @example
 * <Tabs.Root tabs={[{ value: "details", label: "Details" }, { value: "history", label: "History", count: 3 }]} defaultValue="details">
 * 	<Tabs.Bar label="Declaration" />
 * 	<Tabs.Panel value="details">…</Tabs.Panel>
 * 	<Tabs.Panel value="history">…</Tabs.Panel>
 * </Tabs.Root>
 */
export const Tabs: TabsParts = {
	Root,
	Bar,
	Panel,
};
