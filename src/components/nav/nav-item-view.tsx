import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	type ReactElement,
	type ReactNode,
	use,
} from "react";
import {
	NavContext,
	type NavLayout,
} from "./nav-context.ts";
import style from "./nav.module.scss";

/** What every nav entry takes besides its element's own props. */
export type NavEntryProps = Readonly<{
	/** @default "row" */
	layout?: NavLayout;
	/** The entry's name where no visible `Label` carries it: announced, and shown by the nav's `Hint`. */
	label?: string;
}>;

type EntryShellProps = Pick<NavEntryProps, "label"> &
	Readonly<{
		element: ReactElement;
	}>;

/**
 * Hangs an entry's element off the nav's one hint, which shows its `label`.
 * Outside a `Nav.Root` the element stands alone.
 */
export const EntryShell = ({
	label,
	element,
}: EntryShellProps): ReactNode => {
	const nav = use(NavContext);

	return nav === null ? (
		element
	) : (
		<BaseTooltip.Trigger
			handle={nav.hint}
			payload={label}
			disabled={label === undefined}
			render={element}
		/>
	);
};

/** The attributes an entry's element carries for its layout and label. */
export const entryAttributes = ({
	layout = "row",
	label,
}: NavEntryProps): Readonly<{
	"data-layout": NavLayout;
	"aria-label": string | undefined;
}> => ({
	"data-layout": layout,
	"aria-label": label,
});

const NavItemElement = ({
	render,
	ref,
	...props
}: useRender.ComponentProps<"button">): ReactElement =>
	useRender({
		defaultTagName: "button",
		render,
		ref,
		props,
	});

export type NavItemRootProps =
	useRender.ComponentProps<"button"> & NavEntryProps;

/**
 * The shell every nav entry shares, over whatever element `render` names — a
 * `Drawer.Trigger`, a router link, or the default `<button>`. Mark the current
 * destination with `data-active="true"` or `aria-current="page"`.
 */
const Root = ({
	layout,
	label,
	className,
	...props
}: NavItemRootProps): ReactNode => (
	<EntryShell
		label={label}
		element={
			<NavItemElement
				{...entryAttributes({ layout, label })}
				className={clsx(style.item, className)}
				{...props}
			/>
		}
	/>
);

export type NavItemIconProps = Readonly<{
	className?: string;
	/** The app's icon, drawn at `1em` in `currentColor`; the slot sizes it. */
	children: ReactNode;
}>;

/**
 * The entry's icon slot. A stacked entry's icon carries the destination on its
 * own, so it takes 1.5em over the row's text-matched 1em.
 */
const NavItemIcon = ({
	className,
	children,
}: NavItemIconProps): ReactNode => (
	<span
		aria-hidden="true"
		className={clsx(style.iconSlot, className)}>
		{children}
	</span>
);

/** The entry's text. Leave it out where the entry is named by its `label` and the nav's `Hint` instead. */
const Label = ({
	className,
	...props
}: ComponentPropsWithRef<"span">): ReactNode => (
	<span
		className={clsx(style.label, className)}
		{...props}
	/>
);

type NavItemViewParts = Readonly<{
	Root: typeof Root;
	Icon: typeof NavItemIcon;
	Label: typeof Label;
}>;

/**
 * The parts of one nav entry: the `Root` shell, its `Icon` and its `Label`.
 * `Nav.Link` is the same shell as an `<a>`; reach for `Root` for an entry that
 * is not a link, such as the trigger of an overflow sheet.
 *
 * @example
 * <NavItemView.Root render={<Drawer.Trigger />} layout="stack">
 * 	<NavItemView.Icon><MoreIcon /></NavItemView.Icon>
 * 	<NavItemView.Label>More</NavItemView.Label>
 * </NavItemView.Root>
 */
export const NavItemView: NavItemViewParts = {
	Root,
	Icon: NavItemIcon,
	Label,
};
