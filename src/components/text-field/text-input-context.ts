import { type Context, createContext } from "react";
import { useRequiredContext } from "../../lib/use-required-context.ts";
import type { FieldState } from "../field/index.ts";

/** The element a text input's parts read from and return focus to. */
export type TextInputControl =
	| HTMLInputElement
	| HTMLTextAreaElement;

/** What a text input's `Root` hands its parts. */
export type TextInputContextValue = Readonly<{
	/** Projected by `Root`; every part reads it, none of them own it. */
	state: FieldState;
	value: string;
	setValue: (value: string) => void;
	/** Ref callback the control part hands its element to. */
	setControl: (control: TextInputControl | null) => void;
	/** Returns focus to the control, after a part such as `Clear` acts. */
	focusControl: () => void;
	/** Focuses the control and selects its text, for the user to copy by hand. */
	selectControl: () => void;
	maxLength: number | undefined;
}>;

/** The context a text input's `Root` provides. */
export const TextInputContext: Context<TextInputContextValue | null> =
	createContext<TextInputContextValue | null>(null);

/**
 * The surrounding text input's projected state and value, for a part of its own
 * such as `Textarea`.
 *
 * @example
 * const { value, setValue } = useTextInputContext();
 */
export const useTextInputContext =
	(): TextInputContextValue =>
		useRequiredContext(
			TextInputContext,
			"Text input parts must be rendered within <TextInput.Root>.",
		);
