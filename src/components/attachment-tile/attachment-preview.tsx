import { clsx } from "clsx";
import {
	type ComponentPropsWithRef,
	type ReactNode,
	useEffect,
	useState,
} from "react";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import { Skeleton } from "../skeleton/index.ts";
import { Tooltip } from "../tooltip/index.ts";
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

export type AttachmentPreviewProps = Omit<
	ComponentPropsWithRef<"span">,
	"children"
> &
	Readonly<{
		name: string;
		/** Tooltip text for the preview. */
		hint: string;
		/** Image source; without one the tile shows its `icon` and the file's extension. */
		src: string | undefined;
		/** Whether an image source is still being produced. */
		pending?: boolean;
		/** A file-type glyph above the extension, where there is no image. */
		icon?: ReactNode;
	}>;

/**
 * The inside of an attachment tile: an image preview where there is one, the
 * `icon` and the file's extension otherwise, plus the file name for assistive
 * tech. A source that is still arriving shows a skeleton; one that fails to
 * load falls back to the extension.
 *
 * @example
 * <AttachmentTile.Preview name="nota.pdf" hint="nota.pdf (12 kB)" src={undefined} />
 */
export const AttachmentPreview = ({
	name,
	hint,
	src,
	pending = false,
	icon,
	className,
	...props
}: AttachmentPreviewProps): ReactNode => {
	const [loadedSrc, setLoadedSrc] = useState<string>();
	const [brokenSrc, setBrokenSrc] = useState<string>();
	const extension = extensionOf(name);
	const image = src === brokenSrc ? undefined : src;
	const phase = useBusyPhase({
		busy:
			pending ||
			(image !== undefined && image !== loadedSrc),
	});
	const busy = phase !== "fresh";

	const settleAlreadyDecoded = (
		node: HTMLImageElement | null,
	): void => {
		if (image === undefined || !node?.complete) {
			return;
		}
		if (node.naturalWidth === 0) {
			setBrokenSrc(image);
			return;
		}
		setLoadedSrc(image);
	};

	return (
		<Tooltip content={hint}>
			<span
				{...props}
				className={clsx(style.preview, className)}
				aria-busy={busy || undefined}>
				{image === undefined ? (
					pending ? null : (
						<>
							{icon === undefined ? null : (
								<span
									aria-hidden="true"
									className={style.icon}>
									{icon}
								</span>
							)}
							{extension === "" ? null : (
								<span className={style.extension}>
									{extension}
								</span>
							)}
						</>
					)
				) : (
					<img
						ref={settleAlreadyDecoded}
						src={image}
						alt=""
						className={style.image}
						onLoad={() => setLoadedSrc(image)}
						onError={() => setBrokenSrc(image)}
					/>
				)}
				{busy ? (
					<Skeleton className={style.imageSkeleton} />
				) : null}
				<span className={style.name}>{name}</span>
			</span>
		</Tooltip>
	);
};
