import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import type { Tone, ToneVariant } from "../../lib/tone.ts";
import style from "./badge.module.scss";

export type BadgeProps = ComponentPropsWithRef<"span"> &
	Readonly<{
		/** Status colour. @default "neutral" */
		tone?: Tone;
		/** @default "subtle" */
		variant?: ToneVariant;
		children: ReactNode;
	}>;

/**
 * Small styled leaf for counts and short status labels. Coloured by
 * `[data-tone]` × `[data-variant]` through the `--badge-*` knobs.
 *
 * @example
 * <Badge tone="info" variant="solid">3</Badge>
 */
export const Badge = ({
	tone = "neutral",
	variant = "subtle",
	className,
	children,
	...props
}: BadgeProps): ReactNode => (
	<span
		data-tone={tone}
		data-variant={variant}
		className={clsx(style.badge, className)}
		{...props}>
		{children}
	</span>
);
