import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	type ReactNode,
	type RefObject,
	useEffectEvent,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useLocale } from "../../components/locale-provider/index.ts";
import { usePopupEdgePadding } from "../popup-edge-padding.ts";
import type { CalendarNavigationIcons } from "./calendar-navigation.tsx";
import {
	type CalendarNavigationState,
	eraYears,
} from "./calendar-state.ts";
import style from "./temporal.module.scss";

const ROW_ESTIMATE = 40;
const OVERSCAN = 8;

const useYearRows = (
	count: number,
	list: HTMLDivElement | null,
) => {
	// oxlint-disable-next-line react/incompatible-library -- TanStack Virtual returns functions that cannot be memoized
	const virtualizer = useVirtualizer({
		count,
		getScrollElement: () => list,
		estimateSize: () => ROW_ESTIMATE,
		overscan: OVERSCAN,
	});
	return {
		rows: virtualizer.getVirtualItems(),
		totalSize: virtualizer.getTotalSize(),
		measureElement: virtualizer.measureElement,
		scrollToIndex: virtualizer.scrollToIndex,
		scrollToOffset: virtualizer.scrollToOffset,
	};
};

export type CalendarYearProps = CalendarNavigationIcons &
	Readonly<{
		state: CalendarNavigationState;
		/** Holds the popup, so it stays inside the calendar's own popover. */
		container: RefObject<HTMLDivElement | null>;
		/** Accessible name of the year input, such as "Year". */
		label: string;
		/** What the list says when no year matches the typed text. */
		noMatchLabel: string;
	}>;

/**
 * The year control in a calendar header: every year in the focused date's era,
 * virtualized so the scrollbar spans the whole era rather than a loaded window,
 * and filtered by typing.
 *
 * @example
 * <CalendarYear state={state} container={containerRef} label="Year" noMatchLabel="No matching year." checkIcon={<CheckIcon />} />
 */
export const CalendarYear = ({
	state,
	container,
	label,
	noMatchLabel,
	checkIcon,
	expandIcon,
}: CalendarYearProps): ReactNode => {
	const locale = useLocale();
	const { ref, collisionPadding } = usePopupEdgePadding();
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [list, setList] = useState<HTMLDivElement | null>(
		null,
	);
	const [query, setQuery] = useState("");

	const focused = state.focusedDate;
	const formatter = new Intl.NumberFormat(locale, {
		useGrouping: false,
	});
	const yearLabel = (year: number) =>
		formatter.format(year);

	const search = query.trim();
	const years = eraYears(state);
	const matches =
		search === ""
			? years
			: years.filter(year => String(year).includes(search));

	const {
		rows,
		totalSize,
		measureElement,
		scrollToIndex,
		scrollToOffset,
	} = useYearRows(matches.length, list);

	const centreFocusedYear = useEffectEvent(() => {
		const index = matches.indexOf(focused.year);
		if (index >= 0) {
			scrollToIndex(index, { align: "center" });
		}
	});

	useLayoutEffect(() => {
		if (list !== null) {
			centreFocusedYear();
		}
	}, [list]);

	return (
		<BaseCombobox.Root<number>
			virtualized
			items={matches}
			filter={null}
			value={focused.year}
			onValueChange={next => {
				if (next !== null) {
					state.setFocusedDate(focused.set({ year: next }));
				}
			}}
			itemToStringLabel={yearLabel}
			itemToStringValue={year => String(year)}
			open={open}
			onOpenChange={setOpen}
			onInputValueChange={(next, details) => {
				if (details.reason === "input-change") {
					setQuery(next);
					scrollToOffset(0);
				}
			}}
			onOpenChangeComplete={next => {
				if (!next) {
					setQuery("");
				}
			}}>
			<BaseCombobox.InputGroup className={style.navControl}>
				<BaseCombobox.Input
					ref={inputRef}
					aria-label={label}
					className={style.navInput}
					onFocus={event => event.currentTarget.select()}
				/>
				{expandIcon !== undefined && (
					<BaseCombobox.Icon
						className={style.navChevron}
						onMouseDown={event => {
							event.preventDefault();
							event.stopPropagation();
							inputRef.current?.focus();
							setOpen(!open);
						}}>
						{expandIcon}
					</BaseCombobox.Icon>
				)}
			</BaseCombobox.InputGroup>

			<BaseCombobox.Portal
				container={container}
				className={style.navPortal}>
				<BaseCombobox.Positioner
					ref={ref}
					className={style.navPositioner}
					sideOffset={4}
					collisionPadding={collisionPadding}>
					<BaseCombobox.Popup className={style.yearPopup}>
						<BaseCombobox.Empty className={style.yearEmpty}>
							{noMatchLabel}
						</BaseCombobox.Empty>
						<BaseCombobox.List
							ref={setList}
							className={style.yearList}>
							<div
								style={{
									blockSize: `${totalSize}px`,
								}}>
								<div
									style={{
										transform: `translateY(${rows.at(0)?.start ?? 0}px)`,
									}}>
									{rows.map(row => {
										const year = matches[row.index];
										if (year === undefined) {
											return null;
										}
										return (
											<BaseCombobox.Item
												key={row.key}
												ref={measureElement}
												data-index={row.index}
												value={year}
												index={row.index}
												className={style.yearOption}>
												<span
													className={style.yearIndicator}
													aria-hidden="true">
													<BaseCombobox.ItemIndicator>
														{checkIcon}
													</BaseCombobox.ItemIndicator>
												</span>
												<span className={style.yearValue}>
													{yearLabel(year)}
												</span>
											</BaseCombobox.Item>
										);
									})}
								</div>
							</div>
						</BaseCombobox.List>
					</BaseCombobox.Popup>
				</BaseCombobox.Positioner>
			</BaseCombobox.Portal>
		</BaseCombobox.Root>
	);
};
