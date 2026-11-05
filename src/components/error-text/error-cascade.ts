import {
	type Context,
	createContext,
	useContext,
} from "react";

/** Hands each block of error messages its place in the wave it arrives with. */
export type ErrorCascade = Readonly<{
	/**
	 * The number of messages ahead of `block` in its wave. A block keeps the index
	 * it was first given; one that appears after the wave has ended starts the
	 * next one at zero.
	 */
	claim: (block: object, count: number) => number;
}>;

/**
 * A cascade whose waves end at the next `schedule` callback, by default the
 * next animation frame, so blocks that appear together drop in one after
 * another.
 *
 * @example
 * const cascade = createErrorCascade();
 * cascade.claim(firstBlock, 2); // 0
 * cascade.claim(secondBlock, 1); // 2
 */
export const createErrorCascade = (
	schedule: (endWave: () => void) => void = endWave => {
		requestAnimationFrame(endWave);
	},
): ErrorCascade => {
	const claimed = new WeakMap<object, number>();
	const wave = { ahead: 0, open: false };

	return {
		claim: (block, count) => {
			const known = claimed.get(block);
			if (known !== undefined) {
				return known;
			}
			if (!wave.open) {
				wave.open = true;
				schedule(() => {
					wave.ahead = 0;
					wave.open = false;
				});
			}
			const index = wave.ahead;
			wave.ahead += count;
			claimed.set(block, index);
			return index;
		},
	};
};

const ErrorCascadeContext: Context<
	ErrorCascade | undefined
> = createContext<ErrorCascade | undefined>(undefined);

/** Provides the cascade the error texts inside it share. */
export const ErrorCascadeProvider: typeof ErrorCascadeContext.Provider =
	ErrorCascadeContext.Provider;

/**
 * The cascade of the enclosing `Form.Root`, if any.
 *
 * @example
 * const cascade = useErrorCascade();
 */
export const useErrorCascade = ():
	| ErrorCascade
	| undefined => useContext(ErrorCascadeContext);
