import type { ComposerEditorHandle } from "./composer.context.ts";

/**
 * Controls a `Composer.Root` from outside its subtree. Create one with
 * `Composer.createHandle()` and pass it to `Composer.Root`'s `handle` prop; its
 * methods do nothing until the composer has mounted.
 *
 * @example
 * const composer = Composer.createHandle();
 * composer.clear();
 */
export class ComposerHandle {
	#impl: ComposerEditorHandle | null = null;

	/**
	 * Wires up the mounted `Composer.Root` and returns the disconnect.
	 *
	 * @example
	 * useEffect(() => handle.connect({ clear, focus }), [handle, clear, focus]);
	 */
	connect(impl: ComposerEditorHandle): () => void {
		this.#impl = impl;
		return () => {
			if (this.#impl === impl) {
				this.#impl = null;
			}
		};
	}

	/** Clears the draft and any staged files. */
	clear(): void {
		this.#impl?.clear();
	}

	/** Moves focus into the editor. */
	focus(): void {
		this.#impl?.focus();
	}
}

/**
 * Creates a {@link ComposerHandle} to control a `Composer.Root` imperatively.
 *
 * @example
 * const composer = createComposerHandle();
 */
export const createComposerHandle = (): ComposerHandle =>
	new ComposerHandle();
