import { type Context, use } from "react";

/**
 * The value of `context` from the nearest provider; it throws `message` where
 * there is none.
 *
 * @example
 * const locale = useRequiredContext(LocaleContext, "useLocale must be used inside a LocaleProvider");
 */
export const useRequiredContext = <T>(
	context: Context<T>,
	message: string,
): NonNullable<T> => {
	const value = use(context);
	if (value === null || value === undefined) {
		throw new Error(message);
	}
	return value;
};
