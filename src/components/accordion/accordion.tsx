import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import style from "./accordion.module.scss";

export type AccordionRootProps = Omit<
	BaseAccordion.Root.Props<string>,
	"className"
> &
	Readonly<{ className?: string }>;

export type AccordionItemProps = Omit<
	BaseAccordion.Item.Props,
	"className" | "value"
> &
	Readonly<{
		className?: string;
		/** Identifies the item in the root's `value`. */
		value?: string;
	}>;

export type AccordionTriggerProps = Omit<
	BaseAccordion.Trigger.Props,
	"className" | "children"
> &
	Readonly<{
		className?: string;
		/** The label naming what the item's panel holds, then an `Accordion.Indicator`. */
		children: ReactNode;
	}>;

export type AccordionIndicatorProps =
	useRender.ComponentProps<"span">;

export type AccordionPanelProps = Omit<
	BaseAccordion.Panel.Props,
	"className"
> &
	Readonly<{ className?: string }>;

export type AccordionContentProps =
	useRender.ComponentProps<"div">;

/** The stack of items. */
const Root = ({
	className,
	...props
}: AccordionRootProps): ReactNode => (
	<BaseAccordion.Root
		className={clsx(style.root, className)}
		{...props}
	/>
);

/** One item: its header and its panel. */
const Item = ({
	className,
	...props
}: AccordionItemProps): ReactNode => (
	<BaseAccordion.Item
		className={clsx(style.item, className)}
		{...props}
	/>
);

/** The button that folds the item's panel open and shut, inside its `Header`. */
const Trigger = ({
	className,
	...props
}: AccordionTriggerProps): ReactNode => (
	<BaseAccordion.Trigger
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
}: AccordionIndicatorProps): ReactNode => {
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

/** What the item holds, folding along its height; its `Content` pads it. */
const Panel = ({
	className,
	...props
}: AccordionPanelProps): ReactNode => (
	<BaseAccordion.Panel
		{...props}
		className={clsx(style.panel, className)}
	/>
);

/**
 * The padded content inside the `Panel`.
 *
 * @example
 * <Accordion.Panel>
 * 	<Accordion.Content>{settings}</Accordion.Content>
 * </Accordion.Panel>
 */
const Content = ({
	render,
	className,
	ref,
	...props
}: AccordionContentProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.content, className),
		},
	});

type AccordionNamespace = Readonly<{
	Root: typeof Root;
	Item: typeof Item;
	Header: typeof BaseAccordion.Header;
	Trigger: typeof Trigger;
	Indicator: typeof Indicator;
	Panel: typeof Panel;
	Content: typeof Content;
}>;

/**
 * A stack of panels that fold open and shut, each under a heading whose
 * trigger names it, on base-ui's `Accordion`. `Header` renders an `<h3>`; pass
 * `render={<h2 />}` where the page's outline needs another level.
 *
 * @example
 * <Accordion.Root>
 * 	<Accordion.Item value="fees">
 * 		<Accordion.Header>
 * 			<Accordion.Trigger>
 * 				Fees
 * 				<Accordion.Indicator><ChevronIcon /></Accordion.Indicator>
 * 			</Accordion.Trigger>
 * 		</Accordion.Header>
 * 		<Accordion.Panel>
 * 			<Accordion.Content>{fees}</Accordion.Content>
 * 		</Accordion.Panel>
 * 	</Accordion.Item>
 * </Accordion.Root>
 */
export const Accordion: AccordionNamespace = {
	Root,
	Item,
	Header: BaseAccordion.Header,
	Trigger,
	Indicator,
	Panel,
	Content,
};
