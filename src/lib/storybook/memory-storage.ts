import type { StorageAdapter } from "../storage.ts";

/**
 * A storage adapter that keeps values in memory, as structured clones, for
 * stories and tests.
 *
 * @example
 * const storage = memoryStorage();
 * storage.write("page-size", 50);
 */
export const memoryStorage = (): StorageAdapter => {
	const entries = new Map<string, unknown>();
	const listeners = new Map<string, Set<() => void>>();
	const notify = (key: string) => {
		for (const listener of listeners.get(key) ?? []) {
			listener();
		}
	};
	return {
		read: key => structuredClone(entries.get(key)),
		write: (key, value) => {
			entries.set(key, structuredClone(value));
			notify(key);
		},
		remove: key => {
			entries.delete(key);
			notify(key);
		},
		subscribe: (key, listener) => {
			const keyListeners =
				listeners.get(key) ?? new Set<() => void>();
			keyListeners.add(listener);
			listeners.set(key, keyListeners);
			return () => {
				keyListeners.delete(listener);
			};
		},
	};
};
