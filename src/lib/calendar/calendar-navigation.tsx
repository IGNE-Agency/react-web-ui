import { Field as BaseField } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import { startOfYear } from "@internationalized/date";
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

const OwnField = ({
	children,
}: Readonly<{ children: ReactNode }>): ReactNode => (
	<BaseField.Root className={style.navField}>
		{children}
	</BaseField.Root>
);

const CalendarMonthSelect = ({
	state,
	label,
	checkIcon,
	expandIcon,
}: CalendarNavigationIcons &
	Readonly<{
		state: CalendarNavigationState;
		label: string;
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
				className={style.navTrigger}>
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

/**
 * The month and year controls in a calendar header, driven by whichever
 * calendar state is above them. The month list holds the months the focused
 * year actually has; the year list is every year in its era.
 *
 * @example
 * <CalendarNavigation monthLabel="Month" yearLabel="Year" noMatchingYearLabel="No matching year." checkIcon={<CheckIcon />} />
 */
export const CalendarNavigation = ({
	monthLabel,
	yearLabel,
	noMatchingYearLabel,
	checkIcon,
	expandIcon,
}: CalendarNavigationLabels &
	CalendarNavigationIcons): ReactNode => {
	const containerRef = useRef<HTMLDivElement>(null);
	const state = useCalendarNavigationState();

	if (state === null) {
		return null;
	}

	return (
		<div ref={containerRef} className={style.navigation}>
			<OwnField>
				<CalendarMonthSelect
					state={state}
					label={monthLabel}
					checkIcon={checkIcon}
					expandIcon={expandIcon}
				/>
			</OwnField>
			<OwnField>
				<CalendarYear
					state={state}
					container={containerRef}
					label={yearLabel}
					noMatchLabel={noMatchingYearLabel}
					checkIcon={checkIcon}
					expandIcon={expandIcon}
				/>
			</OwnField>
		</div>
	);
};
