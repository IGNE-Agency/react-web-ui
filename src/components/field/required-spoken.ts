import { type Context, createContext } from "react";

/**
 * Whether a required mark under it says "required" itself, for a group whose
 * control cannot carry `aria-required`, such as a checkbox group's fieldset.
 */
export const RequiredSpokenContext: Context<boolean> =
	createContext(false);
