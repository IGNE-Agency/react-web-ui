import { createContext, type ReactNode } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import type { OtpSlotLabel } from "../otp-field/otp-input.tsx";
import type { PaginationPage } from "../pagination/pagination-context.ts";
import type { PasswordScoreLabels } from "../password-field/password-strength.tsx";

/** Every string the kit's components say on their own, in the app's language. */
export type KitCopy = Readonly<{
	/** Read after the legend of a required group whose control cannot say so itself, such as "required". */
	required: string;
	/** The word an optional field's label trails, such as "optional". */
	optional: string;
	/** A remove button's name and tooltip, such as "Remove". */
	remove: string;
	/** A clear button's name and tooltip, such as "Clear". */
	clear: string;
	/** A close button's name and tooltip, such as "Close". */
	close: string;
	/** A button that tries a failed load again, such as "Try again". */
	retry: string;
	/** Announced while a popup's content loads, such as "Loading". */
	loading: string;
	/** The copy-to-clipboard button. */
	clipboard: Readonly<{
		/** Its name and tooltip, such as "Copy". */
		copy: string;
		/** Announced once the value is on the clipboard, such as "Copied". */
		copied: string;
		/** Announced when copying failed and the text is selected instead, such as "Copy failed, the text is selected". */
		failed: string;
	}>;
	/** The options of a select or combobox. */
	options: Readonly<{
		/** Said while they load, such as "Loading options…". */
		loading: string;
		/** Said when they failed to load and a retry can help, such as "Options could not be loaded.". */
		loadFailed: string;
		/** Said when they failed to load and trying again won't help, such as "Options could not be loaded, and trying again won't help.". */
		loadBroken: string;
		/** Said when there are none at all, such as "No options available.". */
		empty: string;
		/** The search box's name, such as "Search". */
		search: string;
		/** Said when the search matches nothing, such as "No results". */
		noResults: string;
		/** Read while a paged query fetches its next page, such as "Loading more…". */
		loadingMore: string;
		/** The match count of a paged query, such as `count => \`${count} results\``. */
		results: (count: number) => string;
		/** The word a value no longer available shows beside it, such as "unavailable". */
		unavailable: string;
		/** The status sentence for such values, such as `count => \`${count} selected values are no longer available.\``. */
		unavailableCount: (count: number) => string;
		/** How a value no longer available is read, such as `` label => `${label}, unavailable` ``. */
		unavailableName: (itemLabel: string) => string;
		/** A chosen value's remove button's tooltip, such as `` label => `Remove ${label}` ``. */
		removeHint: (itemLabel: string) => string;
	}>;
	/** The password field. */
	password: Readonly<{
		/** The reveal button's name while the password is hidden, such as "Show password". */
		show: string;
		/** The reveal button's name while the password shows, such as "Hide password". */
		hide: string;
		/** The strength meter's label, such as "Password strength". */
		strength: string;
		/** The name of each strength band, such as "Very weak" for 0. */
		scores: PasswordScoreLabels;
	}>;
	/** The number field. */
	number: Readonly<{
		/** What the number input announces itself as, such as "Number field". */
		field: string;
		/** The increment button's name and tooltip, such as "Increase". */
		increment: string;
		/** The decrement button's name and tooltip, such as "Decrease". */
		decrement: string;
	}>;
	/** The one-time-code field. */
	otp: Readonly<{
		/** Names a slot past the first by its 1-based position, such as "character 2 of 6". */
		slot: OtpSlotLabel;
	}>;
	/** The date and time pickers' calendar. */
	calendar: Readonly<{
		/** The button that opens the calendar, such as "Open calendar". */
		open: string;
		/** The button that shows the previous month, such as "Previous month". */
		previousMonth: string;
		/** The button that shows the next month, such as "Next month". */
		nextMonth: string;
		/** The month list's name, such as "Month". */
		month: string;
		/** The year list's name, such as "Year". */
		year: string;
		/** What the year list says when no year matches the typed text, such as "No matching year". */
		noMatchingYear: string;
	}>;
	/** Pagination. */
	pagination: Readonly<{
		/** The first-page button's name, such as "First page". */
		first: string;
		/** The previous-page button's name, such as "Previous page". */
		previous: string;
		/** The next-page button's name, such as "Next page". */
		next: string;
		/** The last-page button's name, such as "Last page". */
		last: string;
		/** The page-size field's label, such as "Rows per page". */
		pageSize: string;
		/** What the index says, such as `Page 3 of 12`, from where the list stands. */
		index: (page: PaginationPage) => string;
	}>;
	/** The data table. */
	table: Readonly<{
		/** The header checkbox's name, such as "Select page". */
		selectPage: string;
		/** Each row checkbox's name, such as "Select row". */
		selectRow: string;
		/** How many of the matching rows are selected, such as "3 of 30 selected". */
		selected: (selected: number, total: number) => string;
		/** The button that selects every matching row, such as "Select all 30". */
		selectAll: (total: number) => string;
		/** The button that clears the selection, such as "Clear selection". */
		clearSelection: string;
		/** What the overlay says when a refresh runs long, such as "This is taking longer than usual.". */
		slow: string;
	}>;
	/** The conversation. */
	conversation: Readonly<{
		/** What the separator says for today's messages, such as "Today". */
		today: string;
		/** What the separator says for yesterday's messages, such as "Yesterday". */
		yesterday: string;
		/** What a read message's status is announced as, such as "Read". */
		read: string;
		/** What an unread message's status is announced as, such as "Unread". */
		unread: string;
	}>;
	/** The photo field. */
	photo: Readonly<{
		/** The picked photo's alternative text, such as "Preview". */
		preview: string;
		/** What the control announces while a photo is set, such as "Photo set". */
		set: string;
		/** What the control announces while no photo is set, such as "No photo". */
		none: string;
		/** The button that removes a picked photo, such as "Remove photo". */
		remove: string;
	}>;
	/** The file field's and the composer's files. */
	files: Readonly<{
		/** The picker button's text, such as "Choose files". */
		choose: string;
		/** The prompt inside a drop target, such as "Drag files here". */
		dropHint: string;
		/** A file tile's tooltip, such as `` (name, size) => `${name} (${size})` ``. */
		fileHint: (name: string, size: string) => string;
		/** The error while a file is over the size limit, given the formatted limit, such as `` maxSize => `Files over ${maxSize} must be removed.` ``. */
		tooLarge: (maxSize: string) => string;
		/** What a file over the size limit says, one line per file, such as `` (name, maxSize) => `${name} is larger than ${maxSize}.` ``. */
		tooLargeFile: (name: string, maxSize: string) => string;
		/** The error for a file of a type that is not accepted, given its name, such as `` name => `${name} is not an accepted file type.` ``. */
		wrongType: (name: string) => string;
	}>;
	/** The composer. */
	composer: Readonly<{
		/** The attach button's name and tooltip, such as "Add attachment". */
		attach: string;
		/** The send button's name and tooltip, such as "Send". */
		send: string;
	}>;
	/** The breadcrumbs. */
	breadcrumbs: Readonly<{
		/** The overflow button's name, such as "Show more". */
		overflow: string;
	}>;
	/** The toasts. */
	toast: Readonly<{
		/** The region the toasts appear in, reached with F6, such as "Notifications". */
		viewport: string;
	}>;
}>;

export type CopyProviderProps = Readonly<{
	/** Every string the kit's components say on their own. */
	copy: KitCopy;
	children: ReactNode;
}>;

const CopyContext = createContext<KitCopy | undefined>(
	undefined,
);

/**
 * The strings every component under it says on its own, such as a clear
 * button's name or the word an optional field trails.
 *
 * @example
 * <CopyProvider copy={copy}>{app}</CopyProvider>
 */
export const CopyProvider = ({
	copy,
	children,
}: CopyProviderProps): ReactNode => (
	<CopyContext value={copy}>{children}</CopyContext>
);

/**
 * The copy of the nearest `CopyProvider`; it throws where there is none.
 *
 * @example
 * const { clear } = useCopy(); // "Clear"
 */
export const useCopy = (): KitCopy =>
	useRequiredContext(
		CopyContext,
		"useCopy must be used inside a CopyProvider",
	);
