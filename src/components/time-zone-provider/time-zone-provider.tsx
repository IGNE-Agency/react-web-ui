import { createContext, type ReactNode } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";

export type TimeZoneProviderProps = Readonly<{
	/** The IANA zone the app's users live in, such as "Europe/Amsterdam". */
	timeZone: string;
	children: ReactNode;
}>;

const TimeZoneContext = createContext<string | undefined>(
	undefined,
);

/**
 * The time zone every "today" and every instant the kit shows or takes is read
 * in.
 *
 * @example
 * <TimeZoneProvider timeZone="Europe/Amsterdam">{app}</TimeZoneProvider>
 */
export const TimeZoneProvider = ({
	timeZone,
	children,
}: TimeZoneProviderProps): ReactNode => (
	<TimeZoneContext value={timeZone}>
		{children}
	</TimeZoneContext>
);

/**
 * The IANA zone of the nearest `TimeZoneProvider`; it throws where there is
 * none.
 *
 * @example
 * const timeZone = useTimeZone(); // "Europe/Amsterdam"
 */
export const useTimeZone = (): string =>
	useRequiredContext(
		TimeZoneContext,
		"useTimeZone must be used inside a TimeZoneProvider",
	);
