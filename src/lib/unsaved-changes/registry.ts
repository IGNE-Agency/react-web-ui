import { useEffect, useSyncExternalStore } from "react";

/** A record of what has unsaved changes right now, which a leave guard reads. */
export type UnsavedChangesRegistry = Readonly<{
	/** Records one source of unsaved changes, until the returned function is called. */
	register: () => () => void;
	/** Whether any source has unsaved changes. */
	hasUnsavedChanges: () => boolean;
	/** Calls `listener` whenever that answer may have changed, until the returned function is called. */
	subscribe: (listener: () => void) => () => void;
}>;

/**
 * Creates an empty registry of unsaved changes.
 *
 * @example
 * const registry = createUnsavedChangesRegistry();
 * const unregister = registry.register();
 * registry.hasUnsavedChanges(); // true
 * unregister();
 * registry.hasUnsavedChanges(); // false
 */
export const createUnsavedChangesRegistry =
	(): UnsavedChangesRegistry => {
		let sources: ReadonlySet<symbol> = new Set();
		let listeners: ReadonlySet<() => void> = new Set();

		const notify = () => {
			for (const listener of listeners) {
				listener();
			}
		};

		return {
			register: () => {
				const source = Symbol("unsaved changes");
				sources = new Set([...sources, source]);
				notify();
				return () => {
					if (sources.has(source)) {
						sources = new Set(
							[...sources].filter(
								other => other !== source,
							),
						);
						notify();
					}
				};
			},
			hasUnsavedChanges: () => sources.size > 0,
			subscribe: listener => {
				listeners = new Set([...listeners, listener]);
				return () => {
					listeners = new Set(
						[...listeners].filter(
							other => other !== listener,
						),
					);
				};
			},
		};
	};

const registry = createUnsavedChangesRegistry();

/**
 * Reports unsaved changes to the page's leave guards while `dirty`, and stops
 * once it is not or the caller unmounts. `Form.Root` reports its form.
 *
 * @example
 * useReportUnsavedChanges(editor.isDirty);
 */
export const useReportUnsavedChanges = (
	dirty: boolean,
): void => {
	useEffect(
		() => (dirty ? registry.register() : undefined),
		[dirty],
	);
};

/**
 * Whether anything on the page reports unsaved changes, such as a `Form.Root`
 * whose form was edited and not submitted.
 *
 * @example
 * const unsaved = useUnsavedChanges();
 */
export const useUnsavedChanges = (): boolean =>
	useSyncExternalStore(
		registry.subscribe,
		registry.hasUnsavedChanges,
		() => false,
	);
