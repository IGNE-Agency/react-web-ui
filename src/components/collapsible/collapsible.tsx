import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Icon } from "../icon/icon.tsx";
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
		/** What the panel holds, as the trigger's label. */
		children: ReactNode;
	}>;

export type CollapsiblePanelProps = Omit<
	BaseCollapsible.Panel.Props,
	"className"
> &
	Readonly<{ className?: string }>;

const Root = ({
	className,
	...props
}: CollapsibleRootProps): ReactNode => (
	<BaseCollapsible.Root
		className={clsx(style.root, className)}
		{...props}
	/>
);

const Trigger = ({
	className,
	children,
	...props
}: CollapsibleTriggerProps): ReactNode => (
	<BaseCollapsible.Trigger
		className={clsx(style.trigger, className)}
		{...props}>
		{children}
		<Icon
			svg={ExpandMoreIcon}
			label=""
			size={1.5}
			className={style.chevron}
		/>
	</BaseCollapsible.Trigger>
);

const Panel = ({
	className,
	children,
	...props
}: CollapsiblePanelProps): ReactNode => (
	<BaseCollapsible.Panel className={style.panel} {...props}>
		<div className={clsx(style.content, className)}>
			{children}
		</div>
	</BaseCollapsible.Panel>
);

type CollapsibleNamespace = Readonly<{
	Root: typeof Root;
	Trigger: typeof Trigger;
	Panel: typeof Panel;
}>;

/**
 * A panel that folds open and shut under a trigger that names it, on base-ui's
 * `Collapsible`.
 *
 * @example
 * <Collapsible.Root>
 * 	<Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
 * 	<Collapsible.Panel>{settings}</Collapsible.Panel>
 * </Collapsible.Root>
 */
export const Collapsible: CollapsibleNamespace = {
	Root,
	Trigger,
	Panel,
};
