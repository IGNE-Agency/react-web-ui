export { useBeforeUnload } from "./before-unload.ts";
export {
	type LeaveGuard,
	LeaveGuardDialog,
	type LeaveGuardDialogProps,
	useLeaveGuard,
} from "./leave-guard.tsx";
export {
	type LeaveGuardPolicy,
	never,
	whenDirty,
} from "./policy.ts";
export {
	useReportUnsavedChanges,
	useUnsavedChanges,
} from "./registry.ts";
