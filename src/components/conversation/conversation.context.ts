import { type Context, createContext } from "react";

/** Whose message it is: the viewer's, the other party's, or a colleague's. */
export type ConversationMessageSide =
	| "own"
	| "other"
	| "colleague";

/** Whether the other party has read a message. */
export type ConversationMessageStatus = "read" | "unread";

export type ConversationMessageContextValue = Readonly<{
	side: ConversationMessageSide;
}>;

export const ConversationMessageContext: Context<ConversationMessageContextValue | null> =
	createContext<ConversationMessageContextValue | null>(
		null,
	);
