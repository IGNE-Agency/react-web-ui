import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import style from "./divider.module.scss";

export type DividerRootProps =
	useRender.ComponentProps<"div">;

/**
 * The space around a divider, holding its `Rule` and any `Label`.
 *
 * @example
 * <Divider.Root><Divider.Rule /></Divider.Root>
 */
const Root = ({
	render,
	className,
	ref,
	...props
}: DividerRootProps): ReactElement =>
	useRender({
		defaultTagName: "div",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.container, className),
		},
	});

export type DividerRuleProps =
	useRender.ComponentProps<"hr">;

/**
 * The rule itself, a bare `<hr>`.
 *
 * @example
 * <Divider.Rule />
 */
const Rule = ({
	render,
	className,
	ref,
	...props
}: DividerRuleProps): ReactElement =>
	useRender({
		defaultTagName: "hr",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.divider, className),
		},
	});

export type DividerLabelProps =
	useRender.ComponentProps<"p">;

/**
 * A short line under the rule, naming what follows it.
 *
 * @example
 * <Divider.Label>Earlier messages</Divider.Label>
 */
const Label = ({
	render,
	className,
	ref,
	...props
}: DividerLabelProps): ReactElement =>
	useRender({
		defaultTagName: "p",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.subtitle, className),
		},
	});

export type DividerProps = Readonly<{
	/** A short line under the rule, naming what follows it. */
	subtitle?: string;
	className?: string;
}>;

const Prefab = ({
	subtitle,
	className,
}: DividerProps): ReactNode => (
	<Root className={className}>
		<Rule />
		{subtitle === undefined ? null : (
			<Label>{subtitle}</Label>
		)}
	</Root>
);

/** The parts of a divider, hanging off its prefab. */
export type DividerParts = typeof Prefab &
	Readonly<{
		Root: typeof Root;
		Rule: typeof Rule;
		Label: typeof Label;
	}>;

/**
 * A horizontal rule between two groups, with an optional subtitle under it.
 * The parts hanging off it compose one by hand.
 *
 * @example
 * <Divider subtitle="Earlier messages" />
 */
export const Divider: DividerParts = Object.assign(Prefab, {
	Root,
	Rule,
	Label,
});
