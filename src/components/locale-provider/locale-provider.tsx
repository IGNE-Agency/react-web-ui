import { createContext, type ReactNode } from "react";
import { I18nProvider } from "react-aria-components";
import { useRequiredContext } from "../../lib/use-required-context.ts";

export type LocaleProviderProps = Readonly<{
	/** The BCP 47 locale every component formats and reads in, such as "nl-NL". */
	locale: string;
	children: ReactNode;
}>;

const LocaleContext = createContext<string | undefined>(
	undefined,
);

/**
 * The locale every number, date and collation the kit shows or takes is read
 * in, react-aria's components included.
 *
 * @example
 * <LocaleProvider locale="nl-NL">{app}</LocaleProvider>
 */
export const LocaleProvider = ({
	locale,
	children,
}: LocaleProviderProps): ReactNode => (
	<LocaleContext value={locale}>
		<I18nProvider locale={locale}>{children}</I18nProvider>
	</LocaleContext>
);

/**
 * The BCP 47 locale of the nearest `LocaleProvider`; it throws where there is
 * none.
 *
 * @example
 * const locale = useLocale(); // "nl-NL"
 */
export const useLocale = (): string =>
	useRequiredContext(
		LocaleContext,
		"useLocale must be used inside a LocaleProvider",
	);
