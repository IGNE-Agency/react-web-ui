import { Field as BaseField } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { startOfYear } from "@internationalized/date";
import { clsx } from "clsx";
import { type ReactNode, useRef } from "react";
import { Intl as TemporalIntl } from "temporal-polyfill";
import { useCopy } from "../../components/copy-provider/index.ts";
import { useIcons } from "../../components/icon-provider/index.ts";
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

const CalendarMonthSelect = ({
	state,
	className,
}: Readonly<{
	state: CalendarNavigationState;
	className?: string;
}>): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();
	const expand = icons.expand;
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
				aria-label={copy.calendar.month}
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
				{expand !== undefined && (
					<BaseSelect.Icon className={style.navIcon}>
						{expand}
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
										{icons.check}
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
 * 	<DateInput.MonthPicker />
 * 	<DateInput.YearPicker />
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

export type CalendarMonthPickerProps = Readonly<{
	/** Applied to the month control. */
	className?: string;
}>;

/**
 * The month control in a calendar header: a list of the months the focused
 * year has, driven by whichever calendar state is above it.
 *
 * @example
 * <DateInput.MonthPicker />
 */
export const CalendarMonthPicker = ({
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
				className={className}
			/>
		</BaseField.Root>
	);
};

export type CalendarYearPickerProps = Readonly<{
	/** Applied to the year control. */
	className?: string;
}>;

/**
 * The year control in a calendar header: every year in the focused date's era,
 * filtered by typing, driven by whichever calendar state is above it.
 *
 * @example
 * <DateInput.YearPicker />
 */
export const CalendarYearPicker = ({
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
				className={className}
			/>
		</BaseField.Root>
	);
};
