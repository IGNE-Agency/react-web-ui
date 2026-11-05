import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Icon } from "../icon/icon.tsx";
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
		/** What the item's panel holds, as the trigger's label. */
		children: ReactNode;
	}>;

export type AccordionPanelProps = Omit<
	BaseAccordion.Panel.Props,
	"className"
> &
	Readonly<{ className?: string }>;

const Root = ({
	className,
	...props
}: AccordionRootProps): ReactNode => (
	<BaseAccordion.Root
		className={clsx(style.root, className)}
		{...props}
	/>
);

const Item = ({
	className,
	...props
}: AccordionItemProps): ReactNode => (
	<BaseAccordion.Item
		className={clsx(style.item, className)}
		{...props}
	/>
);

const Trigger = ({
	className,
	children,
	...props
}: AccordionTriggerProps): ReactNode => (
	<BaseAccordion.Trigger
		className={clsx(style.trigger, className)}
		{...props}>
		{children}
		<Icon
			svg={ExpandMoreIcon}
			label=""
			size={1.5}
			className={style.chevron}
		/>
	</BaseAccordion.Trigger>
);

const Panel = ({
	className,
	children,
	...props
}: AccordionPanelProps): ReactNode => (
	<BaseAccordion.Panel className={style.panel} {...props}>
		<div className={clsx(style.content, className)}>
			{children}
		</div>
	</BaseAccordion.Panel>
);

type AccordionNamespace = Readonly<{
	Root: typeof Root;
	Item: typeof Item;
	Header: typeof BaseAccordion.Header;
	Trigger: typeof Trigger;
	Panel: typeof Panel;
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
 * 			<Accordion.Trigger>Fees</Accordion.Trigger>
 * 		</Accordion.Header>
 * 		<Accordion.Panel>{fees}</Accordion.Panel>
 * 	</Accordion.Item>
 * </Accordion.Root>
 */
export const Accordion: AccordionNamespace = {
	Root,
	Item,
	Header: BaseAccordion.Header,
	Trigger,
	Panel,
};
