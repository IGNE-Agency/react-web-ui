import { type ReactNode, useRef, useState } from "react";
import {
	ConfirmDialog,
	type ConfirmDialogProps,
} from "../../components/confirm-dialog/confirm-dialog.tsx";
import { useBeforeUnload } from "./before-unload.ts";
import { useUnsavedChanges } from "./registry.ts";

/** A guard against leaving: whether it blocks, the leave it holds, and the answers to it. */
export type LeaveGuard = Readonly<{
	/** Whether leaving is blocked now: `when`, except while a leave that was agreed to goes through. */
	blocking: boolean;
	/** Whether a held leave is waiting for an answer. */
	asking: boolean;
	/** Hands the guard a leave that was blocked, with what lets it through. */
	hold: (proceed: () => void) => void;
	/** Agrees to the held leave, which goes through once the question has gone. */
	agree: () => void;
	/** Lets the held leave through if it was agreed to, and otherwise stays. */
	settle: () => void;
}>;

/** A held leave's two answers. */
export type HeldLeave = Readonly<{
	proceed: () => void;
	stay: () => void;
}>;

/** A guard's state before it knows which leave it answers for. */
export type LeaveGuardCore = Readonly<{
	blocking: boolean;
	/** The leave handed to `hold`, if any. */
	held: HeldLeave | undefined;
	hold: (proceed: () => void) => void;
	agree: () => void;
	/** Answers `leave` as agreed, and forgets the held one. */
	settle: (leave: HeldLeave | undefined) => void;
}>;

const STAY = (): void => undefined;

/**
 * The state every leave guard shares. `when` defaults to whether anything
 * reports unsaved changes.
 *
 * @example
 * const guard = leaveGuardOf(useLeaveGuardCore(isDirty));
 */
export const useLeaveGuardCore = (
	when: boolean | undefined,
): LeaveGuardCore => {
	const unsaved = useUnsavedChanges();
	const guarding = when ?? unsaved;
	const [held, setHeld] = useState<HeldLeave | undefined>(
		undefined,
	);
	const [leaving, setLeaving] = useState(false);
	const agreed = useRef(false);

	if (leaving && !guarding) {
		setLeaving(false);
	}

	return {
		blocking: guarding && !leaving,
		held,
		hold: proceed => {
			agreed.current = false;
			setHeld({ proceed, stay: STAY });
		},
		agree: () => {
			agreed.current = true;
		},
		settle: leave => {
			const proceeding = agreed.current;
			agreed.current = false;
			setHeld(undefined);
			if (leave === undefined) {
				return;
			}
			if (proceeding) {
				setLeaving(true);
				leave.proceed();
			} else {
				leave.stay();
			}
		},
	};
};

/**
 * The guard over `core`, answering for `routed` — a leave a router holds — or
 * else the one handed to `hold`.
 *
 * @example
 * const guard = leaveGuardOf(core, blocker.status === "blocked" ? { proceed: blocker.proceed, stay: blocker.reset } : undefined);
 */
export const leaveGuardOf = (
	core: LeaveGuardCore,
	routed?: HeldLeave,
): LeaveGuard => {
	const leave = routed ?? core.held;

	return {
		blocking: core.blocking,
		asking: leave !== undefined,
		hold: core.hold,
		agree: core.agree,
		settle: () => core.settle(leave),
	};
};

/**
 * Guards against leaving while `when`, such as a form with unsaved changes,
 * without knowing the router: the browser asks before a reload or a close, and
 * whatever blocks an in-app leave hands it to `hold`. `when` defaults to
 * whether anything reports unsaved changes, which every `Form.Root` does.
 * `@igne-agency/react-web-ui/unsaved-changes/tanstack-router` wires it to
 * TanStack Router.
 *
 * @example
 * const guard = useLeaveGuard();
 * const close = () => (guard.blocking ? guard.hold(() => setOpen(false)) : setOpen(false));
 * <LeaveGuardDialog guard={guard} title="Discard your changes?" confirmLabel="Discard" cancelLabel="Keep editing" />
 */
export const useLeaveGuard = (
	when?: boolean,
): LeaveGuard => {
	const guard = leaveGuardOf(useLeaveGuardCore(when));
	useBeforeUnload(guard.blocking);
	return guard;
};

/**
 * What a `LeaveGuardDialog` takes: the guard it answers for and the question's
 * copy. `tone` defaults to `"danger"`, since leaving loses the changes.
 */
export type LeaveGuardDialogProps = Pick<
	ConfirmDialogProps,
	| "title"
	| "description"
	| "confirmLabel"
	| "cancelLabel"
	| "tone"
> &
	Readonly<{ guard: LeaveGuard }>;

/**
 * The question a guarded page asks when it is left: a `ConfirmDialog` that
 * lets the held leave through or stays.
 *
 * @example
 * <LeaveGuardDialog
 * 	guard={guard}
 * 	title="Discard your changes?"
 * 	confirmLabel="Discard"
 * 	cancelLabel="Keep editing"
 * />
 */
export const LeaveGuardDialog = ({
	guard,
	tone = "danger",
	...copy
}: LeaveGuardDialogProps): ReactNode => (
	<ConfirmDialog
		{...copy}
		open={guard.asking}
		onOpenChange={open => {
			if (!open) {
				guard.settle();
			}
		}}
		onConfirm={guard.agree}
		tone={tone}
	/>
);
