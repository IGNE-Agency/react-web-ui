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
import { IconButton } from "../button/index.ts";
import {
	AttachmentPreview,
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

export type AttachmentTileRemoveProps = Readonly<{
	/** The button's accessible name and tooltip, such as "Remove". */
	label: string;
	/** The remove glyph. */
	children: ReactNode;
	className?: string;
}>;

/**
 * The pointer-only remove button in a staged tile's corner, its children the
 * glyph. The surrounding `TagGroup` owns the removal, and the keyboard removes
 * with Delete.
 */
const Remove = ({
	label,
	children,
	className,
}: AttachmentTileRemoveProps): ReactNode => {
	const removeId = useId();

	return (
		<span className={clsx(style.remove, className)}>
			<IconButton
				variant="tertiary"
				size="sm"
				label={label}
				render={
					<AriaButton
						slot="remove"
						id={removeId}
						aria-labelledby={removeId}
						excludeFromTabOrder
					/>
				}>
				{children}
			</IconButton>
		</span>
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
			<AttachmentPreview
				name={file.name}
				hint={hint}
				src={preview.src}
				pending={preview.pending}
				icon={icon}
			/>
			{removeLabel === undefined ? null : (
				<Remove label={removeLabel}>{removeIcon}</Remove>
			)}
		</Root>
	);
};

/** The parts of an attachment tile, hanging off its prefab. */
export type AttachmentTileParts = typeof Prefab &
	Readonly<{
		Root: typeof Root;
		Preview: typeof AttachmentPreview;
		Remove: typeof Remove;
	}>;

/**
 * A single staged attachment as a square thumbnail inside a `TagList`: an image
 * preview where the file is one, its extension otherwise, and a pointer-only
 * remove button in the corner. Removal is owned by the surrounding `TagGroup`.
 * The parts hanging off it compose a tile by hand.
 *
 * @example
 * <AttachmentTile id={id} file={file} hint={hint} removeLabel="Remove" removeIcon={<CloseIcon />} invalid={false} disabled={false} />
 */
export const AttachmentTile: AttachmentTileParts =
	Object.assign(Prefab, {
		Root,
		Preview: AttachmentPreview,
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
		<AttachmentPreview
			name={props.name}
			hint={props.hint}
			src={props.src}
			pending={props.pending}
			icon={props.icon}
		/>
	</Root>
);
