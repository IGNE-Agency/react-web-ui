import type { ReactElement, ReactNode } from "react";
import { Button } from "./button.tsx";

export type CloseButtonProps = Readonly<{
	/** Accessible name, surfaced as the tooltip hint and the `aria-label`. */
	closeLabel: string;
	/** The app's close glyph, drawn in `currentColor` at `1em`. */
	icon: ReactNode;
	/** The library part that closes, such as `<BaseDialog.Close />`. */
	render: ReactElement;
}>;

/**
 * The icon-only way out of an overlay, rendered as the overlay's own close part.
 *
 * @example
 * <CloseButton closeLabel="Close" icon={<CloseIcon />} render={<BaseDialog.Close />} />
 */
export const CloseButton = ({
	closeLabel,
	icon,
	render,
}: CloseButtonProps): ReactNode => (
	<Button
		variant="tertiary"
		iconOnly
		icon={icon}
		label={closeLabel}
		render={render}
	/>
);
