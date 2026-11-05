import { useBlocker } from "@tanstack/react-router";
import {
	type LeaveGuard,
	leaveGuardOf,
	useLeaveGuardCore,
} from "./leave-guard.tsx";

/**
 * `useLeaveGuard` wired to TanStack Router: while `when`, every navigation
 * away is held for the guard's `LeaveGuardDialog`, and the browser asks before
 * a reload or a close. `when` defaults to whether anything reports unsaved
 * changes, which every `Form.Root` does.
 *
 * @example
 * const guard = useRouterLeaveGuard();
 * <LeaveGuardDialog guard={guard} title="Discard your changes?" confirmLabel="Discard" cancelLabel="Keep editing" />
 */
export const useRouterLeaveGuard = (
	when?: boolean,
): LeaveGuard => {
	const core = useLeaveGuardCore(when);
	const blocker = useBlocker({
		shouldBlockFn: () => core.blocking,
		withResolver: true,
		enableBeforeUnload: core.blocking,
	});

	return leaveGuardOf(
		core,
		blocker.status === "blocked"
			? { proceed: blocker.proceed, stay: blocker.reset }
			: undefined,
	);
};
