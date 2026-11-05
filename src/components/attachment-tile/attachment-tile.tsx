import CloseIcon from "@material-design-icons/svg/outlined/close.svg?react";
import { clsx } from "clsx";
import { type ReactNode, useId } from "react";
import {
	Button as AriaButton,
	Tag as AriaTag,
} from "react-aria-components";
import { Button } from "../button/index.ts";
import {
	AttachmentPreview,
	useAttachmentPreview,
} from "./attachment-preview.tsx";
import style from "./attachment-tile.module.scss";

export type AttachmentTileProps = Readonly<{
	id: string;
	file: File;
	/** Tooltip text for the tile, e.g. "nota.pdf (12 kB)". */
	hint: string;
	/** Accessible name for the remove button; without one the tile is fixed. */
	removeLabel?: string;
	/** Renders with an error treatment (e.g. an oversized file). */
	invalid: boolean;
	disabled: boolean;
}>;

/**
 * A single staged attachment as a square thumbnail inside a `TagList`: an image
 * preview where the file is one, its extension otherwise, and a pointer-only
 * remove button in the corner. Removal is owned by the surrounding `TagGroup`.
 *
 * @example
 * <AttachmentTile id={id} file={file} hint={hint} removeLabel={label} invalid={false} disabled={false} />
 */
export const AttachmentTile = ({
	id,
	file,
	hint,
	removeLabel,
	invalid,
	disabled,
}: AttachmentTileProps): ReactNode => {
	const preview = useAttachmentPreview(file);
	const removeId = useId();

	return (
		<AriaTag
			id={id}
			textValue={file.name}
			isDisabled={disabled}
			className={style.tile}
			data-invalid={invalid || undefined}>
			<AttachmentPreview
				name={file.name}
				hint={hint}
				src={preview.src}
				pending={preview.pending}
			/>
			{removeLabel === undefined ? null : (
				<span className={style.remove}>
					<Button
						variant="tertiary"
						size="sm"
						iconOnly
						icon={CloseIcon}
						label={removeLabel}
						render={
							<AriaButton
								slot="remove"
								id={removeId}
								aria-labelledby={removeId}
								excludeFromTabOrder
							/>
						}
					/>
				</span>
			)}
		</AriaTag>
	);
};

export type SentAttachmentTileProps = Readonly<{
	name: string;
	/** Tooltip text for the tile. */
	hint: string;
}> &
	(
		| Readonly<{
				/** Image source; without one the tile shows a glyph and the extension. */
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
): ReactNode => {
	const preview = (
		<AttachmentPreview
			name={props.name}
			hint={props.hint}
			src={props.src}
			pending={props.pending}
		/>
	);

	return props.href === undefined ? (
		<span className={style.tile}>{preview}</span>
	) : (
		<a
			className={clsx(style.tile, style.link)}
			href={props.href}
			download={props.name}
			aria-label={props.label}>
			{preview}
		</a>
	);
};
