import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	type Context,
	createContext,
	type ReactElement,
	type ReactNode,
	useId,
} from "react";
import type { Tone } from "../../lib/tone.ts";
import { useAnnounceOnMount } from "../../lib/use-announce-on-mount.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { IconButton } from "../button/button.tsx";
import { useCopy } from "../copy-provider/index.ts";
import { useIcons } from "../icon-provider/index.ts";
import style from "./banner.module.scss";

/** The screen edge a banner stands against. */
export type BannerEdge = "top" | "bottom";

const TitleIdContext: Context<string | null> =
	createContext<string | null>(null);

export type BannerRootProps =
	useRender.ComponentProps<"div"> &
		Readonly<{
			/** The banner's colour. @default "neutral" */
			tone?: Tone;
			/**
			 * Makes the banner a polite live region, announced when it appears or
			 * changes. Pass it for a condition, such as being offline; leave it out
			 * for a promotion or a notice.
			 */
			live?: "status";
			/**
			 * The screen edge the banner stands against, whose safe-area insets it
			 * pays with the sides'. Leave it out for a banner inside the content.
			 */
			edge?: BannerEdge;
		}>;

/**
 * The bar, in its tone: a region named by its `Title`, and a polite live region
 * announced when it mounts if `live` is set.
 */
const Root = ({
	tone = "neutral",
	live,
	edge,
	className,
	render,
	ref,
	...props
}: BannerRootProps): ReactElement => {
	const titleId = useId();
	const announceRef = useAnnounceOnMount<HTMLDivElement>(
		live !== undefined,
	);

	const element = useRender({
		defaultTagName: "div",
		render,
		ref:
			ref === undefined ? announceRef : [announceRef, ref],
		props: {
			...props,
			role: "region",
			"aria-labelledby": titleId,
			"aria-live":
				live === undefined ? undefined : "polite",
			"aria-atomic": live === undefined ? undefined : true,
			"data-tone": tone,
			"data-variant": "subtle",
			"data-edge": edge,
			className: clsx(style.root, className),
		},
	});

	return (
		<TitleIdContext value={titleId}>
			{element}
		</TitleIdContext>
	);
};

export type BannerIconProps =
	useRender.ComponentProps<"span">;

/** The caller's glyph before the title, sized and coloured by the banner. Renders nothing without children. */
const BannerIcon = ({
	className,
	render,
	children,
	...props
}: BannerIconProps): ReactNode =>
	useRender({
		defaultTagName: "span",
		render,
		enabled:
			children !== undefined &&
			children !== null &&
			children !== false,
		props: {
			"aria-hidden": true,
			...props,
			children,
			className: clsx(style.icon, className),
		},
	});

export type BannerTitleProps =
	useRender.ComponentProps<"p">;

/** What the banner says, in one short sentence, and the region's name. A paragraph unless `render` names a heading. */
const Title = ({
	className,
	render,
	...props
}: BannerTitleProps): ReactElement => {
	const id = useRequiredContext(
		TitleIdContext,
		"Banner.Title must be rendered within <Banner.Root>.",
	);

	return useRender({
		defaultTagName: "p",
		render,
		props: {
			...props,
			id,
			className: clsx(style.title, className),
		},
	});
};

export type BannerDescriptionProps =
	useRender.ComponentProps<"p">;

/** What it means for the reader, and what they can do. */
const Description = ({
	className,
	render,
	...props
}: BannerDescriptionProps): ReactElement =>
	useRender({
		defaultTagName: "p",
		render,
		props: {
			...props,
			className: clsx(style.description, className),
		},
	});

export type BannerActionsProps =
	useRender.ComponentProps<"div">;

/** The row of the app's buttons under the text, sized and re-coloured for the banner's tone. */
const Actions = ({
	className,
	render,
	...props
}: BannerActionsProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		props: {
			...props,
			className: clsx(style.actions, className),
		},
	});

export type BannerCloseProps = Omit<
	ComponentPropsWithRef<"button">,
	"children"
>;

/**
 * The icon-only button that dismisses the banner, named by the `CopyProvider`'s
 * `close` and drawn with the `IconProvider`'s `close`. Its `onClick` is the
 * app's, which stops rendering the banner and moves focus on.
 *
 * @example
 * <Banner.Close onClick={dismiss} />
 */
const Close = ({
	className,
	...props
}: BannerCloseProps): ReactNode => {
	const copy = useCopy();
	const icons = useIcons();

	return (
		<IconButton
			variant="tertiary"
			size="sm"
			label={copy.close}
			{...props}
			className={clsx(style.close, className)}>
			{icons.close}
		</IconButton>
	);
};

type BannerNamespace = Readonly<{
	Root: typeof Root;
	Icon: typeof BannerIcon;
	Title: typeof Title;
	Description: typeof Description;
	Actions: typeof Actions;
	Close: typeof Close;
}>;

/**
 * An app-wide bar, such as for being offline or a promotion, as parts: the
 * `Root` region in its tone, an `Icon`, a `Title` that names it, a
 * `Description`, the app's `Actions` and a `Close`. It sits in the page's flow,
 * where the app puts it.
 *
 * @example
 * <Banner.Root tone="warning" edge="top" live="status">
 * 	<Banner.Icon><CloudOffIcon /></Banner.Icon>
 * 	<Banner.Title>You're offline</Banner.Title>
 * 	<Banner.Description>Changes are saved once you're back online.</Banner.Description>
 * </Banner.Root>
 */
export const Banner: BannerNamespace = {
	Root,
	Icon: BannerIcon,
	Title,
	Description,
	Actions,
	Close,
};
