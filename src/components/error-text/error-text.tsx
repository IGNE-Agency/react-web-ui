import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	Children,
	type HTMLAttributes,
	type ReactNode,
	type Ref,
} from "react";
import { useErrorCascade } from "./error-cascade.ts";
import style from "./error-text.module.scss";

export type ErrorTextProps = Readonly<
	Omit<HTMLAttributes<HTMLElement>, "children"> &
		Readonly<{
			ref?: Ref<HTMLElement>;
			/** One message, or a list of them; empty entries are skipped. */
			children?: ReactNode;
		}> &
		(
			| Readonly<{ el?: "p" | "span"; htmlFor?: never }>
			| Readonly<{ el: "label"; htmlFor: string }>
		)
>;

const messagesOf = (
	children: ReactNode,
): readonly ReactNode[] =>
	(Array.isArray(children) ? children : [children]).filter(
		message =>
			message !== null &&
			message !== undefined &&
			message !== false &&
			message !== "",
	);

/**
 * Renders one or more error messages, one per line, or nothing at all when there
 * are none. The text is there from the first frame; each message drops in after
 * the ones that arrived with it in the same `Form.Root`, unless the reader
 * prefers reduced motion. Every other prop is forwarded to the element.
 *
 * @example
 * <ErrorText role="alert">{["Enter a name.", "Use letters only."]}</ErrorText>
 */
export const ErrorText = ({
	el = "p",
	className,
	children,
	ref,
	...rest
}: ErrorTextProps): ReactNode => {
	const cascade = useErrorCascade();
	const messages = messagesOf(children);

	return useRender({
		enabled: messages.length > 0,
		defaultTagName: el,
		ref: [
			ref ?? null,
			(node: HTMLElement | null) => {
				if (node !== null) {
					node.style.setProperty(
						"--error-index",
						String(
							cascade?.claim(
								node,
								node.childElementCount,
							) ?? 0,
						),
					);
				}
			},
		],
		props: {
			...rest,
			"data-error-text": "",
			className: clsx(style.text, className),
			children: Children.map(messages, message => (
				<span className={style.message}>{message}</span>
			)),
		},
	});
};
