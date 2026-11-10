import type { CalendarDate } from "@internationalized/date";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentProps,
	type ReactNode,
	type Ref,
	useContext,
} from "react";
import {
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
	Heading as AriaHeading,
	RangeCalendar as AriaRangeCalendar,
	type RangeCalendarProps as AriaRangeCalendarProps,
} from "react-aria-components";
import { useTimeZone } from "../../components/time-zone-provider/index.ts";
import type { TemporalButtonProps } from "./temporal.tsx";
import { todayIn } from "./temporal-value.ts";
import style from "./temporal.module.scss";

export type CalendarRootProps = Omit<
	AriaCalendarProps<CalendarDate>,
	"className"
> &
	Readonly<{
		className?: string;
		ref?: Ref<HTMLDivElement>;
	}>;

/**
 * A month of days, selecting one. Without a value, it opens on today in the
 * `TimeZoneProvider`'s zone.
 *
 * @example
 * <DateInput.Calendar>
 * 	<DateInput.CalendarHeader>…</DateInput.CalendarHeader>
 * 	<DateInput.Grid>…</DateInput.Grid>
 * </DateInput.Calendar>
 */
export const CalendarRoot = ({
	className,
	...props
}: CalendarRootProps): ReactNode => {
	const today = todayIn(useTimeZone());
	const picker = useContext(DatePickerStateContext);
	const picked = picker?.value ?? null;

	return (
		<AriaCalendar<CalendarDate>
			className={clsx(style.calendar, className)}
			defaultFocusedValue={
				picked === null ? today : undefined
			}
			{...props}
		/>
	);
};

export type RangeCalendarRootProps = Omit<
	AriaRangeCalendarProps<CalendarDate>,
	"className" | "visibleDuration"
> &
	Readonly<{
		/** Months shown side by side, each a `Grid` offset by its index. @default 1 */
		visibleMonths?: number;
		className?: string;
		ref?: Ref<HTMLDivElement>;
	}>;

/**
 * Days of one or more adjacent months, selecting a continuous range. Without a
 * value, it opens on today in the `TimeZoneProvider`'s zone.
 *
 * @example
 * <DateRangeInput.Calendar visibleMonths={2}>
 * 	<DateRangeInput.CalendarHeader>…</DateRangeInput.CalendarHeader>
 * 	<DateRangeInput.Months>…</DateRangeInput.Months>
 * </DateRangeInput.Calendar>
 */
export const RangeCalendarRoot = ({
	visibleMonths = 1,
	className,
	...props
}: RangeCalendarRootProps): ReactNode => {
	const today = todayIn(useTimeZone());
	const picker = useContext(DateRangePickerStateContext);
	const picked = picker?.value.start ?? null;

	return (
		<AriaRangeCalendar<CalendarDate>
			className={clsx(
				style.calendar,
				style.rangeCalendar,
				className,
			)}
			visibleDuration={{
				months: Math.max(1, visibleMonths),
			}}
			defaultFocusedValue={
				picked === null ? today : undefined
			}
			{...props}
		/>
	);
};

export type CalendarHeaderProps =
	useRender.ComponentProps<"header">;

/**
 * The row above the grid holding the month steppers and, between them, the
 * heading or the month and year pickers.
 *
 * @example
 * <DateInput.CalendarHeader>
 * 	<DateInput.Previous render={…} />
 * 	<DateInput.Heading />
 * 	<DateInput.Next render={…} />
 * </DateInput.CalendarHeader>
 */
export const CalendarHeader = ({
	render,
	className,
	ref,
	...props
}: CalendarHeaderProps): ReactNode =>
	useRender({
		defaultTagName: "header",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.header, className),
		},
	});

export type CalendarHeadingProps = ComponentProps<
	typeof AriaHeading
>;

/**
 * The month or months the calendar shows, as text.
 *
 * @example
 * <DateInput.Heading />
 */
export const CalendarHeading = (
	props: CalendarHeadingProps,
): ReactNode => <AriaHeading {...props} />;

/**
 * The button that shows the previous month. It renders whichever button it is
 * given.
 *
 * @example
 * <DateInput.Previous
 * 	render={
 * 		<IconButton label="Previous month" variant="tertiary" size="md">
 * 			<ChevronLeftIcon />
 * 		</IconButton>
 * 	}
 * />
 */
export const CalendarPrevious = ({
	render,
	ref,
	...props
}: TemporalButtonProps): ReactNode =>
	useRender({
		render,
		ref,
		props: {
			...props,
			render: <AriaButton slot="previous" />,
		},
	});

/**
 * The button that shows the next month. It renders whichever button it is
 * given.
 *
 * @example
 * <DateInput.Next
 * 	render={
 * 		<IconButton label="Next month" variant="tertiary" size="md">
 * 			<ChevronRightIcon />
 * 		</IconButton>
 * 	}
 * />
 */
export const CalendarNext = ({
	render,
	ref,
	...props
}: TemporalButtonProps): ReactNode =>
	useRender({
		render,
		ref,
		props: {
			...props,
			render: <AriaButton slot="next" />,
		},
	});

export type CalendarMonthsProps =
	useRender.ComponentProps<"div">;

/**
 * The row of grids a range calendar shows side by side.
 *
 * @example
 * <DateRangeInput.Months>
 * 	<DateRangeInput.Grid>…</DateRangeInput.Grid>
 * 	<DateRangeInput.Grid offset={{ months: 1 }}>…</DateRangeInput.Grid>
 * </DateRangeInput.Months>
 */
export const CalendarMonths = ({
	render,
	className,
	ref,
	...props
}: CalendarMonthsProps): ReactNode =>
	useRender({
		render,
		ref,
		props: {
			...props,
			className: clsx(style.months, className),
		},
	});

export type CalendarGridProps = ComponentProps<
	typeof AriaCalendarGrid
>;

/**
 * One month's table of days. `offset` picks a later month of a calendar that
 * shows several.
 *
 * @example
 * <DateInput.Grid>
 * 	<DateInput.GridHeader>{day => <DateInput.HeaderCell>{day}</DateInput.HeaderCell>}</DateInput.GridHeader>
 * 	<DateInput.GridBody>{date => <DateInput.Cell date={date} />}</DateInput.GridBody>
 * </DateInput.Grid>
 */
export const CalendarGrid = ({
	className,
	...props
}: CalendarGridProps): ReactNode => (
	<AriaCalendarGrid
		className={clsx(style.grid, className)}
		{...props}
	/>
);

export type CalendarGridHeaderProps = ComponentProps<
	typeof AriaCalendarGridHeader
>;

/**
 * The row of weekday names at the top of a grid. Its children render each one.
 *
 * @example
 * <DateInput.GridHeader>{day => <DateInput.HeaderCell>{day}</DateInput.HeaderCell>}</DateInput.GridHeader>
 */
export const CalendarGridHeader = (
	props: CalendarGridHeaderProps,
): ReactNode => <AriaCalendarGridHeader {...props} />;

export type CalendarHeaderCellProps = ComponentProps<
	typeof AriaCalendarHeaderCell
>;

/**
 * One weekday name.
 *
 * @example
 * <DateInput.HeaderCell>{day}</DateInput.HeaderCell>
 */
export const CalendarHeaderCell = ({
	className,
	...props
}: CalendarHeaderCellProps): ReactNode => (
	<AriaCalendarHeaderCell
		className={clsx(style.weekday, className)}
		{...props}
	/>
);

export type CalendarGridBodyProps = ComponentProps<
	typeof AriaCalendarGridBody
>;

/**
 * The weeks of a grid. Its children render each day.
 *
 * @example
 * <DateInput.GridBody>{date => <DateInput.Cell date={date} />}</DateInput.GridBody>
 */
export const CalendarGridBody = (
	props: CalendarGridBodyProps,
): ReactNode => <AriaCalendarGridBody {...props} />;

export type CalendarCellProps = Omit<
	ComponentProps<typeof AriaCalendarCell>,
	"className"
> &
	Readonly<{ className?: string }>;

/**
 * One day, marking today in the `TimeZoneProvider`'s zone.
 *
 * @example
 * <DateInput.Cell date={date} />
 */
export const CalendarCell = ({
	date,
	className,
	...props
}: CalendarCellProps): ReactNode => {
	const today = todayIn(useTimeZone());
	return (
		<AriaCalendarCell
			date={date}
			className={clsx(
				style.day,
				date.compare(today) === 0 && style.today,
				className,
			)}
			{...props}
		/>
	);
};
