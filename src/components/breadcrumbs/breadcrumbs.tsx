import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type {
	ComponentPropsWithRef,
	ReactElement,
	ReactNode,
	Ref,
} from "react";
import { IconButton } from "../button/button.tsx";
import { Menu } from "../menu/menu.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import style from "./breadcrumbs.module.scss";
import { useFold } from "./use-fold.ts";

const isClipped = (element: Element): boolean =>
	element.scrollWidth > element.clientWidth;

/**
 * Shows the full text of a crumb as a tooltip, only while the crumb cuts it
 * short.
 */
const ClippedHint = ({
	element,
	children,
}: Readonly<{
	element: ReactElement;
	children: ReactNode;
}>): ReactNode => (
	<Tooltip.Root
		onOpenChange={(open, details) => {
			if (
				open &&
				!(
					details.trigger !== undefined &&
					isClipped(details.trigger)
				)
			) {
				details.cancel();
			}
		}}>
		<Tooltip.Trigger render={element} />
		<Tooltip.Portal>
			<Tooltip.Positioner>
				<Tooltip.Popup>{children}</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
);

export type BreadcrumbsRootProps = Omit<
	useRender.ComponentProps<"nav">,
	"aria-label"
> &
	Readonly<{
		/** The landmark's name, such as "Breadcrumbs". */
		"aria-label": string;
	}>;

/** The breadcrumb landmark. */
const Root = ({
	render,
	className,
	ref,
	...props
}: BreadcrumbsRootProps): ReactElement =>
	useRender({
		defaultTagName: "nav",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.root, className),
		},
	});

export type BreadcrumbsListProps =
	useRender.ComponentProps<"ol">;

/**
 * The crumbs and separators on one line. A crumb that does not fit is cut
 * short, and the crumbs share the room equally.
 */
const List = ({
	render,
	className,
	ref,
	...props
}: BreadcrumbsListProps): ReactElement =>
	useRender({
		defaultTagName: "ol",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.list, className),
		},
	});

export type BreadcrumbsItemProps =
	useRender.ComponentProps<"li">;

/** One crumb, holding a `Link`, the `Page` or the `Overflow`. */
const Item = ({
	render,
	className,
	ref,
	...props
}: BreadcrumbsItemProps): ReactElement =>
	useRender({
		defaultTagName: "li",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.item, className),
		},
	});

export type BreadcrumbsLinkProps =
	useRender.ComponentProps<"a">;

/**
 * A crumb leading to a page above the current one. It spreads every other prop
 * onto the `<a>` and forwards its ref, so a router's `createLink` can wrap it.
 * When it cuts its text short, it shows the full text as a tooltip.
 */
const BreadcrumbLink = ({
	render,
	className,
	children,
	ref,
	...props
}: BreadcrumbsLinkProps): ReactNode => (
	<ClippedHint
		element={
			<LinkElement
				render={render}
				ref={ref}
				{...props}
				className={clsx(style.crumb, className)}>
				{children}
			</LinkElement>
		}>
		{children}
	</ClippedHint>
);

const LinkElement = ({
	render,
	ref,
	...props
}: BreadcrumbsLinkProps): ReactElement =>
	useRender({ defaultTagName: "a", render, ref, props });

export type BreadcrumbsPageProps =
	ComponentPropsWithRef<"span">;

/**
 * The current page's crumb, which is not a link. When it cuts its text short,
 * it shows the full text as a tooltip.
 */
const Page = ({
	className,
	children,
	...props
}: BreadcrumbsPageProps): ReactNode => (
	<ClippedHint
		element={
			<span
				aria-current="page"
				{...props}
				className={clsx(style.crumb, className)}>
				{children}
			</span>
		}>
		{children}
	</ClippedHint>
);

export type BreadcrumbsSeparatorProps =
	useRender.ComponentProps<"li">;

/**
 * The decorative space between two crumbs, holding the app's mark, such as a
 * chevron, given as `children`. Without one it is spacing alone.
 */
const Separator = ({
	render,
	className,
	ref,
	...props
}: BreadcrumbsSeparatorProps): ReactElement =>
	useRender({
		defaultTagName: "li",
		render,
		ref,
		props: {
			...props,
			"aria-hidden": true,
			className: clsx(style.separator, className),
		},
	});

export type BreadcrumbsOverflowProps = Readonly<{
	/** Accessible name of the button, such as "Show more", surfaced as its tooltip. */
	label: string;
	/** The button's glyph, such as the app's ellipsis. */
	icon: ReactNode;
	/** The folded crumbs, each a `Menu.LinkItem`. */
	children: ReactNode;
}>;

/** A button that opens a menu of the crumbs the trail has no room for. */
const Overflow = ({
	label,
	icon,
	children,
}: BreadcrumbsOverflowProps): ReactNode => (
	<Menu.Root>
		<Menu.Trigger icon={icon} label={label} />
		<Menu.Content
			align="start"
			sideOffset={4}
			className={style.popup}>
			{children}
		</Menu.Content>
	</Menu.Root>
);

export type BreadcrumbsGaugeProps = Readonly<{
	/** Every crumb's label, outermost first. */
	labels: readonly ReactNode[];
	/** The `Overflow` button's label, so the copy measures the same. */
	overflowLabel: string;
	/** The `Overflow` button's glyph, so the copy measures the same. */
	overflowIcon: ReactNode;
	/** The mark between crumbs, so the copy measures the same. */
	separator?: ReactNode;
	ref: Ref<HTMLOListElement>;
}>;

/**
 * A hidden copy of the whole trail at its full length, with one separator and
 * the overflow button, for `useFold` to measure.
 */
const Gauge = ({
	labels,
	overflowLabel,
	overflowIcon,
	separator,
	ref,
}: BreadcrumbsGaugeProps): ReactNode => (
	<div className={style.gauge} aria-hidden inert>
		<ol ref={ref} className={style.gaugeList}>
			{labels.map((label, index) => (
				<li
					// oxlint-disable-next-line react/no-array-index-key -- the copy is never reordered
					key={index}
					data-gauge="crumb"
					className={style.item}>
					<span className={style.crumb}>{label}</span>
				</li>
			))}
			<Separator render={<li data-gauge="separator" />}>
				{separator}
			</Separator>
			<li data-gauge="overflow" className={style.item}>
				<IconButton
					variant="tertiary"
					label={overflowLabel}>
					{overflowIcon}
				</IconButton>
			</li>
		</ol>
	</div>
);

/** One crumb of a trail: its label and, above the current page, the link it renders as. */
export type Crumb = Readonly<{
	/** Stable key, such as the route id. */
	id: string;
	label: ReactNode;
	/** The link this crumb renders as, such as a router `Link`; a crumb without one is plain text. */
	render?: ReactElement;
	/** The label as plain text, for the overflow menu's type-ahead. */
	textValue?: string;
}>;

export type BreadcrumbsProps = Readonly<{
	/** The landmark's name, such as "Breadcrumbs". */
	label: string;
	/** The overflow button's name, such as "Show more". */
	overflowLabel: string;
	/** The overflow button's glyph, such as the app's ellipsis. */
	overflowIcon: ReactNode;
	/** The mark between crumbs, such as the app's chevron; without one, crumbs are kept apart by spacing alone. */
	separator?: ReactNode;
	/** The trail, outermost first; the last crumb is the current page. */
	crumbs: readonly Crumb[];
	className?: string;
}>;

const Ancestor = ({
	crumb,
	separator,
}: Readonly<{
	crumb: Crumb;
	separator: ReactNode;
}>): ReactNode => (
	<>
		<Item>
			{crumb.render === undefined ? (
				<span className={style.crumb}>{crumb.label}</span>
			) : (
				<BreadcrumbLink render={crumb.render}>
					{crumb.label}
				</BreadcrumbLink>
			)}
		</Item>
		<Separator>{separator}</Separator>
	</>
);

/**
 * A trail of crumbs that fits its room: when it does not, the crumbs after the
 * first fold into an overflow menu, one by one, until it fits. The first crumb
 * and the current page stay. Renders nothing for a trail of one.
 */
const Trail = ({
	label,
	overflowLabel,
	overflowIcon,
	separator,
	crumbs,
	className,
}: BreadcrumbsProps): ReactNode => {
	const { root, gauge, folded } = useFold();
	const current = crumbs.at(-1);

	if (crumbs.length < 2 || current === undefined) {
		return null;
	}

	const ancestors = crumbs.slice(0, -1);
	const hidden = ancestors.slice(1, 1 + folded);

	return (
		<Root
			ref={root}
			aria-label={label}
			className={className}>
			<List>
				{ancestors.slice(0, 1).map(crumb => (
					<Ancestor
						key={crumb.id}
						crumb={crumb}
						separator={separator}
					/>
				))}
				{hidden.length > 0 ? (
					<>
						<Item>
							<Overflow
								label={overflowLabel}
								icon={overflowIcon}>
								{hidden.map(crumb =>
									crumb.render === undefined ? (
										<Menu.Item
											key={crumb.id}
											label={crumb.textValue}
											disabled>
											{crumb.label}
										</Menu.Item>
									) : (
										<Menu.LinkItem
											key={crumb.id}
											label={crumb.textValue}
											closeOnClick
											render={crumb.render}>
											{crumb.label}
										</Menu.LinkItem>
									),
								)}
							</Overflow>
						</Item>
						<Separator>{separator}</Separator>
					</>
				) : null}
				{ancestors.slice(1 + hidden.length).map(crumb => (
					<Ancestor
						key={crumb.id}
						crumb={crumb}
						separator={separator}
					/>
				))}
				<Item>
					<Page>{current.label}</Page>
				</Item>
			</List>
			<Gauge
				ref={gauge}
				labels={crumbs.map(crumb => crumb.label)}
				overflowLabel={overflowLabel}
				overflowIcon={overflowIcon}
				separator={separator}
			/>
		</Root>
	);
};

type BreadcrumbsParts = typeof Trail &
	Readonly<{
		Root: typeof Root;
		List: typeof List;
		Item: typeof Item;
		Link: typeof BreadcrumbLink;
		Page: typeof Page;
		Separator: typeof Separator;
		Overflow: typeof Overflow;
		Gauge: typeof Gauge;
	}>;

/**
 * The trail to the current page. Given `crumbs`, it folds what does not fit
 * into an overflow menu; the parts hanging off it compose a trail by hand.
 *
 * @example
 * <Breadcrumbs
 * 	label="Breadcrumbs"
 * 	overflowLabel="Show more"
 * 	overflowIcon={<MoreIcon />}
 * 	separator={<ChevronIcon />}
 * 	crumbs={[
 * 		{ id: "home", label: "Home", render: <Link to="/" /> },
 * 		{ id: "invoices", label: "Invoices", render: <Link to="/invoices" /> },
 * 		{ id: "invoice", label: "Invoice 2041" },
 * 	]}
 * />
 */
export const Breadcrumbs: BreadcrumbsParts = Object.assign(
	Trail,
	{
		Root,
		List,
		Item,
		Link: BreadcrumbLink,
		Page,
		Separator,
		Overflow,
		Gauge,
	},
);
