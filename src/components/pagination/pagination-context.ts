import { type Context, createContext } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";

/** Where a paged list stands: the page on screen, how many there are, and how many rows each holds. */
export type PaginationPage = Readonly<{
	/** The page on screen, counted from 0. */
	pageIndex: number;
	/** How many pages there are. */
	pageCount: number;
	/** How many rows a page holds. */
	pageSize: number;
}>;

export type PaginationContextValue = PaginationPage &
	Readonly<{
		pageSizes: readonly number[];
		onPageIndexChange: (pageIndex: number) => void;
		onPageSizeChange: (pageSize: number) => void;
	}>;

export const PaginationContext: Context<PaginationContextValue | null> =
	createContext<PaginationContextValue | null>(null);

/**
 * Where the enclosing `Pagination.Root` stands, and its change handlers.
 *
 * @example
 * const { pageIndex, pageCount } = usePagination();
 */
export const usePagination = (): PaginationContextValue =>
	useRequiredContext(
		PaginationContext,
		"The Pagination parts must be used within a <Pagination.Root>.",
	);
