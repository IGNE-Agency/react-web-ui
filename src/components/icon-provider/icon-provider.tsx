import { createContext, type ReactNode } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";

/**
 * Every icon the kit's components show on their own. A required one is a
 * control's only visible content; an optional one left out renders nothing.
 */
export type KitIcons = Readonly<{
	/** The mark of a checked box or a chosen option, such as a tick. */
	check: ReactNode;
	/** The mark of a box only some of whose items are checked, such as a dash. */
	indeterminate: ReactNode;
	/** A remove button's glyph, such as a cross. */
	remove: ReactNode;
	/** A clear button's glyph, such as a cross. */
	clear: ReactNode;
	/** A close button's glyph, such as a cross. */
	close: ReactNode;
	/** The chevron of a control that opens a list, such as an expand icon. */
	expand?: ReactNode;
	/** The button that steps back, such as a left chevron. */
	previous: ReactNode;
	/** The button that steps forward, such as a right chevron. */
	next: ReactNode;
	/** The first-page button's glyph. */
	first: ReactNode;
	/** The last-page button's glyph. */
	last: ReactNode;
	/** The increment button's glyph, such as a plus. */
	increment: ReactNode;
	/** The decrement button's glyph, such as a minus. */
	decrement: ReactNode;
	/** The reveal button's glyph while the password is hidden. */
	showPassword: ReactNode;
	/** The reveal button's glyph while the password shows. */
	hidePassword: ReactNode;
	/** The button that opens a calendar. */
	calendar: ReactNode;
	/** The button that opens a date range's calendar. */
	dateRange: ReactNode;
	/** The copy-to-clipboard button's glyph. */
	copy: ReactNode;
	/** The copy button's glyph once the value is on the clipboard. Left out, it keeps `copy`. */
	copied?: ReactNode;
	/** The copy button's glyph once copying failed. Left out, it keeps `copy`. */
	copyFailed?: ReactNode;
	/** The send button's glyph. */
	send: ReactNode;
	/** The attach button's glyph. */
	attach: ReactNode;
	/** A file tile's glyph where the file is not an image. */
	file?: ReactNode;
	/** Drawn above a drop target's hint, such as an upload icon. */
	drop?: ReactNode;
	/** Drawn before a file picker button's text, such as an attach icon. */
	choose?: ReactNode;
	/** The overflow button's glyph, such as an ellipsis. */
	overflow: ReactNode;
	/** The glyph between two breadcrumbs, such as a right chevron. */
	separator: ReactNode;
	/** A retry button's leading glyph, such as a restart icon. */
	retry?: ReactNode;
	/** Marks a value that is no longer available, beside its label. */
	unavailable?: ReactNode;
	/** The glyph on a header sorted ascending. */
	sortAscending?: ReactNode;
	/** The glyph on a header sorted descending. */
	sortDescending?: ReactNode;
	/** The glyph on a sortable header that is not sorted. */
	unsorted?: ReactNode;
}>;

export type IconProviderProps = Readonly<{
	/** Every icon the kit's components show on their own. */
	icons: KitIcons;
	children: ReactNode;
}>;

const IconContext = createContext<KitIcons | undefined>(
	undefined,
);

/**
 * The icons every component under it shows on its own, such as a checkbox's
 * tick or a clear button's cross.
 *
 * @example
 * <IconProvider icons={icons}>{app}</IconProvider>
 */
export const IconProvider = ({
	icons,
	children,
}: IconProviderProps): ReactNode => (
	<IconContext value={icons}>{children}</IconContext>
);

/**
 * The icons of the nearest `IconProvider`; it throws where there is none.
 *
 * @example
 * const { check } = useIcons();
 */
export const useIcons = (): KitIcons =>
	useRequiredContext(
		IconContext,
		"useIcons must be used inside an IconProvider",
	);
