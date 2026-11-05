import { clsx } from "clsx";
import { useId } from "react";
import styles from "./type-drawing.module.scss";

const BASELINE = 440;
const X_HEIGHT = 153;
const CAP_HEIGHT = 44;
const DESCENDER = 558;
const HEADING_X = 280;
const BODY_X = 667;

const Letters = ({
	className,
}: Readonly<{ className: string | undefined }>) => (
	<>
		<text
			className={clsx(styles.heading, className)}
			x={HEADING_X}
			y={BASELINE}>
			{"A"}
		</text>
		<text
			className={clsx(styles.body, className)}
			x={BODY_X}
			y={BASELINE}>
			{"y"}
		</text>
	</>
);

/**
 * The guide's Type opener: the heading family's capital and the body family's
 * lowercase set enormous on one baseline, over their metric lines, white only
 * inside the x-height.
 *
 * @example
 * <Illustration caption={caption}>
 * 	<TypeDrawing />
 * </Illustration>
 */
export const TypeDrawing = () => {
	const band = useId();

	return (
		<svg viewBox="0 0 1200 600" className={styles.drawing}>
			<rect
				className={styles.field}
				width="1200"
				height="600"
			/>
			<clipPath id={band}>
				<rect
					y={X_HEIGHT}
					width="1200"
					height={BASELINE - X_HEIGHT}
				/>
			</clipPath>
			{[CAP_HEIGHT, X_HEIGHT, BASELINE, DESCENDER].map(
				y => (
					<line
						key={y}
						className={styles.rule}
						x1="0"
						x2="1200"
						y1={y}
						y2={y}
					/>
				),
			)}
			<Letters className={styles.accent} />
			<g clipPath={`url(#${band})`}>
				<Letters className={styles.paper} />
			</g>
		</svg>
	);
};
