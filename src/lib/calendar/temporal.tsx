import type { CalendarDate } from "@internationalized/date";
import { clsx } from "clsx";
import {
	type ReactNode,
	type Ref,
	useContext,
} from "react";
import {
	DateInput as AriaDateInput,
	type DateInputProps as AriaDateInputProps,
	Button as AriaButton,
	Calendar as AriaCalendar,
	CalendarCell as AriaCalendarCell,
	CalendarGrid as AriaCalendarGrid,
	CalendarGridBody as AriaCalendarGridBody,
	CalendarGridHeader as AriaCalendarGridHeader,
	CalendarHeaderCell as AriaCalendarHeaderCell,
	type CalendarProps as AriaCalendarProps,
	DatePickerStateContext,
	DateRangePickerStateContext,
	DateSegment as AriaDateSegment,
	type DateSegmentProps as AriaDateSegmentProps,
	Dialog as AriaDialog,
	type DialogProps as AriaDialogProps,
	Group as AriaGroup,
	type GroupProps as AriaGroupProps,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
	RangeCalendar as AriaRangeCalendar,
	type RangeCalendarProps as AriaRangeCalendarProps,
} from "react-aria-components";
import { Button } from "../../components/button/index.ts";
import {
	Field,
	type FieldProps,
	type FieldState,
	fieldStateAttributes,
	useFieldFocus,
} from "../../components/field/index.ts";
import { focusControlOnRim } from "../../components/field/rim-focus.ts";
import { withFieldFocus } from "../../components/field/use-field-focus.ts";
import { useTimeZone } from "../../components/time-zone-provider/index.ts";
import { normalizeFieldErrors } from "../forms/errors.ts";
import {
	CalendarNavigation,
	type CalendarNavigationIcons,
	type CalendarNavigationLabels,
} from "./calendar-navigation.tsx";
import { todayIn } from "./temporal-value.ts";
import style from "./temporal.module.scss";

/** The copy a calendar popup announces: its month steppers and its month and year lists. */
export type CalendarLabels = CalendarNavigationLabels &
	Readonly<{
		/** Accessible name of the button that shows the previous month. */
		previousMonthLabel: string;
		/** Accessible name of the button that shows the next month. */
		nextMonthLabel: string;
	}>;

/** The icons a calendar popup shows: its month steppers and its month and year lists. */
export type CalendarIcons = CalendarNavigationIcons &
	Readonly<{
		/** The icon of the button that shows the previous month. */
		previousIcon: ReactNode;
		/** The icon of the button that shows the next month. */
		nextIcon: ReactNode;
	}>;

export type TemporalStateProps = Readonly<{
	/** Projected onto the element as presence-style `data-*` attributes. */
	state?: FieldState;
}>;

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
 * <TemporalGroup state={state}><TemporalInput /></TemporalGroup>
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

/**
 * One editable unit of a date or time.
 *
 * @example
 * {segment => <TemporalSegment segment={segment} />}
 */
export const TemporalSegment = ({
	className,
	...props
}: AriaDateSegmentProps): ReactNode => (
	<AriaDateSegment
		className={clsx(style.segment, className)}
		{...props}
	/>
);

export type TemporalInputProps = Omit<
	AriaDateInputProps,
	"children"
>;

/**
 * The segments of one date or time, bare inside a `TemporalGroup`.
 *
 * @example
 * <TemporalInput />
 */
export const TemporalInput = ({
	className,
	...props
}: TemporalInputProps): ReactNode => (
	<AriaDateInput
		className={clsx(style.input, className)}
		{...props}>
		{segment => <TemporalSegment segment={segment} />}
	</AriaDateInput>
);

/**
 * The segments of one end of a date range, sized to its content.
 *
 * @example
 * <TemporalRangeInput slot="start" />
 */
export const TemporalRangeInput = ({
	className,
	...props
}: Omit<AriaDateInputProps, "children" | "slot"> &
	Readonly<{ slot: "start" | "end" }>): ReactNode => (
	<AriaDateInput
		className={clsx(style.rangeInput, className)}
		{...props}>
		{segment => <TemporalSegment segment={segment} />}
	</AriaDateInput>
);

/**
 * The dash between a range's start and end.
 *
 * @example
 * <TemporalRangeSeparator />
 */
export const TemporalRangeSeparator = (): ReactNode => (
	<span className={style.rangeSeparator} aria-hidden="true">
		–
	</span>
);

/**
 * The space that pushes a range's inlays to the end of its group.
 *
 * @example
 * <TemporalRangeSpacer />
 */
export const TemporalRangeSpacer = (): ReactNode => (
	<span className={style.rangeSpacer} />
);

export type TemporalTriggerProps = Readonly<{
	/** Accessible name, surfaced as the tooltip hint and the `aria-label`. */
	label: string;
	/** The button itself, for the popup to align to. */
	ref?: Ref<HTMLButtonElement>;
	/** The icon the button shows. */
	children: ReactNode;
}>;

/**
 * The icon-only button that opens the calendar.
 *
 * @example
 * <TemporalTrigger label="Open calendar" ref={triggerRef}><CalendarIcon /></TemporalTrigger>
 */
export const TemporalTrigger = ({
	label,
	ref,
	children,
}: TemporalTriggerProps): ReactNode => (
	<Button
		iconOnly
		icon={children}
		label={label}
		variant="tertiary"
		size="sm"
		className={style.trigger}
		render={<AriaButton ref={ref} />}
	/>
);

export type TemporalPopupProps = Omit<
	AriaPopoverProps,
	"children"
> &
	Readonly<{ children: AriaDialogProps["children"] }>;

/**
 * The floating surface the calendar lands on, aligned to whatever `triggerRef`
 * names: the calendar button, rather than the whole field.
 *
 * @example
 * <TemporalPopup triggerRef={triggerRef}><TemporalCalendar {...labels} /></TemporalPopup>
 */
export const TemporalPopup = ({
	children,
	placement = "bottom end",
	...props
}: TemporalPopupProps): ReactNode => (
	<AriaPopover
		className={style.popover}
		placement={placement}
		{...props}>
		<AriaDialog className={style.dialog}>
			{children}
		</AriaDialog>
	</AriaPopover>
);

const CalendarChrome = ({
	previousMonthLabel,
	nextMonthLabel,
	monthLabel,
	yearLabel,
	noMatchingYearLabel,
	previousIcon,
	nextIcon,
	checkIcon,
	expandIcon,
	children,
}: CalendarLabels &
	CalendarIcons &
	Readonly<{ children: ReactNode }>): ReactNode => (
	<>
		<header className={style.header}>
			<Button
				iconOnly
				icon={previousIcon}
				label={previousMonthLabel}
				variant="tertiary"
				size="md"
				render={<AriaButton slot="previous" />}
			/>
			<CalendarNavigation
				monthLabel={monthLabel}
				yearLabel={yearLabel}
				noMatchingYearLabel={noMatchingYearLabel}
				checkIcon={checkIcon}
				expandIcon={expandIcon}
			/>
			<Button
				iconOnly
				icon={nextIcon}
				label={nextMonthLabel}
				variant="tertiary"
				size="md"
				render={<AriaButton slot="next" />}
			/>
		</header>
		{children}
	</>
);

const MonthGrid = ({
	today,
	monthOffset = 0,
}: Readonly<{
	today: CalendarDate;
	monthOffset?: number;
}>): ReactNode => (
	<AriaCalendarGrid
		offset={{ months: monthOffset }}
		className={style.grid}>
		<AriaCalendarGridHeader>
			{day => (
				<AriaCalendarHeaderCell className={style.weekday}>
					{day}
				</AriaCalendarHeaderCell>
			)}
		</AriaCalendarGridHeader>
		<AriaCalendarGridBody>
			{date => (
				<AriaCalendarCell
					date={date}
					className={() =>
						clsx(
							style.day,
							date.compare(today) === 0 && style.today,
						)
					}
				/>
			)}
		</AriaCalendarGridBody>
	</AriaCalendarGrid>
);

export type TemporalCalendarProps = Omit<
	AriaCalendarProps<CalendarDate>,
	"children"
> &
	CalendarLabels &
	CalendarIcons;

/**
 * A month of days, selecting one. Today, and the month it opens on without a
 * value, are read in the `TimeZoneProvider`'s zone.
 *
 * @example
 * <TemporalCalendar {...calendarLabels} {...calendarIcons} />
 */
export const TemporalCalendar = ({
	className,
	previousMonthLabel,
	nextMonthLabel,
	monthLabel,
	yearLabel,
	noMatchingYearLabel,
	previousIcon,
	nextIcon,
	checkIcon,
	expandIcon,
	...props
}: TemporalCalendarProps): ReactNode => {
	const today = todayIn(useTimeZone());
	const picker = useContext(DatePickerStateContext);
	const picked = picker?.value ?? null;

	return (
		<AriaCalendar<CalendarDate>
			className={clsx(style.calendar, className)}
			defaultFocusedValue={
				picked === null ? today : undefined
			}
			{...props}>
			<CalendarChrome
				previousMonthLabel={previousMonthLabel}
				nextMonthLabel={nextMonthLabel}
				monthLabel={monthLabel}
				yearLabel={yearLabel}
				noMatchingYearLabel={noMatchingYearLabel}
				previousIcon={previousIcon}
				nextIcon={nextIcon}
				checkIcon={checkIcon}
				expandIcon={expandIcon}>
				<MonthGrid today={today} />
			</CalendarChrome>
		</AriaCalendar>
	);
};

export type TemporalRangeCalendarProps = Omit<
	AriaRangeCalendarProps<CalendarDate>,
	"children" | "visibleDuration"
> &
	CalendarLabels &
	CalendarIcons &
	Readonly<{
		/** Months shown side by side. @default 1 */
		visibleMonths?: number;
	}>;

/**
 * Days of one or more adjacent months, selecting a continuous range. Today,
 * and the month it opens on without a value, are read in the
 * `TimeZoneProvider`'s zone.
 *
 * @example
 * <TemporalRangeCalendar visibleMonths={2} {...calendarLabels} {...calendarIcons} />
 */
export const TemporalRangeCalendar = ({
	visibleMonths = 1,
	className,
	previousMonthLabel,
	nextMonthLabel,
	monthLabel,
	yearLabel,
	noMatchingYearLabel,
	previousIcon,
	nextIcon,
	checkIcon,
	expandIcon,
	...props
}: TemporalRangeCalendarProps): ReactNode => {
	const today = todayIn(useTimeZone());
	const picker = useContext(DateRangePickerStateContext);
	const picked = picker?.value.start ?? null;
	const months = Math.max(1, visibleMonths);

	return (
		<AriaRangeCalendar<CalendarDate>
			className={clsx(
				style.calendar,
				style.rangeCalendar,
				className,
			)}
			visibleDuration={{ months }}
			defaultFocusedValue={
				picked === null ? today : undefined
			}
			{...props}>
			<CalendarChrome
				previousMonthLabel={previousMonthLabel}
				nextMonthLabel={nextMonthLabel}
				monthLabel={monthLabel}
				yearLabel={yearLabel}
				noMatchingYearLabel={noMatchingYearLabel}
				previousIcon={previousIcon}
				nextIcon={nextIcon}
				checkIcon={checkIcon}
				expandIcon={expandIcon}>
				<div className={style.months}>
					{Array.from({ length: months }, (_, month) => (
						<MonthGrid
							key={month}
							today={today}
							monthOffset={month}
						/>
					))}
				</div>
			</CalendarChrome>
		</AriaRangeCalendar>
	);
};

export type TemporalFrameIds = Readonly<{
	labelId: string;
	describedBy?: string;
	/** A stable id and name for the control. */
	controlId: string;
}>;

export type TemporalFrameProps = Omit<
	FieldProps,
	"pending"
> &
	Readonly<{
		className?: string;
		children: (ids: TemporalFrameIds) => ReactNode;
	}>;

/**
 * The label, description and error frame every temporal control shares,
 * handing the control the ids it wires `aria-labelledby` and
 * `aria-describedby` to.
 *
 * @example
 * <TemporalFrame label="Period" optionalLabel="optional">
 * 	{({ labelId }) => <DateInput.Root aria-labelledby={labelId} />}
 * </TemporalFrame>
 */
export const TemporalFrame = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	className,
	children,
}: TemporalFrameProps): ReactNode => {
	const ids = Field.useIds();
	const { labelId, descriptionId, errorId, controlId } =
		ids;
	const messages = normalizeFieldErrors(errors);
	const describedBy = ids.describedBy(
		description !== undefined,
		messages.length > 0,
	);

	return (
		<Field.Root
			className={className}
			invalid={messages.length > 0}
			dirty={dirty}
			touched={touched}>
			<Field.Label
				id={labelId}
				nativeLabel={false}
				requiredness={requiredness}
				optionalLabel={optionalLabel}
				render={<span />}>
				{label}
			</Field.Label>
			{children({ labelId, describedBy, controlId })}
			<Field.Description id={descriptionId}>
				{description}
			</Field.Description>
			<Field.Error id={errorId}>{messages}</Field.Error>
		</Field.Root>
	);
};
