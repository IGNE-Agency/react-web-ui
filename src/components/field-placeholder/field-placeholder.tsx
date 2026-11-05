import { clsx } from "clsx";
import { type ReactNode, useId } from "react";
import { Skeleton } from "../skeleton/index.ts";
import style from "./field-placeholder.module.scss";

const SHAPES = ["single", "split"] as const;

const shapeIndex = (
	seed: string,
	count: number,
): number => {
	let hash = 0;
	for (const character of seed) {
		hash = (hash * 31 + character.charCodeAt(0)) % 1000003;
	}
	return hash % count;
};

export type FieldPlaceholderProps = Readonly<{
	className?: string;
}>;

/**
 * A field-shaped placeholder, standing in for a control whose code is still on
 * its way. Holds the label and control heights so the form does not jump when
 * the real field arrives.
 *
 * @example
 * <Suspense fallback={<FieldPlaceholder />}>{field}</Suspense>
 */
export const FieldPlaceholder = ({
	className,
}: FieldPlaceholderProps): ReactNode => {
	const shape =
		SHAPES[shapeIndex(useId(), SHAPES.length)] ?? "single";

	return (
		<div className={clsx(style.placeholder, className)}>
			<Skeleton className={style.label} />
			<div className={style.controls}>
				<Skeleton className={style.control} />
				{shape === "split" && (
					<Skeleton className={style.control} />
				)}
			</div>
		</div>
	);
};
