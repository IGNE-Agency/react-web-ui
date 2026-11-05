import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactNode,
} from "react";
import style from "./detail-list.module.scss";

export type DetailListRootProps =
	ComponentPropsWithRef<"dl">;

export type DetailListRowProps =
	ComponentPropsWithRef<"div">;

export type DetailListIconRowProps =
	ComponentPropsWithRef<"div">;

export type DetailListTermProps =
	ComponentPropsWithRef<"dt">;

export type DetailListDetailProps =
	ComponentPropsWithRef<"dd">;

export type DetailListActionProps =
	ComponentPropsWithRef<"dd">;

/** The list: a `<dl>` of rows. */
const Root = ({
	className,
	...props
}: DetailListRootProps): ReactNode => (
	<dl className={clsx(style.list, className)} {...props} />
);

/** One row: a `Term`, its `Detail`, and an optional `Action`. The term takes a third of the row. */
const Row = ({
	className,
	...props
}: DetailListRowProps): ReactNode => (
	<div className={clsx(style.row, className)} {...props} />
);

/** A row whose `Term` is a pictogram, which takes only its own width. */
const IconRow = ({
	className,
	...props
}: DetailListIconRowProps): ReactNode => (
	<div
		className={clsx(style.iconRow, className)}
		{...props}
	/>
);

/** What the detail is, such as "Phone number", or a pictogram with that as its accessible name. */
const Term = ({
	className,
	...props
}: DetailListTermProps): ReactNode => (
	<dt className={clsx(style.term, className)} {...props} />
);

/** The stored information that answers the term. */
const Detail = ({
	className,
	...props
}: DetailListDetailProps): ReactNode => (
	<dd
		className={clsx(style.detail, className)}
		{...props}
	/>
);

/** A control at the row's end, whose label names the term it acts on. */
const Action = ({
	className,
	...props
}: DetailListActionProps): ReactNode => (
	<dd
		className={clsx(style.action, className)}
		{...props}
	/>
);

type DetailListNamespace = Readonly<{
	Root: typeof Root;
	Row: typeof Row;
	IconRow: typeof IconRow;
	Term: typeof Term;
	Detail: typeof Detail;
	Action: typeof Action;
}>;

/**
 * Stored information, as the terms that name it and the details that answer
 * them, in a description list. Each row groups a `Term`, its `Detail` and an
 * optional `Action`; an `IconRow` is a row whose term is a pictogram.
 *
 * @example
 * <DetailList.Root>
 * 	<DetailList.Row>
 * 		<DetailList.Term>Phone number</DetailList.Term>
 * 		<DetailList.Detail>{client.phone}</DetailList.Detail>
 * 	</DetailList.Row>
 * </DetailList.Root>
 */
export const DetailList: DetailListNamespace = {
	Root,
	Row,
	IconRow,
	Term,
	Detail,
	Action,
};
