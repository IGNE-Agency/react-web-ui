import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	MouseEvent,
	ReactElement,
	ReactNode,
} from "react";
import { IconButton } from "../button/index.ts";
import { useCopy } from "../copy-provider/index.ts";
import { useIcons } from "../icon-provider/index.ts";
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
>;

/** Which page is on screen, as a polite live region saying the `CopyProvider`'s `pagination.index`. */
const PaginationIndex = ({
	render,
	className,
	ref,
	...props
}: PaginationIndexProps): ReactElement => {
	const copy = useCopy();
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
			children: copy.pagination.index({
				pageIndex,
				pageCount,
				pageSize,
			}),
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
	ComponentPropsWithRef<"button">,
	"children"
> &
	Readonly<{
		/** The button to render, such as `<IconButton label="Next page" variant="tertiary"><ChevronRightIcon /></IconButton>`. */
		render: useRender.RenderProp;
	}>;

type PageStepProps = PaginationStepProps &
	Readonly<{ step: Step }>;

const PageStep = ({
	step,
	render,
	onClick,
	...props
}: PageStepProps): ReactElement => {
	const { pageIndex, pageCount, onPageIndexChange } =
		usePagination();
	const { target, unavailable } = stepTo(
		step,
		pageIndex,
		pageCount,
	);

	return useRender({
		render,
		props: {
			type: "button",
			...props,
			"aria-disabled": unavailable || undefined,
			"data-disabled": unavailable || undefined,
			onClick: (event: MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (!unavailable) {
					onPageIndexChange(target);
				}
			},
		},
	});
};

/**
 * Goes to the first page; marked `aria-disabled`, and kept in the tab order, on
 * the first page. It renders whichever button it is given.
 *
 * @example
 * <Pagination.First render={<IconButton label="First page" variant="tertiary"><FirstPageIcon /></IconButton>} />
 */
const PaginationFirst = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="first" {...props} />;

/**
 * Goes back a page; marked `aria-disabled`, and kept in the tab order, on the
 * first page. It renders whichever button it is given.
 *
 * @example
 * <Pagination.Previous render={<IconButton label="Previous page" variant="tertiary"><ChevronLeftIcon /></IconButton>} />
 */
const PaginationPrevious = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="previous" {...props} />;

/**
 * Goes on a page; marked `aria-disabled`, and kept in the tab order, on the
 * last page. It renders whichever button it is given.
 *
 * @example
 * <Pagination.Next render={<IconButton label="Next page" variant="tertiary"><ChevronRightIcon /></IconButton>} />
 */
const PaginationNext = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="next" {...props} />;

/**
 * Goes to the last page; marked `aria-disabled`, and kept in the tab order, on
 * the last page. It renders whichever button it is given.
 *
 * @example
 * <Pagination.Last render={<IconButton label="Last page" variant="tertiary"><LastPageIcon /></IconButton>} />
 */
const PaginationLast = (
	props: PaginationStepProps,
): ReactNode => <PageStep step="last" {...props} />;

export type PaginationControlsProps =
	useRender.ComponentProps<"div">;

/**
 * The step buttons it is given, `First`, `Previous`, `Next` and `Last`, in a row.
 *
 * @example
 * <Pagination.Controls>
 * 	<Pagination.Previous render={previousButton} />
 * 	<Pagination.Next render={nextButton} />
 * </Pagination.Controls>
 */
const PaginationControls = ({
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
		},
	});

const PaginationContent = (): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();

	return (
		<>
			<PaginationPageSize>
				<Select.Label>
					{copy.pagination.pageSize}
				</Select.Label>
				<Select.Trigger>
					<Select.Value />
					<Select.Icon>{icons.expand}</Select.Icon>
				</Select.Trigger>
				<Select.Portal>
					<Select.Positioner>
						<Select.Popup>
							<Select.List>
								<Select.Items />
							</Select.List>
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</PaginationPageSize>
			<PaginationIndex />
			<PaginationControls>
				<PaginationFirst
					render={
						<IconButton
							variant="tertiary"
							label={copy.pagination.first}>
							{icons.first}
						</IconButton>
					}
				/>
				<PaginationPrevious
					render={
						<IconButton
							variant="tertiary"
							label={copy.pagination.previous}>
							{icons.previous}
						</IconButton>
					}
				/>
				<PaginationNext
					render={
						<IconButton
							variant="tertiary"
							label={copy.pagination.next}>
							{icons.next}
						</IconButton>
					}
				/>
				<PaginationLast
					render={
						<IconButton
							variant="tertiary"
							label={copy.pagination.last}>
							{icons.last}
						</IconButton>
					}
				/>
			</PaginationControls>
		</>
	);
};

export type PaginationProps = Omit<
	PaginationRootProps,
	"children"
>;

/** The page size, the index and the four step buttons, in a `Root`. */
const Prefab = (props: PaginationProps): ReactNode => (
	<PaginationRoot {...props}>
		<PaginationContent />
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
 * rows per page, `Index` says which page is on screen, and `First`, `Previous`,
 * `Next` and `Last`, each rendering the button it is given, step through the
 * pages, in a `Controls` row or on their own.
 *
 * @example
 * <Pagination
 * 	pageIndex={pageIndex}
 * 	pageCount={pageCount}
 * 	pageSize={pageSize}
 * 	pageSizes={[10, 20, 50]}
 * 	onPageIndexChange={setPageIndex}
 * 	onPageSizeChange={setPageSize}
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
