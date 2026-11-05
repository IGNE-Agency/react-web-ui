import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type {
	ComponentProps,
	ReactElement,
	ReactNode,
} from "react";
import { Button } from "../button/index.ts";
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
	useRender.ComponentProps<"div"> &
		PaginationPage &
		Readonly<{
			/** The page sizes on offer. The current `pageSize` is offered alongside them when it is not one of them. */
			pageSizes: readonly number[];
			/** Called with the page to show, counted from 0. */
			onPageIndexChange: (pageIndex: number) => void;
			/** Called with the page size picked. */
			onPageSizeChange: (pageSize: number) => void;
		}>;

/** Where the list stands, for the parts inside it, laid out in a row. */
const PaginationRoot = ({
	pageIndex,
	pageCount,
	pageSize,
	pageSizes,
	onPageIndexChange,
	onPageSizeChange,
	render,
	className,
	ref,
	...props
}: PaginationRootProps): ReactNode => {
	const element = useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.root, className),
		},
	});

	return (
		<PaginationContext
			value={{
				pageIndex,
				pageCount,
				pageSize,
				pageSizes,
				onPageIndexChange,
				onPageSizeChange,
			}}>
			{element}
		</PaginationContext>
	);
};

export type PaginationPageSizeProps =
	useRender.ComponentProps<"div"> &
		Readonly<{
			/** The `Select` parts that pick the size, such as `Select.Label`, `Select.Trigger` and the portalled list of `Select.Items`. */
			children: ReactNode;
		}>;

/**
 * A `Select.Root` over the page sizes, holding the `Select` parts it is given
 * in a row. The size in effect is always on offer.
 */
const PaginationPageSize = ({
	render,
	className,
	ref,
	...props
}: PaginationPageSizeProps): ReactNode => {
	const { pageSize, pageSizes, onPageSizeChange } =
		usePagination();
	const format = new Intl.NumberFormat(useLocale());
	const sizes = pageSizes.includes(pageSize)
		? pageSizes
		: [...pageSizes, pageSize].toSorted((a, b) => a - b);
	const element = useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.pageSize, className),
		},
	});

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
			{element}
		</Select.Root>
	);
};

export type PaginationIndexProps = Omit<
	useRender.ComponentProps<"span">,
	"children"
> &
	Readonly<{
		/** What the index says, such as `Page 3 of 12`, from where the list stands. */
		label: (page: PaginationPage) => string;
	}>;

/** Which page is on screen, as a polite live region. */
const PaginationIndex = ({
	label,
	render,
	className,
	ref,
	...props
}: PaginationIndexProps): ReactElement => {
	const { pageIndex, pageCount, pageSize } =
		usePagination();

	return useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			role: "status",
			...props,
			className: clsx(style.index, className),
			children: label({ pageIndex, pageCount, pageSize }),
		},
	});
};

type Step = "first" | "previous" | "next" | "last";

/**
 * The page a step goes to, and whether it goes nowhere from where the list stands.
 *
 * @example
 * stepTo("next", 11, 12); // -> { target: 12, unavailable: true }
 */
const stepTo = (
	step: Step,
	pageIndex: number,
	pageCount: number,
): Readonly<{ target: number; unavailable: boolean }> => {
	const lastIndex = Math.max(pageCount - 1, 0);
	const atStart = pageIndex <= 0;
	const atEnd = pageIndex >= lastIndex;
	return {
		first: { target: 0, unavailable: atStart },
		previous: {
			target: pageIndex - 1,
			unavailable: atStart,
		},
		next: { target: pageIndex + 1, unavailable: atEnd },
		last: { target: lastIndex, unavailable: atEnd },
	}[step];
};

export type PaginationStepProps = Omit<
	ComponentProps<"button">,
	"ref" | "children"
> &
	Readonly<{
		/** The button's name and tooltip, such as "Next page". */
		label: string;
		/** The glyph, such as a chevron. */
		children: ReactNode;
	}>;

type PageStepProps = PaginationStepProps &
	Readonly<{ step: Step }>;

const PageStep = ({
	step,
	label,
	children,
	onClick,
	...props
}: PageStepProps): ReactNode => {
	const { pageIndex, pageCount, onPageIndexChange } =
		usePagination();
	const { target, unavailable } = stepTo(
		step,
		pageIndex,
		pageCount,
	);

	return (
		<Button
			variant="tertiary"
			{...props}
			iconOnly
			icon={children}
			label={label}
			aria-disabled={unavailable || undefined}
			data-disabled={unavailable || undefined}
			onClick={event => {
				onClick?.(event);
				if (!unavailable) {
					onPageIndexChange(target);
				}
			}}
		/>
	);
};

/** Goes to the first page; marked `aria-disabled`, and kept in the tab order, on the first page. */
const PaginationFirst = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="first" {...props} />;

/** Goes back a page; marked `aria-disabled`, and kept in the tab order, on the first page. */
const PaginationPrevious = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="previous" {...props} />;

/** Goes on a page; marked `aria-disabled`, and kept in the tab order, on the last page. */
const PaginationNext = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="next" {...props} />;

/** Goes to the last page; marked `aria-disabled`, and kept in the tab order, on the last page. */
const PaginationLast = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="last" {...props} />;

/** The step buttons' names and glyphs. */
export type PaginationStepLabels = Readonly<{
	/** The first-page button's name, such as "First page". */
	firstLabel: string;
	/** The previous-page button's name, such as "Previous page". */
	previousLabel: string;
	/** The next-page button's name, such as "Next page". */
	nextLabel: string;
	/** The last-page button's name, such as "Last page". */
	lastLabel: string;
	/** The first-page button's glyph. */
	firstIcon: ReactNode;
	/** The previous-page button's glyph. */
	previousIcon: ReactNode;
	/** The next-page button's glyph. */
	nextIcon: ReactNode;
	/** The last-page button's glyph. */
	lastIcon: ReactNode;
}>;

export type PaginationControlsProps = Omit<
	useRender.ComponentProps<"div">,
	"children"
> &
	PaginationStepLabels;

/** `First`, `Previous`, `Next` and `Last` in a row. */
const PaginationControls = ({
	firstLabel,
	previousLabel,
	nextLabel,
	lastLabel,
	firstIcon,
	previousIcon,
	nextIcon,
	lastIcon,
	render,
	className,
	ref,
	...props
}: PaginationControlsProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.controls, className),
			children: (
				<>
					<PaginationFirst label={firstLabel}>
						{firstIcon}
					</PaginationFirst>
					<PaginationPrevious label={previousLabel}>
						{previousIcon}
					</PaginationPrevious>
					<PaginationNext label={nextLabel}>
						{nextIcon}
					</PaginationNext>
					<PaginationLast label={lastLabel}>
						{lastIcon}
					</PaginationLast>
				</>
			),
		},
	});

/** What the ready-made pager says and shows, besides where the list stands. */
export type PaginationContentProps = PaginationStepLabels &
	Readonly<{
		/** The page-size field's label, such as "Rows per page". */
		pageSizeLabel: string;
		/** What the index says, such as `Page 3 of 12`, from where the list stands. */
		indexLabel: (page: PaginationPage) => string;
		/** The mark beside the page size in effect, in the open list. */
		checkIcon: ReactNode;
		/** The chevron after the page size. Left out, none shows. */
		expandIcon?: ReactNode;
	}>;

const PaginationContent = ({
	pageSizeLabel,
	indexLabel,
	checkIcon,
	expandIcon,
	...controls
}: PaginationContentProps): ReactNode => (
	<>
		<PaginationPageSize>
			<Select.Label>{pageSizeLabel}</Select.Label>
			<Select.Trigger icon={expandIcon} />
			<Select.Portal>
				<Select.Positioner>
					<Select.Popup>
						<Select.List>
							<Select.Items checkIcon={checkIcon} />
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</PaginationPageSize>
		<PaginationIndex label={indexLabel} />
		<PaginationControls {...controls} />
	</>
);

export type PaginationProps = Omit<
	PaginationRootProps,
	"children"
> &
	PaginationContentProps;

/** The page size, the index and the four step buttons, in a `Root`. */
const Prefab = ({
	pageSizeLabel,
	indexLabel,
	checkIcon,
	expandIcon,
	firstLabel,
	previousLabel,
	nextLabel,
	lastLabel,
	firstIcon,
	previousIcon,
	nextIcon,
	lastIcon,
	...props
}: PaginationProps): ReactNode => (
	<PaginationRoot {...props}>
		<PaginationContent
			pageSizeLabel={pageSizeLabel}
			indexLabel={indexLabel}
			checkIcon={checkIcon}
			expandIcon={expandIcon}
			firstLabel={firstLabel}
			previousLabel={previousLabel}
			nextLabel={nextLabel}
			lastLabel={lastLabel}
			firstIcon={firstIcon}
			previousIcon={previousIcon}
			nextIcon={nextIcon}
			lastIcon={lastIcon}
		/>
	</PaginationRoot>
);

/** The parts of a pagination, hanging off its prefab. */
export type PaginationParts = typeof Prefab &
	Readonly<{
		Root: typeof PaginationRoot;
		PageSize: typeof PaginationPageSize;
		Index: typeof PaginationIndex;
		Controls: typeof PaginationControls;
		First: typeof PaginationFirst;
		Previous: typeof PaginationPrevious;
		Next: typeof PaginationNext;
		Last: typeof PaginationLast;
	}>;

/**
 * The pager for a paged list, over any source: the page size, which page is on
 * screen, and buttons to the first, previous, next and last page. Its parts
 * compose another pager: `Root` holds where the list stands, `PageSize` picks
 * rows per page, `Index` says which page is on screen, and `Controls`, or
 * `First`, `Previous`, `Next` and `Last` on their own, step through the pages.
 *
 * @example
 * <Pagination
 * 	pageIndex={pageIndex}
 * 	pageCount={pageCount}
 * 	pageSize={pageSize}
 * 	pageSizes={[10, 20, 50]}
 * 	onPageIndexChange={setPageIndex}
 * 	onPageSizeChange={setPageSize}
 * 	pageSizeLabel="Rows per page"
 * 	indexLabel={page => `Page ${page.pageIndex + 1} of ${page.pageCount}`}
 * 	firstLabel="First page"
 * 	previousLabel="Previous page"
 * 	nextLabel="Next page"
 * 	lastLabel="Last page"
 * 	firstIcon={<FirstPageIcon />}
 * 	previousIcon={<ChevronLeftIcon />}
 * 	nextIcon={<ChevronRightIcon />}
 * 	lastIcon={<LastPageIcon />}
 * 	checkIcon={<CheckIcon />}
 * />
 */
export const Pagination: PaginationParts = Object.assign(
	Prefab,
	{
		Root: PaginationRoot,
		PageSize: PaginationPageSize,
		Index: PaginationIndex,
		Controls: PaginationControls,
		First: PaginationFirst,
		Previous: PaginationPrevious,
		Next: PaginationNext,
		Last: PaginationLast,
	},
);
