import { mergeProps } from "@base-ui/react/merge-props";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { clsx } from "clsx";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	useContext,
} from "react";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import { usePopupEdgePadding } from "../../lib/popup-edge-padding.ts";
import { useIntent } from "../../lib/use-intent.ts";
import { Skeleton } from "../skeleton/skeleton.tsx";
import styles from "./popover.module.scss";

export type PopoverRootProps<Payload = unknown> = Omit<
	BasePopover.Root.Props<Payload>,
	| "open"
	| "defaultOpen"
	| "onOpenChange"
	| "modal"
	| "children"
> &
	Readonly<{
		/** Whether the popover is open. Leave it out for a popover that keeps its own state. */
		open?: boolean;
		/** Whether the popover starts open, when it keeps its own state. @default false */
		defaultOpen?: boolean;
		/** Called with the new open state when the popover opens or closes. */
		onOpenChange?: BasePopover.Root.Props<Payload>["onOpenChange"];
		/** Whether focus stays inside the popover and the page behind it is inert while it is open. @default false */
		modal?: BasePopover.Root.Props<Payload>["modal"];
		/** The trigger and the popover's content. */
		children?: BasePopover.Root.Props<Payload>["children"];
	}>;

/** Holds the popover's open state for its parts. It renders no element of its own. */
const Root = <Payload,>(
	props: PopoverRootProps<Payload>,
): ReactNode => <BasePopover.Root {...props} />;

const LoadingContext = createContext(false);

export type PopoverTriggerProps = ComponentProps<
	typeof BasePopover.Trigger
> &
	Readonly<{
		/** Called once a pointer rests on the trigger or it takes focus, to warm what the popup shows. */
		onIntent?: () => void;
	}>;

/** The control that opens the popover, warming its content on intent. */
const Trigger = ({
	onIntent,
	onPointerEnter,
	onPointerLeave,
	onFocus,
	...props
}: PopoverTriggerProps): ReactNode => {
	const intent = useIntent(onIntent);

	return (
		<BasePopover.Trigger
			{...props}
			{...mergeProps<"button">(intent, {
				onPointerEnter,
				onPointerLeave,
				onFocus,
			})}
		/>
	);
};

export type PopoverPositionerProps = Omit<
	ComponentProps<typeof BasePopover.Positioner>,
	"ref"
>;

/** Places the popup against its trigger, clear of the viewport's edges. */
const Positioner = ({
	sideOffset = 12,
	className,
	...props
}: PopoverPositionerProps): ReactNode => (
	<BasePopover.Positioner
		{...usePopupEdgePadding()}
		sideOffset={sideOffset}
		className={clsx(styles.positioner, className)}
		{...props}
	/>
);

type SkeletonTextProps = Readonly<{
	children: ReactNode;
	className?: string;
}>;

const SkeletonText = ({
	children,
	className,
}: SkeletonTextProps) => (
	<span className={clsx(styles.skeletonText, className)}>
		<span className={styles.skeletonTextContent}>
			{children}
		</span>
		<Skeleton className={styles.skeletonTextOverlay} />
	</span>
);

export type PopoverPopupProps = ComponentProps<
	typeof BasePopover.Popup
> &
	(
		| Readonly<{
				/** Whether the content the popup describes is still in flight. */
				loading: boolean;
				/** Announced once while loading, in place of the placeholders. */
				loadingLabel: string;
		  }>
		| Readonly<{
				loading?: undefined;
				loadingLabel?: undefined;
		  }>
	);

/**
 * The popover's surface. While `loading`, its title and values draw as
 * placeholders and `loadingLabel` is announced once.
 */
const Popup = ({
	loading = false,
	loadingLabel,
	className,
	children,
	...props
}: PopoverPopupProps): ReactNode => {
	const busy =
		useBusyPhase({ busy: loading, busyAfter: 0 }) !==
		"fresh";

	return (
		<BasePopover.Popup
			className={clsx(styles.popup, className)}
			{...props}>
			{busy ? (
				<div role="status">
					<span className={styles.visuallyHidden}>
						{loadingLabel}
					</span>
				</div>
			) : null}
			<LoadingContext value={busy}>
				{children}
			</LoadingContext>
		</BasePopover.Popup>
	);
};

/** The arrow pointing from the popup at its trigger. */
const Arrow = ({
	className,
	...props
}: ComponentProps<typeof BasePopover.Arrow>): ReactNode => (
	<BasePopover.Arrow
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
	</BasePopover.Arrow>
);

/** The popover's heading, which names it. */
const Title = ({
	className,
	children,
	...props
}: ComponentProps<typeof BasePopover.Title>): ReactNode => {
	const loading = useContext(LoadingContext);

	return (
		<BasePopover.Title
			className={clsx(styles.title, className)}
			{...props}>
			{loading ? (
				<>
					<SkeletonText className={styles.titleSkeleton}>
						{children}
					</SkeletonText>
					<span className={styles.visuallyHidden}>
						{children}
					</span>
				</>
			) : (
				children
			)}
		</BasePopover.Title>
	);
};

/** A table of `Row`s whose labels and values line up in two columns. */
const Rows = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(styles.rows, className)}
		{...props}
	/>
);

export type PopoverRowProps = ComponentProps<"div">;

/** One labelled value: a `RowLabel`, then a `RowValue`. */
const Row = ({
	className,
	...props
}: PopoverRowProps): ReactNode => (
	<div className={clsx(styles.row, className)} {...props} />
);

export type PopoverRowLabelProps = ComponentProps<"span">;

/** What the row's value is, at its start. */
const RowLabel = ({
	className,
	...props
}: PopoverRowLabelProps): ReactNode => (
	<span
		className={clsx(styles.rowLabel, className)}
		{...props}
	/>
);

export type PopoverRowValueProps = ComponentProps<"span"> &
	Readonly<{
		/** Uses tabular figures for evenly spaced numbers. */
		numeric?: boolean;
	}>;

/** The row's value, beside its label; a placeholder while the popup is loading. */
const RowValue = ({
	numeric,
	className,
	children,
	...props
}: PopoverRowValueProps): ReactNode => {
	const loading = useContext(LoadingContext);

	return (
		<span
			className={clsx(styles.rowValue, className)}
			data-numeric={numeric || undefined}
			{...props}>
			{loading ? (
				<SkeletonText className={styles.valueSkeleton}>
					{children}
				</SkeletonText>
			) : (
				children
			)}
		</span>
	);
};

export type PopoverContentProps = PopoverPopupProps &
	Readonly<
		Pick<
			PopoverPositionerProps,
			"side" | "sideOffset" | "align" | "alignOffset"
		> & {
			/** The element the popover is portalled into. @default document.body */
			container?: BasePopover.Portal.Props["container"];
		}
	>;

/** `Portal`, `Positioner` and `Popup` in one: the popover's surface, placed against its trigger. */
const Content = ({
	container,
	side,
	sideOffset,
	align,
	alignOffset,
	...props
}: PopoverContentProps): ReactNode => (
	<BasePopover.Portal container={container}>
		<Positioner
			side={side}
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}>
			<Popup {...props} />
		</Positioner>
	</BasePopover.Portal>
);

type PopoverParts = Readonly<{
	Root: typeof Root;
	Trigger: typeof Trigger;
	Portal: typeof BasePopover.Portal;
	Positioner: typeof Positioner;
	Popup: typeof Popup;
	Content: typeof Content;
	Arrow: typeof Arrow;
	Title: typeof Title;
	Rows: typeof Rows;
	Row: typeof Row;
	RowLabel: typeof RowLabel;
	RowValue: typeof RowValue;
	Description: typeof BasePopover.Description;
	Close: typeof BasePopover.Close;
	createHandle: typeof BasePopover.createHandle;
}>;

/**
 * A rich popover over base-ui's `Popover`, with a `Title` and rows of labelled
 * values. `Content` bundles the portal, positioner and popup; the unbundled
 * parts stay.
 *
 * @example
 * <Popover.Root>
 *   <Popover.Trigger openOnHover onIntent={() => prefetchRate(id)}>
 *     € 1.234,56
 *   </Popover.Trigger>
 *   <Popover.Content loading={rate.isPending} loadingLabel="Loading the rate">
 *     <Popover.Arrow />
 *     <Popover.Title>Rate breakdown</Popover.Title>
 *     <Popover.Rows>
 *       <Popover.Row>
 *         <Popover.RowLabel>Base</Popover.RowLabel>
 *         <Popover.RowValue numeric>{rate.data?.base}</Popover.RowValue>
 *       </Popover.Row>
 *     </Popover.Rows>
 *   </Popover.Content>
 * </Popover.Root>
 */
export const Popover: PopoverParts = {
	Root,
	Trigger,
	Portal: BasePopover.Portal,
	Positioner,
	Popup,
	Content,
	Arrow,
	Title,
	Rows,
	Row,
	RowLabel,
	RowValue,
	Description: BasePopover.Description,
	Close: BasePopover.Close,
	createHandle: BasePopover.createHandle,
};
