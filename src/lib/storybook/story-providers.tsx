import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { LocaleProvider } from "../../components/locale-provider/index.ts";
import { TimeZoneProvider } from "../../components/time-zone-provider/index.ts";
import { ToastProvider } from "../../components/toast/index.ts";
import { Tooltip } from "../../components/tooltip/index.ts";

/** The locale every story renders in. */
export const STORY_LOCALE = "en-US";

/** The time zone every story renders in. */
export const STORY_TIME_ZONE = "Europe/Amsterdam";

/** The accessible name of every story toast's close button. */
export const STORY_TOAST_CLOSE_LABEL = "Close";

/** The accessible name of the region story toasts appear in. */
export const STORY_TOAST_VIEWPORT_LABEL = "Notifications";

/**
 * The context every story renders inside, built from the kit's own providers:
 * the story locale and time zone, the toast and tooltip providers, and a fresh
 * query client per story.
 *
 * @example
 * decorators: [Story => <StoryProviders><Story /></StoryProviders>]
 */
export const StoryProviders = ({
	children,
}: Readonly<{ children: ReactNode }>): ReactNode => {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<LocaleProvider locale={STORY_LOCALE}>
				<TimeZoneProvider timeZone={STORY_TIME_ZONE}>
					<Tooltip.Provider>
						<ToastProvider
							closeLabel={STORY_TOAST_CLOSE_LABEL}
							closeIcon={<CloseIcon />}
							viewportLabel={STORY_TOAST_VIEWPORT_LABEL}>
							{children}
						</ToastProvider>
					</Tooltip.Provider>
				</TimeZoneProvider>
			</LocaleProvider>
		</QueryClientProvider>
	);
};
