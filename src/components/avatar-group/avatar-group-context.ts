import { type Context, createContext } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";

export type AvatarGroupContextValue = Readonly<{
	/** The group's accessible name, which its list carries too. */
	label: string;
	/** Avatar diameter relative to the surrounding font size (in `em`). */
	size: number;
}>;

export const AvatarGroupContext: Context<AvatarGroupContextValue | null> =
	createContext<AvatarGroupContextValue | null>(null);

/**
 * The enclosing `AvatarGroup.Root`'s name and avatar size.
 *
 * @example
 * const { size } = useAvatarGroup();
 */
export const useAvatarGroup = (): AvatarGroupContextValue =>
	useRequiredContext(
		AvatarGroupContext,
		"The AvatarGroup parts must be used within an <AvatarGroup.Root>.",
	);
