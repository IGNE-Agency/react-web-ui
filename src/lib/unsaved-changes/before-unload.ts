import { useEffect } from "react";

const holdUnload = (event: BeforeUnloadEvent) => {
	event.preventDefault();
};

/**
 * Asks the browser to confirm a reload, a close or a navigation away from the
 * app while `when`.
 *
 * @example
 * useBeforeUnload(form.state.isDirty);
 */
export const useBeforeUnload = (when: boolean): void => {
	useEffect(() => {
		if (!when) {
			return undefined;
		}
		window.addEventListener("beforeunload", holdUnload);
		return () =>
			window.removeEventListener(
				"beforeunload",
				holdUnload,
			);
	}, [when]);
};
