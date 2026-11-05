import { mergeProps } from "@base-ui/react/merge-props";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import { useIntent } from "../../lib/use-intent.ts";
import style from "./tooltip.module.scss";

type Side = "top" | "right" | "bottom" | "left";

const DEFAULT_SIDE_OFFSET = 8;

export type TooltipTriggerProps =
	BaseTooltip.Trigger.Props &
		Readonly<{
			/** Called once a pointer rests on the trigger or it takes focus, to warm what the hint shows. */
			onIntent?: () => void;
		}>;

/** The element the hint describes, warming what it shows on intent. */
const TooltipTrigger = ({
	onIntent,
	onPointerEnter,
	onPointerLeave,
	onFocus,
	...props
}: TooltipTriggerProps): ReactNode => {
	const intent = useIntent(onIntent);

	return (
		<BaseTooltip.Trigger
			{...props}
			{...mergeProps<"button">(intent, {
				onPointerEnter,
				onPointerLeave,
				onFocus,
			})}
		/>
	);
};

/** Places the hint against its trigger. */
const TooltipPositioner = ({
	sideOffset = DEFAULT_SIDE_OFFSET,
	...props
}: BaseTooltip.Positioner.Props): ReactNode => (
	<BaseTooltip.Positioner
		sideOffset={sideOffset}
		{...props}
	/>
);

/** The hint's surface. */
const TooltipPopup = ({
	className,
	...props
}: BaseTooltip.Popup.Props): ReactNode => (
	<BaseTooltip.Popup
		className={clsx(style.popup, className)}
		{...props}
	/>
);

export type TooltipProps = Readonly<{
	/** The tooltip content; also serves as the visual hint for the trigger. */
	content: ReactNode;

	/**
	 * The trigger element, rendered in place via base-ui's `render` prop. Pass a
	 * single element exposing its own accessible name, not plain text.
	 */
	children: ReactElement;

	/** Preferred side to position the popup on. @default "top" */
	side?: Side;

	/** Distance in px between the popup and its anchor. @default 8 */
	sideOffset?: number;

	/** Called once a pointer rests on the trigger or it takes focus, to warm what `content` shows. */
	onIntent?: () => void;
}>;

const TooltipRoot = ({
	content,
	children,
	side = "top",
	sideOffset,
	onIntent,
}: TooltipProps): ReactElement => (
	<BaseTooltip.Root>
		<TooltipTrigger render={children} onIntent={onIntent} />
		<BaseTooltip.Portal>
			<TooltipPositioner
				side={side}
				sideOffset={sideOffset}>
				<TooltipPopup>{content}</TooltipPopup>
			</TooltipPositioner>
		</BaseTooltip.Portal>
	</BaseTooltip.Root>
);

type TooltipParts = typeof TooltipRoot &
	Omit<
		typeof BaseTooltip,
		"Trigger" | "Positioner" | "Popup"
	> &
	Readonly<{
		Trigger: typeof TooltipTrigger;
		Positioner: typeof TooltipPositioner;
		Popup: typeof TooltipPopup;
	}>;

/**
 * A hint on the trigger given as `children`, wired to describe it. Mount
 * `Tooltip.Provider` once near the app root; the parts hanging off it build a
 * tooltip by hand.
 *
 * @example
 * <Tooltip content="Previous page">
 * 	<button aria-label="Previous page">…</button>
 * </Tooltip>
 */
export const Tooltip: TooltipParts = Object.assign(
	TooltipRoot,
	{
		...BaseTooltip,
		Trigger: TooltipTrigger,
		Positioner: TooltipPositioner,
		Popup: TooltipPopup,
	},
);
