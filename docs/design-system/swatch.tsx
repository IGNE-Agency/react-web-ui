import type { ReactNode } from "react";
import { Tooltip } from "../../src/components/tooltip/index.ts";
import styles from "./swatch.module.scss";
import { Token } from "./token";
import {
	colourIn,
	isTokenId,
	type TokenId,
} from "./tokens";

/**
 * One colour token as a swatch. It is a trigger of the `SwatchGroup` around
 * it, and hands that group's one tooltip its token.
 *
 * @example
 * <Swatch id="ref.green.550" />
 */
export const Swatch = ({
	id,
}: Readonly<{ id: TokenId }>) => (
	<Tooltip.Trigger
		payload={id}
		delay={0}
		render={
			<span
				role="img"
				className={styles.swatch}
				style={{ "--swatch": colourIn(id, "light") }}
				aria-label={id}
			/>
		}
	/>
);

/**
 * Gives every `Swatch` inside it one shared tooltip, which moves to whichever
 * swatch is hovered and names its token.
 *
 * @example
 * <SwatchGroup>
 * 	<Swatch id="ref.green.500" />
 * 	<Swatch id="ref.green.550" />
 * </SwatchGroup>
 */
export const SwatchGroup = ({
	children,
}: Readonly<{ children: ReactNode }>) => (
	<Tooltip.Root>
		{({ payload }) => (
			<>
				{children}
				<Tooltip.Portal>
					<Tooltip.Positioner side="top">
						<Tooltip.Popup>
							{typeof payload === "string" &&
							isTokenId(payload) ? (
								<Token id={payload} theme="light" />
							) : null}
						</Tooltip.Popup>
					</Tooltip.Positioner>
				</Tooltip.Portal>
			</>
		)}
	</Tooltip.Root>
);
