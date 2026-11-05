import ChevronLeftIcon from "@material-design-icons/svg/outlined/chevron_left.svg?react";
import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import FirstPageIcon from "@material-design-icons/svg/outlined/first_page.svg?react";
import LastPageIcon from "@material-design-icons/svg/outlined/last_page.svg?react";
import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import { Button } from "../button/index.ts";
import type { SvgComponent } from "../icon/index.ts";
import { useLocale } from "../locale-provider/index.ts";
import { Select } from "../select-field/select.tsx";
import {
	PaginationContext,
	type PaginationPage,
	usePagination,
} from "./pagination-context.ts";
import style from "./pagination.module.scss";

export type { PaginationPage };

export type PaginationRootProps =
	ComponentPropsWithRef<"div"> &
		PaginationPage &
		Readonly<{
			/** The page sizes on offer. The current `pageSize` is offered alongside them when it is not one of them. */
			pageSizes: readonly number[];
			/** Called with the page to show, counted from 0. */
			onPageIndexChange: (pageIndex: number) => void;
			/** Called with the page size picked. */
			onPageSizeChange: (pageSize: number) => void;
		}>;

const PaginationRoot = ({
	pageIndex,
	pageCount,
	pageSize,
	pageSizes,
	onPageIndexChange,
	onPageSizeChange,
	className,
	...props
}: PaginationRootProps): ReactNode => (
	<PaginationContext
		value={{
			pageIndex,
			pageCount,
			pageSize,
			pageSizes,
			onPageIndexChange,
			onPageSizeChange,
		}}>
		<div
			className={clsx(style.root, className)}
			{...props}
		/>
	</PaginationContext>
);

export type PaginationPageSizeProps = Readonly<{
	/** The field's label, such as "Rows per page". */
	label: string;
}>;

const PaginationPageSize = ({
	label,
}: PaginationPageSizeProps): ReactNode => {
	const { pageSize, pageSizes, onPageSizeChange } =
		usePagination();
	const format = new Intl.NumberFormat(useLocale());
	const sizes = pageSizes.includes(pageSize)
		? pageSizes
		: [...pageSizes, pageSize].toSorted((a, b) => a - b);

	return (
		<Select.Root
			options={sizes.map(size => ({
				value: String(size),
				label: format.format(size),
			}))}
			value={String(pageSize)}
			onValueChange={value => {
				const size = sizes.find(
					candidate => String(candidate) === value,
				);
				if (size !== undefined) {
					onPageSizeChange(size);
				}
			}}>
			<div className={style.pageSize}>
				<Select.Label>{label}</Select.Label>
				<Select.Trigger />
			</div>
			<Select.Portal>
				<Select.Positioner>
					<Select.Popup>
						<Select.List>
							<Select.Items />
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
};

export type PaginationIndexProps = Readonly<{
	/** What the index says, such as `Page 3 of 12`, from where the list stands. */
	label: (page: PaginationPage) => string;
}>;

const PaginationIndex = ({
	label,
}: PaginationIndexProps): ReactNode => {
	const { pageIndex, pageCount, pageSize } =
		usePagination();

	return (
		<span role="status" className={style.index}>
			{label({ pageIndex, pageCount, pageSize })}
		</span>
	);
};

export type PaginationControlsProps = Readonly<{
	/** The first-page button's name, such as "First page". */
	firstLabel: string;
	/** The previous-page button's name, such as "Previous page". */
	previousLabel: string;
	/** The next-page button's name, such as "Next page". */
	nextLabel: string;
	/** The last-page button's name, such as "Last page". */
	lastLabel: string;
}>;

type PageButtonProps = Readonly<{
	icon: SvgComponent;
	label: string;
	target: number;
	unavailable: boolean;
	onPageIndexChange: (pageIndex: number) => void;
}>;

const PageButton = ({
	icon,
	label,
	target,
	unavailable,
	onPageIndexChange,
}: PageButtonProps): ReactNode => (
	<Button
		iconOnly
		variant="tertiary"
		icon={icon}
		label={label}
		aria-disabled={unavailable || undefined}
		data-disabled={unavailable || undefined}
		onClick={() => {
			if (!unavailable) {
				onPageIndexChange(target);
			}
		}}
	/>
);

const PaginationControls = ({
	firstLabel,
	previousLabel,
	nextLabel,
	lastLabel,
}: PaginationControlsProps): ReactNode => {
	const { pageIndex, pageCount, onPageIndexChange } =
		usePagination();
	const lastIndex = Math.max(pageCount - 1, 0);
	const atStart = pageIndex <= 0;
	const atEnd = pageIndex >= lastIndex;

	return (
		<div className={style.controls}>
			<PageButton
				icon={FirstPageIcon}
				label={firstLabel}
				target={0}
				unavailable={atStart}
				onPageIndexChange={onPageIndexChange}
			/>
			<PageButton
				icon={ChevronLeftIcon}
				label={previousLabel}
				target={pageIndex - 1}
				unavailable={atStart}
				onPageIndexChange={onPageIndexChange}
			/>
			<PageButton
				icon={ChevronRightIcon}
				label={nextLabel}
				target={pageIndex + 1}
				unavailable={atEnd}
				onPageIndexChange={onPageIndexChange}
			/>
			<PageButton
				icon={LastPageIcon}
				label={lastLabel}
				target={lastIndex}
				unavailable={atEnd}
				onPageIndexChange={onPageIndexChange}
			/>
		</div>
	);
};

/** The parts of a pagination. */
export type PaginationParts = Readonly<{
	Root: typeof PaginationRoot;
	PageSize: typeof PaginationPageSize;
	Index: typeof PaginationIndex;
	Controls: typeof PaginationControls;
}>;

/**
 * The pager for a paged list, over any source: `Root` holds where the list
 * stands, `PageSize` picks rows per page, `Index` says which page is on screen
 * and `Controls` go to the first, previous, next and last page. Leave out the
 * parts a list has no room for.
 *
 * @example
 * <Pagination.Root
 * 	pageIndex={pageIndex}
 * 	pageCount={pageCount}
 * 	pageSize={pageSize}
 * 	pageSizes={[10, 20, 50]}
 * 	onPageIndexChange={setPageIndex}
 * 	onPageSizeChange={setPageSize}>
 * 	<Pagination.PageSize label="Rows per page" />
 * 	<Pagination.Index label={page => `Page ${page.pageIndex + 1} of ${page.pageCount}`} />
 * 	<Pagination.Controls firstLabel="First page" previousLabel="Previous page" nextLabel="Next page" lastLabel="Last page" />
 * </Pagination.Root>
 */
export const Pagination: PaginationParts = {
	Root: PaginationRoot,
	PageSize: PaginationPageSize,
	Index: PaginationIndex,
	Controls: PaginationControls,
};
