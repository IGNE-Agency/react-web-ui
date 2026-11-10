import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
	type ReactElement,
	type ReactNode,
	useId,
} from "react";
import {
	Button as AriaButton,
	Tag as AriaTag,
} from "react-aria-components";
import { renderAs } from "../../lib/render-as.tsx";
import { IconButton } from "../button/index.ts";
import { Tooltip } from "../tooltip/index.ts";
import {
	AttachmentExtension,
	AttachmentIcon,
	AttachmentImage,
	AttachmentName,
	AttachmentPreview,
	AttachmentSkeleton,
	useAttachmentPreview,
} from "./attachment-preview.tsx";
import style from "./attachment-tile.module.scss";

export type AttachmentTileRootProps =
	useRender.ComponentProps<"span"> &
		Readonly<{
			/** Renders with an error treatment, such as for an oversized file. */
			invalid?: boolean;
		}>;

/**
 * The square frame of a tile. Render it as react-aria's `Tag` inside a
 * `TagList` for a staged file, or as an `<a>` for a download.
 */
const Root = ({
	invalid = false,
	className,
	render,
	ref,
	...props
}: AttachmentTileRootProps): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.tile, className),
			"data-invalid": invalid || undefined,
		},
	});

/**
 * The corner of a tile that a remove button sits in.
 *
 * @example
 * <AttachmentTile.Corner><AttachmentTile.Remove render={…} /></AttachmentTile.Corner>
 */
const Corner = ({
	className,
	render,
	ref,
	...props
}: useRender.ComponentProps<"span">): ReactElement =>
	useRender({
		defaultTagName: "span",
		render,
		ref,
		props: {
			...props,
			className: clsx(style.remove, className),
		},
	});

export type AttachmentTileRemoveProps = Readonly<{
	/** The button to render, such as `<IconButton label="Remove" variant="tertiary" size="sm"><CloseIcon /></IconButton>`. */
	render: useRender.RenderProp;
	className?: string;
}>;

/**
 * The pointer-only remove button of a staged tile, as react-aria's remove
 * slot. It renders whichever button it is given. The surrounding `TagGroup`
 * owns the removal, and the keyboard removes with Delete.
 *
 * @example
 * <AttachmentTile.Remove
 * 	render={
 * 		<IconButton label="Remove" variant="tertiary" size="sm">
 * 			<CloseIcon />
 * 		</IconButton>
 * 	}
 * />
 */
const Remove = ({
	render,
	className,
}: AttachmentTileRemoveProps): ReactNode => {
	const removeId = useId();

	return (
		<AriaButton
			slot="remove"
			id={removeId}
			aria-labelledby={removeId}
			excludeFromTabOrder
			className={className}
			render={renderAs(render)}
		/>
	);
};

export type AttachmentTileProps = Readonly<{
	id: string;
	file: File;
	/** Tooltip text for the tile, e.g. "nota.pdf (12 kB)". */
	hint: string;
	/** Renders with an error treatment (e.g. an oversized file). */
	invalid: boolean;
	disabled: boolean;
	/** A file-type glyph, shown above the extension where the file is not an image. */
	icon?: ReactNode;
	className?: string;
}> &
	(
		| Readonly<{
				/** Accessible name for the remove button; without one the tile is fixed. */
				removeLabel: string;
				/** The remove button's glyph. */
				removeIcon: ReactNode;
		  }>
		| Readonly<{
				removeLabel?: undefined;
				removeIcon?: undefined;
		  }>
	);

type PreviewContentProps = Readonly<{
	name: string;
	hint: string;
	src: string | undefined;
	pending?: boolean;
	icon: ReactNode;
}>;

const PreviewContent = ({
	name,
	hint,
	src,
	pending,
	icon,
}: PreviewContentProps): ReactNode => (
	<Tooltip content={hint}>
		<AttachmentPreview
			name={name}
			src={src}
			pending={pending}>
			<AttachmentImage />
			<AttachmentIcon>{icon}</AttachmentIcon>
			<AttachmentExtension />
			<AttachmentSkeleton />
			<AttachmentName />
		</AttachmentPreview>
	</Tooltip>
);

const Prefab = ({
	id,
	file,
	hint,
	removeLabel,
	removeIcon,
	invalid,
	disabled,
	icon,
	className,
}: AttachmentTileProps): ReactNode => {
	const preview = useAttachmentPreview(file);

	return (
		<Root
			invalid={invalid}
			className={className}
			render={
				<AriaTag
					id={id}
					textValue={file.name}
					isDisabled={disabled}
				/>
			}>
			<PreviewContent
				name={file.name}
				hint={hint}
				src={preview.src}
				pending={preview.pending}
				icon={icon}
			/>
			{removeLabel === undefined ? null : (
				<Corner>
					<Remove
						render={
							<IconButton
								variant="tertiary"
								size="sm"
								label={removeLabel}>
								{removeIcon}
							</IconButton>
						}
					/>
				</Corner>
			)}
		</Root>
	);
};

/** The parts of an attachment tile, hanging off its prefab. */
export type AttachmentTileParts = typeof Prefab &
	Readonly<{
		Root: typeof Root;
		Preview: typeof AttachmentPreview;
		Image: typeof AttachmentImage;
		Icon: typeof AttachmentIcon;
		Extension: typeof AttachmentExtension;
		Skeleton: typeof AttachmentSkeleton;
		Name: typeof AttachmentName;
		Corner: typeof Corner;
		Remove: typeof Remove;
	}>;

/**
 * A single staged attachment as a square thumbnail inside a `TagList`: an image
 * preview where the file is one, its extension otherwise, and a pointer-only
 * remove button in the corner. Removal is owned by the surrounding `TagGroup`.
 * The parts hanging off it compose a tile by hand: a `Preview` holding the
 * `Image`, or the `Icon` and `Extension`, a `Skeleton` and the `Name`, and a
 * `Remove` button in the `Corner`.
 *
 * @example
 * <AttachmentTile id={id} file={file} hint={hint} removeLabel="Remove" removeIcon={<CloseIcon />} invalid={false} disabled={false} />
 */
export const AttachmentTile: AttachmentTileParts =
	Object.assign(Prefab, {
		Root,
		Preview: AttachmentPreview,
		Image: AttachmentImage,
		Icon: AttachmentIcon,
		Extension: AttachmentExtension,
		Skeleton: AttachmentSkeleton,
		Name: AttachmentName,
		Corner,
		Remove,
	});

export type SentAttachmentTileProps = Readonly<{
	name: string;
	/** Tooltip text for the tile. */
	hint: string;
	/** A file-type glyph, shown above the extension where there is no image. */
	icon?: ReactNode;
	className?: string;
}> &
	(
		| Readonly<{
				/** Image source; without one the tile shows its icon and the extension. */
				src: string;
				pending?: false;
		  }>
		| Readonly<{
				src?: undefined;
				/** Whether an image source is still being produced. */
				pending?: boolean;
		  }>
	) &
	(
		| Readonly<{
				/** Where the stored file is served from. */
				href: string;
				/** Accessible name for the download link, e.g. "Download nota.pdf". */
				label: string;
		  }>
		| Readonly<{ href?: never; label?: never }>
	);

/**
 * An attachment on a message that has been sent: the tile the composer stages,
 * without the remove button, and as a download of the stored file once there is
 * one.
 *
 * @example
 * <SentAttachmentTile name="nota.pdf" hint="nota.pdf (12 kB)" src={url} href={url} label="Download nota.pdf" />
 */
export const SentAttachmentTile = (
	props: SentAttachmentTileProps,
): ReactNode => (
	<Root
		className={props.className}
		render={
			props.href === undefined ? undefined : (
				<a
					href={props.href}
					download={props.name}
					aria-label={props.label}
				/>
			)
		}>
		<PreviewContent
			name={props.name}
			hint={props.hint}
			src={props.src}
			pending={props.pending}
			icon={props.icon}
		/>
	</Root>
);
