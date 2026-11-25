import {
	type Context,
	createContext,
	type RefObject,
} from "react";

type TriggerRef = RefObject<HTMLButtonElement | null>;

/** The ref `FilterBar.Root` hands its `FilterBar.Trigger`, for the parts that return focus to it. */
export const FilterBarTriggerContext: Context<TriggerRef | null> =
	createContext<TriggerRef | null>(null);
