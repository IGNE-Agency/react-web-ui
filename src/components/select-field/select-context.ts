import { type Context, createContext } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";

/** One choice of a select: what it shows and the value it stands for. */
export type SelectOption<T extends string> = Readonly<{
	label: string;
	value: T;
	/** A second, muted line under the label. */
	detail?: string;
}>;

export type SelectContextValue = Readonly<{
	options: readonly SelectOption<string>[];
}>;

export const SelectContext: Context<SelectContextValue | null> =
	createContext<SelectContextValue | null>(null);

/**
 * The options the enclosing `Select.Root` was given, so the parts below it need
 * not be handed the same list a second time.
 *
 * @example
 * const { options } = useSelectContext();
 */
export const useSelectContext = (): SelectContextValue =>
	useRequiredContext(
		SelectContext,
		"The Select parts must be used within a <Select.Root>.",
	);
