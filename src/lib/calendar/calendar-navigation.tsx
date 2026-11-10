import { Field as BaseField } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { startOfYear } from "@internationalized/date";
import { clsx } from "clsx";
import { type ReactNode, useRef } from "react";
import { Intl as TemporalIntl } from "temporal-polyfill";
import { useLocale } from "../../components/locale-provider/index.ts";
import { useTimeZone } from "../../components/time-zone-provider/index.ts";
import { usePopupEdgePadding } from "../popup-edge-padding.ts";
import {
	type CalendarNavigationState,
	useCalendarNavigationState,
} from "./calendar-state.ts";
import { CalendarYear } from "./calendar-year.tsx";
import { dayToPlainDate } from "./temporal-value.ts";
import style from "./temporal.module.scss";

/** The copy the month and year controls in a calendar header announce. */
export type CalendarNavigationLabels = Readonly<{
	/** Accessible name of the month list, such as "Month". */
	monthLabel: string;
	/** Accessible name of the year list, such as "Year". */
	yearLabel: string;
	/** What the year list says when no year matches the typed text. */
	noMatchingYearLabel: string;
}>;

/** The icons the month and year lists in a calendar header show. */
export type CalendarNavigationIcons = Readonly<{
	/** The mark beside the selected month and year in their lists, their only sign of selection. */
	checkIcon: ReactNode;
	/** The chevron on the month and year controls. Left out, none shows. */
	expandIcon?: ReactNode;
}>;

const CalendarMonthSelect = ({
	state,
	label,
	checkIcon,
	expandIcon,
	className,
}: CalendarNavigationIcons &
	Readonly<{
		state: CalendarNavigationState;
		label: string;
		className?: string;
	}>): ReactNode => {
	const locale = useLocale();
	const timeZone = useTimeZone();
	const { ref, collisionPadding } = usePopupEdgePadding();
	const focused = state.focusedDate;
	const formatter = new TemporalIntl.DateTimeFormat(
		locale,
		{
			month: "long",
			timeZone,
			calendar: focused.calendar.identifier,
		},
	);

	const start = startOfYear(focused);
	const options = Array.from(
		{ length: focused.calendar.getMonthsInYear(focused) },
		(_, index) => start.add({ months: index }),
	).map(month => ({
		value: String(month.month),
		label: formatter.format(dayToPlainDate(month)),
	}));

	return (
		<BaseSelect.Root<string>
			items={options}
			value={String(focused.month)}
			onValueChange={next => {
				if (next !== null) {
					state.setFocusedDate(
						focused.set({ month: Number(next) }),
					);
				}
			}}>
			<BaseSelect.Trigger
				aria-label={label}
				className={clsx(style.navTrigger, className)}>
				<span className={style.navLabel}>
					<BaseSelect.Value className={style.navValue} />
					<span
						className={style.navSizer}
						aria-hidden="true">
						{options.map(option => (
							<span key={option.value}>{option.label}</span>
						))}
					</span>
				</span>
				{expandIcon !== undefined && (
					<BaseSelect.Icon className={style.navIcon}>
						{expandIcon}
					</BaseSelect.Icon>
				)}
			</BaseSelect.Trigger>

			<BaseSelect.Positioner
				ref={ref}
				className={style.navPositioner}
				sideOffset={4}
				alignItemWithTrigger={false}
				collisionPadding={collisionPadding}>
				<BaseSelect.Popup className={style.navPopup}>
					<BaseSelect.List>
						{options.map(option => (
							<BaseSelect.Item
								key={option.value}
								value={option.value}
								className={style.navItem}>
								<span
									className={style.navItemIndicator}
									aria-hidden="true">
									<BaseSelect.ItemIndicator>
										{checkIcon}
									</BaseSelect.ItemIndicator>
								</span>
								<BaseSelect.ItemText>
									{option.label}
								</BaseSelect.ItemText>
							</BaseSelect.Item>
						))}
					</BaseSelect.List>
				</BaseSelect.Popup>
			</BaseSelect.Positioner>
		</BaseSelect.Root>
	);
};

export type CalendarPickersProps =
	useRender.ComponentProps<"div">;

/**
 * The space between the month steppers that holds the month and year pickers,
 * and the year list while it is open.
 *
 * @example
 * <DateInput.Pickers>
 * 	<DateInput.MonthPicker label="Month" checkIcon={<CheckIcon />} />
 * 	<DateInput.YearPicker label="Year" noMatchingYearLabel="No matching year." checkIcon={<CheckIcon />} />
 * </DateInput.Pickers>
 */
export const CalendarPickers = ({
	render,
	className,
	ref,
	...props
}: CalendarPickersProps): ReactNode =>
	useRender({
		render,
		ref,
		props: {
			...props,
			className: clsx(style.navigation, className),
		},
	});

export type CalendarMonthPickerProps =
	CalendarNavigationIcons &
		Readonly<{
			/** Accessible name of the month list, such as "Month". */
			label: string;
			/** Applied to the month control. */
			className?: string;
		}>;

/**
 * The month control in a calendar header: a list of the months the focused
 * year has, driven by whichever calendar state is above it.
 *
 * @example
 * <DateInput.MonthPicker label="Month" checkIcon={<CheckIcon />} expandIcon={<ExpandMoreIcon />} />
 */
export const CalendarMonthPicker = ({
	label,
	checkIcon,
	expandIcon,
	className,
}: CalendarMonthPickerProps): ReactNode => {
	const state = useCalendarNavigationState();
	if (state === null) {
		return null;
	}
	return (
		<BaseField.Root className={style.navField}>
			<CalendarMonthSelect
				state={state}
				label={label}
				checkIcon={checkIcon}
				expandIcon={expandIcon}
				className={className}
			/>
		</BaseField.Root>
	);
};

export type CalendarYearPickerProps =
	CalendarNavigationIcons &
		Readonly<{
			/** Accessible name of the year input, such as "Year". */
			label: string;
			/** What the year list says when no year matches the typed text. */
			noMatchingYearLabel: string;
			/** Applied to the year control. */
			className?: string;
		}>;

/**
 * The year control in a calendar header: every year in the focused date's era,
 * filtered by typing, driven by whichever calendar state is above it.
 *
 * @example
 * <DateInput.YearPicker label="Year" noMatchingYearLabel="No matching year." checkIcon={<CheckIcon />} expandIcon={<ExpandMoreIcon />} />
 */
export const CalendarYearPicker = ({
	label,
	noMatchingYearLabel,
	checkIcon,
	expandIcon,
	className,
}: CalendarYearPickerProps): ReactNode => {
	const containerRef = useRef<HTMLDivElement>(null);
	const state = useCalendarNavigationState();
	if (state === null) {
		return null;
	}
	return (
		<BaseField.Root
			ref={containerRef}
			className={style.navField}>
			<CalendarYear
				state={state}
				container={containerRef}
				label={label}
				noMatchLabel={noMatchingYearLabel}
				checkIcon={checkIcon}
				expandIcon={expandIcon}
				className={className}
			/>
		</BaseField.Root>
	);
};
