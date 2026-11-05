import CheckIcon from "@material-design-icons/svg/outlined/check.svg?react";
import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import CodeIcon from "@material-design-icons/svg/outlined/code.svg?react";
import PriorityIcon from "@material-design-icons/svg/outlined/priority_high.svg?react";
import { Collapsible } from "@base-ui/react/collapsible";
import type { ReactNode } from "react";
import { Button } from "../../src/components/button/index.ts";
import styles from "./example.module.scss";
import { Icon } from "../../src/components/icon/index.ts";

const KINDS = {
	do: { label: "Do", Icon: CheckIcon },
	dont: { label: "Don't", Icon: CloseIcon },
	caution: { label: "Caution", Icon: PriorityIcon },
};

/**
 * One design-system example: a rendered illustration (or, without one, the
 * code itself), a coloured verdict bar, and the reason in words. Code behind an
 * illustration is folded away for developers.
 *
 * @example
 * <Example kind="dont" caption="Blue here means nothing." visual={<InfoAvatar />}>
 * 	{codeBlock}
 * </Example>
 */
export const Example = ({
	kind,
	caption,
	visual,
	children,
}: Readonly<{
	kind: keyof typeof KINDS;
	caption?: string;
	visual?: ReactNode;
	children?: ReactNode;
}>) => {
	const { label, Icon: KindIcon } = KINDS[kind];

	return (
		<figure className={`${styles.example} sb-unstyled`}>
			<div className={styles.verdict}>
				{visual === undefined ? (
					<div className={styles.frame} data-code>
						{children}
					</div>
				) : (
					<div className={styles.frame}>{visual}</div>
				)}
				<div className={styles.bar} data-kind={kind}>
					<KindIcon aria-hidden />
					{label}
				</div>
			</div>
			{caption === undefined ? null : (
				<figcaption className={styles.caption}>
					{caption}
				</figcaption>
			)}
			{visual === undefined ||
			children === undefined ? null : (
				<Collapsible.Root className={styles.code}>
					<Button
						variant="tertiary"
						size="sm"
						icon={<Icon svg={CodeIcon} label="" />}
						render={<Collapsible.Trigger />}>
						Code
					</Button>
					<Collapsible.Panel className={styles.panel}>
						{children}
					</Collapsible.Panel>
				</Collapsible.Root>
			)}
		</figure>
	);
};
