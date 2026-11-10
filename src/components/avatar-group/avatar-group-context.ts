import { type Context, createContext } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";

export type AvatarGroupContextValue = Readonly<{
	/** The group's accessible name, which its list carries too. */
	label: string;
}>;

export const AvatarGroupContext: Context<AvatarGroupContextValue | null> =
	createContext<AvatarGroupContextValue | null>(null);

/**
 * The enclosing `AvatarGroup.Root`'s name.
 *
 * @example
 * const { label } = useAvatarGroup();
 */
export const useAvatarGroup = (): AvatarGroupContextValue =>
	useRequiredContext(
		AvatarGroupContext,
		"The AvatarGroup parts must be used within an <AvatarGroup.Root>.",
	);
