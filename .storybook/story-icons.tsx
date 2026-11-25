import AddIcon from "@material-design-icons/svg/outlined/add.svg?react";
import ArrowDownwardIcon from "@material-design-icons/svg/outlined/arrow_downward.svg?react";
import ArrowUpwardIcon from "@material-design-icons/svg/outlined/arrow_upward.svg?react";
import AttachFileIcon from "@material-design-icons/svg/outlined/attach_file.svg?react";
import BlockIcon from "@material-design-icons/svg/outlined/block.svg?react";
import CalendarTodayIcon from "@material-design-icons/svg/outlined/calendar_today.svg?react";
import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import ChevronLeftIcon from "@material-design-icons/svg/outlined/chevron_left.svg?react";
import ChevronRightIcon from "@material-design-icons/svg/outlined/chevron_right.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import DateRangeIcon from "@material-design-icons/svg/outlined/date_range.svg?react";
import ContentCopyIcon from "@material-design-icons/svg/outlined/content_copy.svg?react";
import ErrorIcon from "@material-design-icons/svg/outlined/error_outline.svg?react";
import DescriptionIcon from "@material-design-icons/svg/outlined/description.svg?react";
import ExpandMoreIcon from "@material-design-icons/svg/outlined/expand_more.svg?react";
import FirstPageIcon from "@material-design-icons/svg/outlined/first_page.svg?react";
import LastPageIcon from "@material-design-icons/svg/outlined/last_page.svg?react";
import MoreIcon from "@material-design-icons/svg/outlined/more_horiz.svg?react";
import RestartIcon from "@material-design-icons/svg/outlined/restart_alt.svg?react";
import RemoveIcon from "@material-design-icons/svg/outlined/remove.svg?react";
import SendIcon from "@material-design-icons/svg/outlined/send.svg?react";
import UnfoldMoreIcon from "@material-design-icons/svg/outlined/unfold_more.svg?react";
import UploadFileIcon from "@material-design-icons/svg/outlined/upload_file.svg?react";
import VisibilityIcon from "@material-design-icons/svg/outlined/visibility.svg?react";
import VisibilityOffIcon from "@material-design-icons/svg/outlined/visibility_off.svg?react";
import type { ReactNode } from "react";
import type { KitIcons } from "../src/components/icon-provider/index.ts";
import { StoryProviders } from "../src/lib/storybook/story-providers.tsx";

/** The icons every story and docs page shows in the kit's slots. */
export const STORY_ICONS: KitIcons = {
	check: <CheckIcon />,
	indeterminate: <RemoveIcon />,
	remove: <CloseIcon />,
	clear: <CloseIcon />,
	close: <CloseIcon />,
	expand: <ExpandMoreIcon />,
	previous: <ChevronLeftIcon />,
	next: <ChevronRightIcon />,
	first: <FirstPageIcon />,
	last: <LastPageIcon />,
	increment: <AddIcon />,
	decrement: <RemoveIcon />,
	showPassword: <VisibilityIcon />,
	hidePassword: <VisibilityOffIcon />,
	calendar: <CalendarTodayIcon />,
	dateRange: <DateRangeIcon />,
	copy: <ContentCopyIcon />,
	copied: <CheckIcon />,
	copyFailed: <ErrorIcon />,
	send: <SendIcon />,
	attach: <AttachFileIcon />,
	file: <DescriptionIcon />,
	drop: <UploadFileIcon />,
	choose: <AttachFileIcon />,
	overflow: <MoreIcon />,
	separator: <ChevronRightIcon />,
	retry: <RestartIcon />,
	unavailable: <BlockIcon />,
	sortAscending: <ArrowUpwardIcon />,
	sortDescending: <ArrowDownwardIcon />,
	unsorted: <UnfoldMoreIcon />,
};

/**
 * `StoryProviders` with the story icons, for a docs page or specimen that
 * renders kit components outside a story.
 *
 * @example
 * <DocsProviders><DateField … /></DocsProviders>
 */
export const DocsProviders = ({
	children,
}: Readonly<{ children: ReactNode }>): ReactNode => (
	<StoryProviders icons={STORY_ICONS}>
		{children}
	</StoryProviders>
);
