import type { ReactNode } from "react";
import { IconButton } from "../../components/button/index.ts";
import {
	CalendarMonthPicker,
	type CalendarNavigationIcons,
	type CalendarNavigationLabels,
	CalendarPickers,
	CalendarYearPicker,
} from "./calendar-navigation.tsx";
import {
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeader,
	CalendarHeaderCell,
	CalendarMonths,
	CalendarNext,
	CalendarPrevious,
	CalendarRoot,
	type CalendarRootProps,
	RangeCalendarRoot,
	type RangeCalendarRootProps,
} from "./calendar-parts.tsx";

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

/**
 * A calendar's header: the month steppers around the month and year pickers.
 *
 * @example
 * <StandardCalendarHeader {...calendarLabels} {...calendarIcons} />
 */
export const StandardCalendarHeader = ({
	previousMonthLabel,
	nextMonthLabel,
	monthLabel,
	yearLabel,
	noMatchingYearLabel,
	previousIcon,
	nextIcon,
	checkIcon,
	expandIcon,
}: CalendarLabels & CalendarIcons): ReactNode => (
	<CalendarHeader>
		<CalendarPrevious
			render={
				<IconButton
					label={previousMonthLabel}
					variant="tertiary"
					size="md">
					{previousIcon}
				</IconButton>
			}
		/>
		<CalendarPickers>
			<CalendarMonthPicker
				label={monthLabel}
				checkIcon={checkIcon}
				expandIcon={expandIcon}
			/>
			<CalendarYearPicker
				label={yearLabel}
				noMatchingYearLabel={noMatchingYearLabel}
				checkIcon={checkIcon}
				expandIcon={expandIcon}
			/>
		</CalendarPickers>
		<CalendarNext
			render={
				<IconButton
					label={nextMonthLabel}
					variant="tertiary"
					size="md">
					{nextIcon}
				</IconButton>
			}
		/>
	</CalendarHeader>
);

/**
 * One month's grid: the weekday names over the days.
 *
 * @example
 * <StandardCalendarGrid monthOffset={1} />
 */
export const StandardCalendarGrid = ({
	monthOffset,
}: Readonly<{
	/** Months after the first visible one this grid shows. */
	monthOffset?: number;
}>): ReactNode => (
	<CalendarGrid
		offset={
			monthOffset === undefined
				? undefined
				: { months: monthOffset }
		}>
		<CalendarGridHeader>
			{day => (
				<CalendarHeaderCell>{day}</CalendarHeaderCell>
			)}
		</CalendarGridHeader>
		<CalendarGridBody>
			{date => <CalendarCell date={date} />}
		</CalendarGridBody>
	</CalendarGrid>
);

export type TemporalCalendarProps = Omit<
	CalendarRootProps,
	"children"
> &
	CalendarLabels &
	CalendarIcons;

/**
 * A calendar with its month steppers, month and year pickers and grid, built
 * from the calendar parts.
 *
 * @example
 * <TemporalCalendar {...calendarLabels} {...calendarIcons} />
 */
export const TemporalCalendar = ({
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
}: TemporalCalendarProps): ReactNode => (
	<CalendarRoot {...props}>
		<StandardCalendarHeader
			previousMonthLabel={previousMonthLabel}
			nextMonthLabel={nextMonthLabel}
			monthLabel={monthLabel}
			yearLabel={yearLabel}
			noMatchingYearLabel={noMatchingYearLabel}
			previousIcon={previousIcon}
			nextIcon={nextIcon}
			checkIcon={checkIcon}
			expandIcon={expandIcon}
		/>
		<StandardCalendarGrid />
	</CalendarRoot>
);

export type TemporalRangeCalendarProps = Omit<
	RangeCalendarRootProps,
	"children"
> &
	CalendarLabels &
	CalendarIcons;

/**
 * A range calendar with its month steppers, month and year pickers and a grid
 * per visible month, built from the calendar parts.
 *
 * @example
 * <TemporalRangeCalendar visibleMonths={2} {...calendarLabels} {...calendarIcons} />
 */
export const TemporalRangeCalendar = ({
	visibleMonths = 1,
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
}: TemporalRangeCalendarProps): ReactNode => (
	<RangeCalendarRoot
		visibleMonths={visibleMonths}
		{...props}>
		<StandardCalendarHeader
			previousMonthLabel={previousMonthLabel}
			nextMonthLabel={nextMonthLabel}
			monthLabel={monthLabel}
			yearLabel={yearLabel}
			noMatchingYearLabel={noMatchingYearLabel}
			previousIcon={previousIcon}
			nextIcon={nextIcon}
			checkIcon={checkIcon}
			expandIcon={expandIcon}
		/>
		<CalendarMonths>
			{Array.from(
				{ length: Math.max(1, visibleMonths) },
				(_, month) => (
					<StandardCalendarGrid
						key={month}
						monthOffset={month}
					/>
				),
			)}
		</CalendarMonths>
	</RangeCalendarRoot>
);
