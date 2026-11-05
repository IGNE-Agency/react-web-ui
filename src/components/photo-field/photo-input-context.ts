import {
	type Context,
	createContext,
	type RefObject,
} from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import type { FieldBlurHandler } from "../field/index.ts";

export type PhotoInputContextValue = Readonly<{
	value: File | undefined;
	filled: boolean;
	readOnly: boolean;
	invalid: boolean;
	pending: boolean;
	labelledBy: string;
	describedBy: string;
	valueId: string;
	well: RefObject<HTMLButtonElement | null>;
	picker: RefObject<HTMLInputElement | null>;
	pick: (file: File) => Promise<void> | void;
	remove: () => Promise<void>;
	onBlur: FieldBlurHandler | undefined;
}>;

export const PhotoInputContext: Context<PhotoInputContextValue | null> =
	createContext<PhotoInputContextValue | null>(null);

/**
 * The state the enclosing `PhotoInput.Root` holds, for the parts below it.
 *
 * @example
 * const { value, remove } = usePhotoInput();
 */
export const usePhotoInput = (): PhotoInputContextValue =>
	useRequiredContext(
		PhotoInputContext,
		"The PhotoInput parts must be used within a <PhotoInput.Root>.",
	);
