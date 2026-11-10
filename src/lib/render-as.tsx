import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type {
	ComponentPropsWithRef,
	ReactElement,
} from "react";

type ButtonProps = ComponentPropsWithRef<"button">;

type RenderedProps = Readonly<{
	render: useRender.RenderProp;
	props: ButtonProps;
}>;

const Rendered = ({
	render,
	props: { ref, ...props },
}: RenderedProps): ReactElement =>
	useRender({ render, ref, props });

/**
 * A react-aria `render` function that hands the component's DOM props, and
 * any `extra` props, to a base-ui style `render` element such as a kit button,
 * merged the way base-ui merges them.
 *
 * @example
 * <AriaButton slot="remove" render={renderAs(<IconButton label="Remove"><CloseIcon /></IconButton>)} />
 */
export const renderAs =
	(render: useRender.RenderProp, extra?: ButtonProps) =>
	(props: ButtonProps): ReactElement => (
		<Rendered
			render={render}
			props={
				extra === undefined
					? props
					: mergeProps<"button">(props, extra)
			}
		/>
	);
