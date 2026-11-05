import { clsx } from "clsx";
import type { ReactNode } from "react";
import style from "./skeleton.module.scss";

export type SkeletonProps = Readonly<{
	className?: string;
}>;

/**
 * A placeholder block standing in for content that has not arrived yet. Sized by
 * its container, one line of the current font tall, and hidden from assistive
 * tech: the region it fills carries the busy state.
 *
 * @example
 * {isPending ? <Skeleton /> : <span>{user.fullName}</span>}
 */
export const Skeleton = ({
	className,
}: SkeletonProps): ReactNode => (
	<span
		className={clsx(style.skeleton, className)}
		aria-hidden="true"
	/>
);
