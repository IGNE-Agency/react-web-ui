/**
 * A synchronous key-value store the app hands the kit for anything it
 * persists. It is synchronous so a preference can be read during the first
 * render. It owns serialisation and swallows access errors: a read that fails
 * reports `undefined`, and a write or remove that fails is dropped.
 *
 * @example
 * const { preference } = useTheme({ storage: localStorageAdapter, key: "theme" });
 */
export type StorageAdapter = Readonly<{
	/** The value stored under `key`, or `undefined` when there is none. */
	read: (key: string) => unknown;
	write: (key: string, value: unknown) => void;
	remove: (key: string) => void;
	/**
	 * Calls `listener` whenever the value under `key` may have changed, in this
	 * tab or another, writes through this adapter included. Returns the
	 * unsubscribe.
	 */
	subscribe: (
		key: string,
		listener: () => void,
	) => () => void;
}>;
