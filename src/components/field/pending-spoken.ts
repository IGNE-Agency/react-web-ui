import { type Context, createContext } from "react";

/**
 * What the status region of the field frame under it says while the field's
 * wait shows, where the wait is not a check, such as a photo field's upload.
 * Left out, it says the `CopyProvider`'s `field.checking`.
 */
export const PendingSpokenContext: Context<
	string | undefined
> = createContext<string | undefined>(undefined);
