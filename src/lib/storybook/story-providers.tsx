import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import {
	CopyProvider,
	type KitCopy,
} from "../../components/copy-provider/index.ts";
import {
	IconProvider,
	type KitIcons,
} from "../../components/icon-provider/index.ts";
import { LocaleProvider } from "../../components/locale-provider/index.ts";
import { TimeZoneProvider } from "../../components/time-zone-provider/index.ts";
import { ToastProvider } from "../../components/toast/index.ts";
import { Tooltip } from "../../components/tooltip/index.ts";

/** The locale every story renders in. */
export const STORY_LOCALE = "en-US";

/** The time zone every story renders in. */
export const STORY_TIME_ZONE = "Europe/Amsterdam";

/** The copy every story's components say on their own. */
export const STORY_COPY: KitCopy = {
	required: "required",
	optional: "optional",
	remove: "Remove",
	clear: "Clear",
	close: "Close",
	retry: "Try again",
	loading: "Loading",
	field: { checking: "Checking…" },
	clipboard: {
		copy: "Copy",
		copied: "Copied",
		failed: "Copy failed, the text is selected",
	},
	options: {
		loading: "Loading options…",
		loadFailed: "Options could not be loaded.",
		loadBroken:
			"Options could not be loaded, and trying again won't help.",
		empty: "No options available.",
		search: "Search",
		noResults: "No results.",
		loadingMore: "Loading more options…",
		results: count => `${count} results`,
		unavailable: "unavailable",
		unavailableCount: count =>
			`${count} selected ${count === 1 ? "value is" : "values are"} no longer available.`,
		unavailableName: itemLabel =>
			`${itemLabel}, unavailable`,
		removeHint: itemLabel => `Remove ${itemLabel}`,
	},
	password: {
		show: "Show password",
		hide: "Hide password",
		strength: "Password strength",
		scores: {
			0: "Very weak",
			1: "Weak",
			2: "Fair",
			3: "Strong",
			4: "Very strong",
		},
	},
	number: {
		field: "Number field",
		increment: "Increase",
		decrement: "Decrease",
	},
	otp: {
		slot: (index, total) =>
			`character ${index} of ${total}`,
	},
	calendar: {
		open: "Open calendar",
		previousMonth: "Previous month",
		nextMonth: "Next month",
		month: "Month",
		year: "Year",
		noMatchingYear: "No matching year.",
	},
	pagination: {
		first: "First page",
		previous: "Previous page",
		next: "Next page",
		last: "Last page",
		pageSize: "Rows per page",
		index: ({ pageIndex, pageCount }) =>
			`Page ${pageIndex + 1} of ${pageCount}`,
	},
	table: {
		selectPage: "Select page",
		selectRow: "Select row",
		selected: (selected, total) =>
			`${selected} of ${total} selected`,
		selectAll: total => `Select all ${total}`,
		clearSelection: "Clear selection",
		slow: "This is taking longer than usual.",
	},
	conversation: {
		today: "Today",
		yesterday: "Yesterday",
		read: "Read",
		unread: "Unread",
	},
	photo: {
		preview: "Preview",
		set: "Photo set",
		none: "No photo",
		remove: "Remove photo",
		uploading: "Uploading…",
	},
	files: {
		choose: "Choose files",
		dropHint: "Drag files here",
		fileHint: (name, size) => `${name} (${size})`,
		tooLarge: maxSize =>
			`Some files exceed the maximum size of ${maxSize} and must be removed before sending.`,
		tooLargeFile: (name, maxSize) =>
			`${name} is larger than the maximum size of ${maxSize} and must be removed.`,
		wrongType: name =>
			`${name} is not an accepted file type and must be removed.`,
	},
	composer: { attach: "Add attachment", send: "Send" },
	breadcrumbs: { overflow: "Show more" },
	toast: { viewport: "Notifications" },
};

/**
 * The context every story renders inside, built from the kit's own providers:
 * the story locale, time zone and copy, the given icons, the toast and tooltip
 * providers, and a fresh query client per story.
 *
 * @example
 * decorators: [Story => <StoryProviders icons={STORY_ICONS}><Story /></StoryProviders>]
 */
export const StoryProviders = ({
	icons,
	children,
}: Readonly<{
	icons: KitIcons;
	children: ReactNode;
}>): ReactNode => {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<LocaleProvider locale={STORY_LOCALE}>
				<TimeZoneProvider timeZone={STORY_TIME_ZONE}>
					<CopyProvider copy={STORY_COPY}>
						<IconProvider icons={icons}>
							<Tooltip.Provider>
								<ToastProvider>{children}</ToastProvider>
							</Tooltip.Provider>
						</IconProvider>
					</CopyProvider>
				</TimeZoneProvider>
			</LocaleProvider>
		</QueryClientProvider>
	);
};
