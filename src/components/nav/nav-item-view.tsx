import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	type ReactElement,
	type ReactNode,
	use,
} from "react";
import { Icon, type SvgComponent } from "../icon/icon.tsx";
import {
	NavContext,
	NavItemLayoutContext,
	type NavLayout,
} from "./nav-context.ts";
import style from "./nav.module.scss";

/** What every nav entry takes besides its element's own props. */
export type NavEntryProps = Readonly<{
	/** @default "row" */
	layout?: NavLayout;
	/** When false, the label hides and the entry is named by `label` and the nav's tooltip instead. @default true */
	labelled?: boolean;
	/** The entry's name, for where no visible `Label` carries it. */
	label: string;
}>;

type EntryShellProps = NavEntryProps &
	Readonly<{
		element: ReactElement;
	}>;

/**
 * Hangs an entry's element off the nav's one tooltip, which names it while it
 * is unlabelled. Outside a `Nav.Root` the element stands alone.
 */
export const EntryShell = ({
	layout = "row",
	labelled = true,
	label,
	element,
}: EntryShellProps): ReactNode => {
	const nav = use(NavContext);

	return (
		<NavItemLayoutContext value={layout}>
			{nav === null ? (
				element
			) : (
				<BaseTooltip.Trigger
					handle={nav.hint}
					payload={label}
					disabled={labelled}
					render={element}
				/>
			)}
		</NavItemLayoutContext>
	);
};

/** The attributes an entry's element carries for its layout and label. */
export const entryAttributes = ({
	layout = "row",
	labelled = true,
	label,
}: NavEntryProps): Readonly<{
	"data-layout": NavLayout;
	"data-labelled": "false" | undefined;
	"aria-label": string | undefined;
}> => ({
	"data-layout": layout,
	"data-labelled": labelled ? undefined : "false",
	"aria-label": labelled ? undefined : label,
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
	labelled,
	label,
	className,
	...props
}: NavItemRootProps): ReactNode => (
	<EntryShell
		layout={layout}
		labelled={labelled}
		label={label}
		element={
			<NavItemElement
				{...entryAttributes({ layout, labelled, label })}
				className={clsx(style.item, className)}
				{...props}
			/>
		}
	/>
);

export type NavItemIconProps = Readonly<{
	svg: SvgComponent;
	className?: string;
}>;

/**
 * The entry's glyph. A stacked entry's icon carries the destination on its own,
 * so it takes 24px over the row's text-matched 16px.
 */
const NavItemIcon = ({
	svg,
	className,
}: NavItemIconProps): ReactNode => {
	const layout = use(NavItemLayoutContext);

	return (
		<span className={clsx(style.iconSlot, className)}>
			<Icon
				svg={svg}
				label=""
				size={layout === "stack" ? 1.5 : 1}
			/>
		</span>
	);
};

/** The entry's text. Fades out where the entry is named by its tooltip instead. */
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
 * <NavItemView.Root render={<Drawer.Trigger />} label="More" layout="stack">
 * 	<NavItemView.Icon svg={MoreIcon} />
 * 	<NavItemView.Label>More</NavItemView.Label>
 * </NavItemView.Root>
 */
export const NavItemView: NavItemViewParts = {
	Root,
	Icon: NavItemIcon,
	Label,
};
