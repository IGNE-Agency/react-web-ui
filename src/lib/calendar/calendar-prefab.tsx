import type { ReactNode } from "react";
import { IconButton } from "../../components/button/index.ts";
import { useCopy } from "../../components/copy-provider/index.ts";
import { useIcons } from "../../components/icon-provider/index.ts";
import {
	CalendarMonthPicker,
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

/**
 * A calendar's header: the month steppers around the month and year pickers.
 *
 * @example
 * <StandardCalendarHeader />
 */
export const StandardCalendarHeader = (): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	return (
		<CalendarHeader>
			<CalendarPrevious
				render={
					<IconButton
						label={copy.calendar.previousMonth}
						variant="tertiary"
						size="md">
						{icons.previous}
					</IconButton>
				}
			/>
			<CalendarPickers>
				<CalendarMonthPicker />
				<CalendarYearPicker />
			</CalendarPickers>
			<CalendarNext
				render={
					<IconButton
						label={copy.calendar.nextMonth}
						variant="tertiary"
						size="md">
						{icons.next}
					</IconButton>
				}
			/>
		</CalendarHeader>
	);
};

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
>;

/**
 * A calendar with its month steppers, month and year pickers and grid, built
 * from the calendar parts.
 *
 * @example
 * <TemporalCalendar />
 */
export const TemporalCalendar = (
	props: TemporalCalendarProps,
): ReactNode => (
	<CalendarRoot {...props}>
		<StandardCalendarHeader />
		<StandardCalendarGrid />
	</CalendarRoot>
);

export type TemporalRangeCalendarProps = Omit<
	RangeCalendarRootProps,
	"children"
>;

/**
 * A range calendar with its month steppers, month and year pickers and a grid
 * per visible month, built from the calendar parts.
 *
 * @example
 * <TemporalRangeCalendar visibleMonths={2} />
 */
export const TemporalRangeCalendar = ({
	visibleMonths = 1,
	...props
}: TemporalRangeCalendarProps): ReactNode => (
	<RangeCalendarRoot
		visibleMonths={visibleMonths}
		{...props}>
		<StandardCalendarHeader />
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
