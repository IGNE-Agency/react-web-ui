import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import style from "./collapsible.module.scss";

export type CollapsibleRootProps = Omit<
	BaseCollapsible.Root.Props,
	"className"
> &
	Readonly<{ className?: string }>;

export type CollapsibleTriggerProps = Omit<
	BaseCollapsible.Trigger.Props,
	"className" | "children"
> &
	Readonly<{
		className?: string;
		/** The label naming what the panel holds, then a `Collapsible.Indicator`. */
		children: ReactNode;
	}>;

export type CollapsibleIndicatorProps =
	useRender.ComponentProps<"span">;

export type CollapsiblePanelProps = Omit<
	BaseCollapsible.Panel.Props,
	"className"
> &
	Readonly<{ className?: string }>;

export type CollapsibleContentProps =
	useRender.ComponentProps<"div">;

/** The trigger and its panel. */
const Root = ({
	className,
	...props
}: CollapsibleRootProps): ReactNode => (
	<BaseCollapsible.Root
		className={clsx(style.root, className)}
		{...props}
	/>
);

/** The button that folds the panel open and shut. */
const Trigger = ({
	className,
	...props
}: CollapsibleTriggerProps): ReactNode => (
	<BaseCollapsible.Trigger
		className={clsx(style.trigger, className)}
		{...props}
	/>
);

/**
 * The trigger's open-state glyph, such as the app's chevron, turned over while
 * the panel is open. Put it last in the `Trigger`; without children it renders
 * nothing.
 */
const Indicator = ({
	render,
	className,
	children,
	ref,
	...props
}: CollapsibleIndicatorProps): ReactNode => {
	const element = useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.indicator, className),
			children,
		},
	});

	return children === undefined || children === null
		? null
		: element;
};

/** What the trigger folds, along its height; its `Content` pads it. */
const Panel = ({
	className,
	...props
}: CollapsiblePanelProps): ReactNode => (
	<BaseCollapsible.Panel
		{...props}
		className={clsx(style.panel, className)}
	/>
);

/**
 * The padded content inside the `Panel`.
 *
 * @example
 * <Collapsible.Panel>
 * 	<Collapsible.Content>{settings}</Collapsible.Content>
 * </Collapsible.Panel>
 */
const Content = ({
	render,
	className,
	ref,
	...props
}: CollapsibleContentProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.content, className),
		},
	});

type CollapsibleNamespace = Readonly<{
	Root: typeof Root;
	Trigger: typeof Trigger;
	Indicator: typeof Indicator;
	Panel: typeof Panel;
	Content: typeof Content;
}>;

/**
 * A panel that folds open and shut under a trigger that names it, on base-ui's
 * `Collapsible`.
 *
 * @example
 * <Collapsible.Root>
 * 	<Collapsible.Trigger>
 * 		Advanced settings
 * 		<Collapsible.Indicator><ChevronIcon /></Collapsible.Indicator>
 * 	</Collapsible.Trigger>
 * 	<Collapsible.Panel>
 * 		<Collapsible.Content>{settings}</Collapsible.Content>
 * 	</Collapsible.Panel>
 * </Collapsible.Root>
 */
export const Collapsible: CollapsibleNamespace = {
	Root,
	Trigger,
	Indicator,
	Panel,
	Content,
};
