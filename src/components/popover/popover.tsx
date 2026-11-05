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

const LoadingContext = createContext(false);

export type PopoverTriggerProps = ComponentProps<
	typeof BasePopover.Trigger
> &
	Readonly<{
		/** Called once a pointer rests on the trigger or it takes focus, to warm what the popup shows. */
		onIntent?: () => void;
	}>;

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

const Heading = ({
	className,
	children,
	...props
}: ComponentProps<typeof BasePopover.Title>): ReactNode => {
	const loading = useContext(LoadingContext);

	return (
		<BasePopover.Title
			className={clsx(styles.heading, className)}
			{...props}>
			{loading ? (
				<>
					<SkeletonText className={styles.headingSkeleton}>
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

const Rows = ({
	className,
	...props
}: ComponentProps<"div">): ReactNode => (
	<div
		className={clsx(styles.rows, className)}
		{...props}
	/>
);

export type PopoverRowProps = Readonly<{
	/** Left-aligned descriptor. */
	label: ReactNode;
	/** Value displayed beside the label. */
	children: ReactNode;
	/** Uses tabular figures for evenly spaced numbers. */
	numeric?: boolean;
	className?: string;
}>;

const Row = ({
	label,
	children,
	numeric,
	className,
}: PopoverRowProps): ReactNode => {
	const loading = useContext(LoadingContext);

	return (
		<div className={clsx(styles.row, className)}>
			<span className={styles.rowLabel}>{label}</span>
			<span
				className={styles.rowValue}
				data-numeric={numeric || undefined}>
				{loading ? (
					<SkeletonText className={styles.valueSkeleton}>
						{label}
					</SkeletonText>
				) : (
					children
				)}
			</span>
		</div>
	);
};

type PopoverParts = Readonly<{
	Root: typeof BasePopover.Root;
	Trigger: typeof Trigger;
	Portal: typeof BasePopover.Portal;
	Positioner: typeof Positioner;
	Popup: typeof Popup;
	Arrow: typeof Arrow;
	Heading: typeof Heading;
	Rows: typeof Rows;
	Row: typeof Row;
	Description: typeof BasePopover.Description;
	Close: typeof BasePopover.Close;
	createHandle: typeof BasePopover.createHandle;
}>;

/**
 * Rich light popover over base-ui's Popover. Adds a styled `Heading` and a
 * labelled `Row` slot (label on the left, value on the right) for cell-level
 * composition explainers. The positioner keeps `--popup-edge-padding` from the
 * viewport's edges.
 *
 * @example
 * <Popover.Root>
 *   <Popover.Trigger openOnHover onIntent={() => prefetchRate(id)}>
 *     € 1.234,56
 *   </Popover.Trigger>
 *   <Popover.Portal>
 *     <Popover.Positioner>
 *       <Popover.Popup loading={rate.isPending} loadingLabel="Loading the rate">
 *         <Popover.Arrow />
 *         <Popover.Heading>Rate breakdown</Popover.Heading>
 *         <Popover.Rows>
 *           <Popover.Row numeric label="Base">{rate.data?.base}</Popover.Row>
 *         </Popover.Rows>
 *       </Popover.Popup>
 *     </Popover.Positioner>
 *   </Popover.Portal>
 * </Popover.Root>
 */
export const Popover: PopoverParts = {
	Root: BasePopover.Root,
	Trigger,
	Portal: BasePopover.Portal,
	Positioner,
	Popup,
	Arrow,
	Heading,
	Rows,
	Row,
	Description: BasePopover.Description,
	Close: BasePopover.Close,
	createHandle: BasePopover.createHandle,
};
