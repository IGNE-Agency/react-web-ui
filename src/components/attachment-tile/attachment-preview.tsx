import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	type Context,
	createContext,
	type ReactElement,
	type ReactNode,
	useEffect,
	useState,
} from "react";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import { Skeleton } from "../skeleton/index.ts";
import style from "./attachment-tile.module.scss";

const extensionOf = (name: string): string => {
	const dot = name.lastIndexOf(".");
	return dot > 0 ? name.slice(dot + 1) : "";
};

/** An image source for a preview, and whether one is still on its way. */
export type AttachmentPreviewSource = Readonly<{
	src: string | undefined;
	pending: boolean;
}>;

/**
 * Reads an image blob into a `data:` URL for an inline preview, for as long as
 * the caller is mounted. A blob that is not an image gets none.
 *
 * @example
 * useAttachmentPreview(file); // -> { src: "data:image/png;base64,…", pending: false }
 */
export const useAttachmentPreview = (
	blob: Blob | undefined,
): AttachmentPreviewSource => {
	const image = blob?.type.startsWith("image/")
		? blob
		: undefined;
	const [read, setRead] =
		useState<Readonly<{ blob: Blob; dataUrl: string }>>();
	const dataUrl =
		read !== undefined && read.blob === image
			? read.dataUrl
			: undefined;

	useEffect(() => {
		if (!image) {
			return undefined;
		}
		let cancelled = false;
		const reader = new FileReader();
		reader.onload = () => {
			if (!cancelled && typeof reader.result === "string") {
				setRead({ blob: image, dataUrl: reader.result });
			}
		};
		reader.readAsDataURL(image);
		return () => {
			cancelled = true;
			reader.abort();
		};
	}, [image]);

	return {
		src: dataUrl,
		pending: image !== undefined && dataUrl === undefined,
	};
};

type PreviewContextValue = Readonly<{
	name: string;
	/** The source to show, unless it failed to load. */
	image: string | undefined;
	pending: boolean;
	busy: boolean;
	onLoaded: (src: string) => void;
	onBroken: (src: string) => void;
}>;

const PreviewContext: Context<PreviewContextValue | null> =
	createContext<PreviewContextValue | null>(null);

const usePreview = (): PreviewContextValue =>
	useRequiredContext(
		PreviewContext,
		"AttachmentTile preview parts must be rendered within <AttachmentTile.Preview>.",
	);

const useFallbackShown = (): boolean => {
	const { image, pending } = usePreview();
	return image === undefined && !pending;
};

export type AttachmentPreviewProps =
	ComponentPropsWithRef<"span"> &
		Readonly<{
			name: string;
			/** Image source; without one the tile shows its `Icon` and `Extension`. */
			src: string | undefined;
			/** Whether an image source is still being produced. */
			pending?: boolean;
		}>;

/**
 * The inside of an attachment tile, holding the `Image`, `Icon`, `Extension`,
 * `Skeleton` and `Name` that read its file. A source that fails to load falls
 * back to the icon and the extension.
 *
 * @example
 * <AttachmentTile.Preview name="nota.pdf" src={undefined}>
 * 	<AttachmentTile.Image />
 * 	<AttachmentTile.Extension />
 * 	<AttachmentTile.Name />
 * </AttachmentTile.Preview>
 */
export const AttachmentPreview = ({
	name,
	src,
	pending = false,
	className,
	...props
}: AttachmentPreviewProps): ReactNode => {
	const [loadedSrc, setLoadedSrc] = useState<string>();
	const [brokenSrc, setBrokenSrc] = useState<string>();
	const image = src === brokenSrc ? undefined : src;
	const phase = useBusyPhase({
		busy:
			pending ||
			(image !== undefined && image !== loadedSrc),
	});
	const busy = phase !== "fresh";

	return (
		<PreviewContext
			value={{
				name,
				image,
				pending,
				busy,
				onLoaded: setLoadedSrc,
				onBroken: setBrokenSrc,
			}}>
			<span
				{...props}
				className={clsx(style.preview, className)}
				aria-busy={busy || undefined}
			/>
		</PreviewContext>
	);
};

export type AttachmentImageProps = Omit<
	useRender.ComponentProps<"img">,
	"src"
>;

/**
 * The image, once there is a source that loads. Renders nothing otherwise.
 *
 * @example
 * <AttachmentTile.Image />
 */
export const AttachmentImage = ({
	className,
	render,
	ref,
	...props
}: AttachmentImageProps): ReactElement | null => {
	const { image, onLoaded, onBroken } = usePreview();
	const settleAlreadyDecoded = (
		node: HTMLImageElement | null,
	): void => {
		if (image === undefined || !node?.complete) {
			return;
		}
		if (node.naturalWidth === 0) {
			onBroken(image);
			return;
		}
		onLoaded(image);
	};
	return useRender({
		defaultTagName: "img",
		render,
		ref:
			ref === undefined
				? settleAlreadyDecoded
				: [ref, settleAlreadyDecoded],
		enabled: image !== undefined,
		props: {
			alt: "",
			...props,
			src: image,
			className: clsx(style.image, className),
			onLoad: () => {
				if (image !== undefined) {
					onLoaded(image);
				}
			},
			onError: () => {
				if (image !== undefined) {
					onBroken(image);
				}
			},
		},
	});
};

/**
 * A file-type glyph where there is no image, such as a document icon. Renders
 * nothing without children.
 *
 * @example
 * <AttachmentTile.Icon><DescriptionIcon /></AttachmentTile.Icon>
 */
export const AttachmentIcon = ({
	className,
	render,
	ref,
	children,
	...props
}: useRender.ComponentProps<"span">): ReactElement | null => {
	const shown = useFallbackShown();
	return useRender({
		defaultTagName: "span",
		render,
		ref,
		enabled:
			shown &&
			children !== undefined &&
			children !== null &&
			children !== false,
		props: {
			"aria-hidden": true,
			...props,
			className: clsx(style.icon, className),
			children,
		},
	});
};

export type AttachmentTextProps = Omit<
	useRender.ComponentProps<"span">,
	"children"
>;

/**
 * The file's extension where there is no image, such as "pdf". Renders
 * nothing for a name without one.
 *
 * @example
 * <AttachmentTile.Extension />
 */
export const AttachmentExtension = ({
	className,
	render,
	ref,
	...props
}: AttachmentTextProps): ReactElement | null => {
	const { name } = usePreview();
	const shown = useFallbackShown();
	const extension = extensionOf(name);
	return useRender({
		defaultTagName: "span",
		render,
		ref,
		enabled: shown && extension !== "",
		props: {
			...props,
			className: clsx(style.extension, className),
			children: extension,
		},
	});
};

export type AttachmentSkeletonProps = Readonly<{
	className?: string;
}>;

/**
 * The placeholder while the image is still on its way. Renders nothing once it
 * has arrived.
 *
 * @example
 * <AttachmentTile.Skeleton />
 */
export const AttachmentSkeleton = ({
	className,
}: AttachmentSkeletonProps): ReactNode =>
	usePreview().busy ? (
		<Skeleton
			className={clsx(style.imageSkeleton, className)}
		/>
	) : null;

/**
 * The file's name, for assistive tech only.
 *
 * @example
 * <AttachmentTile.Name />
 */
export const AttachmentName = ({
	className,
	render,
	ref,
	...props
}: AttachmentTextProps): ReactElement => {
	const { name } = usePreview();
	return useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.name, className),
			children: name,
		},
	});
};
