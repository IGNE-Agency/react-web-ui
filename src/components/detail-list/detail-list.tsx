import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
import style from "./detail-list.module.scss";

type PartProps = Readonly<{
	className?: string;
	children?: ReactNode;
}>;

type RowAction = Readonly<{
	/** A control at the row's end, whose label names the term it acts on. */
	action?: ReactNode;
}>;

export type DetailListRootProps = PartProps;

export type DetailListRowProps = PartProps &
	RowAction &
	Readonly<{
		/** What the detail is, such as "Phone number". */
		term: ReactNode;
	}>;

export type DetailListIconRowProps = PartProps &
	RowAction &
	Readonly<{
		/** The pictogram that stands for the term. */
		svg: SvgComponent;
		/** The term the pictogram stands for, as its accessible name. */
		label: string;
	}>;

const Root = ({
	className,
	children,
}: DetailListRootProps): ReactNode => (
	<dl className={clsx(style.list, className)}>
		{children}
	</dl>
);

const ActionSlot = ({ action }: RowAction): ReactNode =>
	action === undefined ? null : (
		<dd className={style.action}>{action}</dd>
	);

const Row = ({
	term,
	action,
	className,
	children,
}: DetailListRowProps): ReactNode => (
	<div className={clsx(style.row, className)}>
		<dt className={style.term}>{term}</dt>
		<dd className={style.detail}>{children}</dd>
		<ActionSlot action={action} />
	</div>
);

const IconRow = ({
	svg,
	label,
	action,
	className,
	children,
}: DetailListIconRowProps): ReactNode => (
	<div className={clsx(style.iconRow, className)}>
		<dt className={style.term}>
			<Icon svg={svg} label={label} />
		</dt>
		<dd className={style.detail}>{children}</dd>
		<ActionSlot action={action} />
	</div>
);

type DetailListNamespace = Readonly<{
	Root: typeof Root;
	Row: typeof Row;
	IconRow: typeof IconRow;
}>;

/**
 * Stored information, as the terms that name it and the details that answer
 * them, in a description list. `IconRow` is a row whose term is a pictogram.
 * A row's `action` sits at its end, and its control names the term it acts on.
 *
 * @example
 * <DetailList.Root>
 * 	<DetailList.Row term="Phone number">{client.phone}</DetailList.Row>
 * </DetailList.Root>
 */
export const DetailList: DetailListNamespace = {
	Root,
	Row,
	IconRow,
};
