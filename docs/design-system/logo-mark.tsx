import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import Logo from "./logo.svg?react";
import styles from "./logo-mark.module.scss";

/** The brand mark, ticking for as long as it is shown, as a loading view draws it. */
export const LogoMark = ({
	className,
	...props
}: ComponentProps<"svg">): ReactNode => (
	<Logo
		className={clsx(styles.logo, className)}
		aria-hidden="true"
		{...props}
	/>
);
