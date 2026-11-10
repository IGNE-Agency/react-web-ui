import type { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { type Context, createContext } from "react";

/** Which way a nav lays its entries out. */
export type NavOrientation = "horizontal" | "vertical";

/**
 * `"row"` is the rail and overflow-sheet treatment: a full-width pill with the
 * icon beside the label. `"stack"` is the compact bottom-bar treatment: a larger
 * icon over a smaller label.
 */
export type NavLayout = "row" | "stack";

export type NavContextValue = Readonly<{
	orientation: NavOrientation;
	/** The one hint every entry with a `label` names itself through. */
	hint: BaseTooltip.Handle<string>;
}>;

export const NavContext: Context<NavContextValue | null> =
	createContext<NavContextValue | null>(null);
