import { type Context, createContext } from "react";
import type { BusyPhase } from "../../lib/hooks/index.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import type { FieldState } from "../field/index.ts";

/** What a number input's `Root` hands its parts. */
export type NumberInputContextValue = Readonly<{
	/** Projected by `Root`; every part reads it, none of them own it. */
	state: FieldState;
	/** The errors `Root` was given, which `Error` renders. */
	errors: unknown;
	/** The word an optional field's label trails. */
	optionalLabel: string;
	phase: BusyPhase;
}>;

/** The context a number input's `Root` provides. */
export const NumberInputContext: Context<NumberInputContextValue | null> =
	createContext<NumberInputContextValue | null>(null);

/**
 * The surrounding number input's projected state.
 *
 * @example
 * const { state } = useNumberInputContext();
 */
export const useNumberInputContext =
	(): NumberInputContextValue =>
		useRequiredContext(
			NumberInputContext,
			"Number input parts must be rendered within <NumberInput.Root>.",
		);
