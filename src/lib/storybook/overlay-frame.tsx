import type { Decorator } from "@storybook/react-vite";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useArgs } from "storybook/preview-api";
import { z } from "zod";
import styles from "./overlay-frame.module.scss";

/** How tall an overlay story's frame is. */
export type OverlayFrameSize = "small" | "medium" | "large";

type OverlayFrame = Readonly<{
	container: HTMLElement | null | undefined;
	docs: boolean;
}>;

const OverlayFrameContext = createContext<OverlayFrame>({
	container: undefined,
	docs: false,
});

const CanvasFrame = ({
	size,
	children,
}: Readonly<{
	size: OverlayFrameSize;
	children: ReactNode;
}>) => {
	useEffect(() => {
		const root = document.documentElement;
		root.dataset["overlayFrame"] = size;
		return () => {
			delete root.dataset["overlayFrame"];
		};
	}, [size]);

	return <div className={styles.stage}>{children}</div>;
};

const DocsFrame = ({
	size,
	interactive,
	children,
}: Readonly<{
	size: OverlayFrameSize;
	interactive: boolean;
	children: ReactNode;
}>) => {
	const [container, setContainer] =
		useState<HTMLElement | null>(null);

	return (
		<div
			ref={setContainer}
			className={styles.frame}
			data-overlay-frame={size}
			inert={!interactive}>
			<OverlayFrameContext
				value={{ container, docs: true }}>
				<div className={styles.stage}>{children}</div>
			</OverlayFrameContext>
		</div>
	);
};

const interactiveFrame = z.object({
	interactive: z.literal(true),
});

/**
 * A story decorator that holds an overlay in a frame of `size`. On the canvas
 * the document is the frame; on a docs page it is a box the story portals into
 * through {@link useOverlayFrame}, inert unless the story sets
 * `parameters.overlayFrame.interactive`.
 *
 * @example
 * const meta = {
 * 	component: Dialog.Root,
 * 	decorators: [withOverlayFrame()],
 * } satisfies Meta<typeof Dialog.Root>;
 */
export const withOverlayFrame =
	(size: OverlayFrameSize = "large"): Decorator =>
	(Story, { viewMode, parameters }) =>
		viewMode === "docs" ? (
			<DocsFrame
				size={size}
				interactive={
					interactiveFrame.safeParse(
						parameters["overlayFrame"],
					).success
				}>
				<Story />
			</DocsFrame>
		) : (
			<CanvasFrame size={size}>
				<Story />
			</CanvasFrame>
		);

/**
 * The `container` for an overlay's portal in a {@link withOverlayFrame} story,
 * and whether it renders on a docs page.
 *
 * @example
 * const { container } = useOverlayFrame();
 * <Dialog.Portal container={container}>…</Dialog.Portal>
 */
export const useOverlayFrame = () =>
	useContext(OverlayFrameContext);

/**
 * Sets the story's `open` arg, except on a docs page, where the preview keeps
 * the state its controls set.
 *
 * @example
 * const setOpen = useOpenArg();
 * <Dialog.Root {...args} onOpenChange={open => setOpen(open)} />
 */
export const useOpenArg = () => {
	const [, updateArgs] = useArgs<{ open?: boolean }>();
	const { docs } = useOverlayFrame();

	return (open: boolean) => {
		if (!docs) {
			updateArgs({ open });
		}
	};
};
