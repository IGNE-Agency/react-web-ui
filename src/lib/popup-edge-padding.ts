import { type RefCallback, useState } from "react";

const RESOLVED_PROPERTY = "--_popup-edge-padding";

/** What {@link usePopupEdgePadding} hands a positioner. */
export type PopupEdgePadding = Readonly<{
	/** The positioner's ref, which reads the padding once it mounts. */
	ref: RefCallback<HTMLElement>;
	/** The space to keep from the viewport's edges, in pixels. */
	collisionPadding: number;
}>;

/**
 * Reads a positioned popup's collision padding at runtime from the
 * `--popup-edge-padding` knob, resolved to pixels on the positioner by the
 * `popup.edge-padding` mixin. `0` until the positioner mounts.
 *
 * @example
 * <BasePopover.Positioner
 * 	{...usePopupEdgePadding()}
 * 	className={styles.positioner}
 * />
 */
export const usePopupEdgePadding = (): PopupEdgePadding => {
	const [collisionPadding, setCollisionPadding] =
		useState(0);

	const ref = (element: HTMLElement | null) => {
		if (element) {
			const resolved = Number.parseFloat(
				getComputedStyle(element).getPropertyValue(
					RESOLVED_PROPERTY,
				),
			);
			setCollisionPadding(
				Number.isFinite(resolved) ? resolved : 0,
			);
		}
	};

	return { ref, collisionPadding };
};
