import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type {
	ComponentProps,
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import {
	Button as AriaButton,
	DateInput as AriaDateInput,
	DateSegment as AriaDateSegment,
	Dialog as AriaDialog,
	Group as AriaGroup,
	type GroupProps as AriaGroupProps,
	Popover as AriaPopover,
} from "react-aria-components";
import {
	Field,
	type FieldLabelProps,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
} from "../../components/field/index.ts";
import { focusControlOnRim } from "../../components/field/rim-focus.ts";
import { withFieldFocus } from "../../components/field/use-field-focus.ts";
import style from "./temporal.module.scss";

export type TemporalStateProps = Readonly<{
	/** Projected onto the element as presence-style `data-*` attributes. */
	state?: FieldState;
}>;

export type TemporalLabelProps = FieldLabelProps;

/**
 * The visible label of a date or time control: a `span` its `Root` names
 * itself by through `aria-labelledby`. Renders nothing without children.
 *
 * @example
 * <DateInput.Label id={labelId}>Service date <Field.Requiredness optionalLabel="optional" /></DateInput.Label>
 */
export const TemporalLabel = (
	props: TemporalLabelProps,
): ReactNode => (
	<Field.Label
		nativeLabel={false}
		render={<span />}
		{...props}
	/>
);

export type TemporalGroupProps = Omit<
	AriaGroupProps,
	"children"
> &
	TemporalStateProps &
	Readonly<{ children?: ReactNode }>;

/**
 * The shell carrying the border, the ring and the inlay row.
 *
 * @example
 * <DateInput.Group state={state}><DateInput.Input>…</DateInput.Input></DateInput.Group>
 */
export const TemporalGroup = ({
	state,
	className,
	children,
	...props
}: TemporalGroupProps): ReactNode => {
	const focus = useFieldFocus(props);
	return (
		<AriaGroup
			className={clsx(style.group, className)}
			onMouseDown={focusControlOnRim}
			isReadOnly={state?.readonly}
			{...fieldStateAttributes(
				withFieldFocus(state ?? {}, focus),
			)}
			{...props}
			{...focus.props}>
			{children}
		</AriaGroup>
	);
};

export type TemporalSegmentProps = Omit<
	ComponentProps<typeof AriaDateSegment>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * One editable unit of a date or time, which an `Input` renders per segment.
 *
 * @example
 * <DateInput.Input>{segment => <DateInput.Segment segment={segment} />}</DateInput.Input>
 */
export const TemporalSegment = ({
	className,
	...props
}: TemporalSegmentProps): ReactNode => (
	<AriaDateSegment
		className={clsx(style.segment, className)}
		{...props}
	/>
);

export type TemporalInputProps = Omit<
	ComponentProps<typeof AriaDateInput>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * The segments of one date or time, bare inside a `Group`. Its children render
 * each segment.
 *
 * @example
 * <DateInput.Input>{segment => <DateInput.Segment segment={segment} />}</DateInput.Input>
 */
export const TemporalInput = ({
	className,
	...props
}: TemporalInputProps): ReactNode => (
	<AriaDateInput
		className={clsx(style.input, className)}
		{...props}
	/>
);

export type TemporalRangeInputProps = Omit<
	TemporalInputProps,
	"slot"
> &
	Readonly<{
		/** The end of the range the segments edit. */
		slot: "start" | "end";
	}>;

/**
 * The segments of one end of a date range, sized to its content.
 *
 * @example
 * <DateRangeInput.Input slot="start">{segment => <DateRangeInput.Segment segment={segment} />}</DateRangeInput.Input>
 */
export const TemporalRangeInput = ({
	className,
	...props
}: TemporalRangeInputProps): ReactNode => (
	<AriaDateInput
		className={clsx(style.rangeInput, className)}
		{...props}
	/>
);

export type TemporalRangeSeparatorProps =
	useRender.ComponentProps<"span">;

/**
 * The mark between a range's start and end, such as a dash. Decoration only.
 *
 * @example
 * <DateRangeInput.Separator>–</DateRangeInput.Separator>
 */
export const TemporalRangeSeparator = ({
	render,
	className,
	ref,
	...props
}: TemporalRangeSeparatorProps): ReactNode =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.rangeSeparator, className),
		},
	});

export type TemporalRangeSpacerProps =
	useRender.ComponentProps<"span">;

/**
 * The space that pushes a range's inlays to the end of its group.
 *
 * @example
 * <DateRangeInput.Spacer />
 */
export const TemporalRangeSpacer = ({
	render,
	className,
	ref,
	...props
}: TemporalRangeSpacerProps): ReactNode =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.rangeSpacer, className),
		},
	});

export type TemporalButtonProps = Omit<
	ComponentPropsWithRef<"button">,
	"type" | "children"
> &
	Readonly<{
		/** The button to render, a kit `Button` or `IconButton`, which renders react-aria's button underneath. */
		render: useRender.RenderProp;
	}>;

/**
 * The button that opens the calendar. It renders whichever button it is given.
 *
 * @example
 * <DateInput.Trigger
 * 	ref={triggerRef}
 * 	render={
 * 		<IconButton label="Open calendar" variant="tertiary" size="sm">
 * 			<CalendarTodayIcon />
 * 		</IconButton>
 * 	}
 * />
 */
export const TemporalTrigger = ({
	render,
	className,
	ref,
	...props
}: TemporalButtonProps): ReactNode =>
	useRender({
		render,
		ref,
		props: {
			...props,
			className: clsx(style.trigger, className),
			render: <AriaButton />,
		},
	});

export type TemporalPopoverProps = Omit<
	ComponentProps<typeof AriaPopover>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * The floating surface the calendar lands on, aligned to whatever `triggerRef`
 * names: the calendar button, rather than the whole field.
 *
 * @example
 * <DateInput.Popover triggerRef={triggerRef}><DateInput.Dialog>…</DateInput.Dialog></DateInput.Popover>
 */
export const TemporalPopover = ({
	className,
	placement = "bottom end",
	...props
}: TemporalPopoverProps): ReactNode => (
	<AriaPopover
		className={clsx(style.popover, className)}
		placement={placement}
		{...props}
	/>
);

export type TemporalDialogProps = Omit<
	ComponentProps<typeof AriaDialog>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * The dialog inside the popover, which holds the calendar and its focus.
 *
 * @example
 * <DateInput.Dialog><DateInput.Calendar>…</DateInput.Calendar></DateInput.Dialog>
 */
export const TemporalDialog = ({
	className,
	...props
}: TemporalDialogProps): ReactNode => (
	<AriaDialog
		className={clsx(style.dialog, className)}
		{...props}
	/>
);

export type TemporalPopupProps = Omit<
	TemporalPopoverProps,
	"children"
> &
	Readonly<{
		/** The calendar the dialog holds. */
		children: TemporalDialogProps["children"];
	}>;

/**
 * The `Popover` with its `Dialog`, in one part.
 *
 * @example
 * <DateInput.Popup triggerRef={triggerRef}><DateInput.Calendar>…</DateInput.Calendar></DateInput.Popup>
 */
export const TemporalPopup = ({
	children,
	...props
}: TemporalPopupProps): ReactNode => (
	<TemporalPopover {...props}>
		<TemporalDialog>{children}</TemporalDialog>
	</TemporalPopover>
);
