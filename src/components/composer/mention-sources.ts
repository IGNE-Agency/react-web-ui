import type { ReactNode } from "react";

/** Something a typeahead query can mention. */
export type MentionCandidate = Readonly<{
	/** The stable id stored in the `@[label](id)` mention syntax. */
	id: string;
	/** The label inside the mention pill, such as `AnnDoe`. */
	label: string;
	/** The candidate's row in the typeahead menu, such as an avatar and a name. */
	row: ReactNode;
}>;

/** Resolves a typeahead query into the candidates it matches. The app supplies its own (people, clients, teams, …). */
export type MentionSource = Readonly<{
	resolve: (
		query: string,
	) => Promise<readonly MentionCandidate[]>;
}>;
