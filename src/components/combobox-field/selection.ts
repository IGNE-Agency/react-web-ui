import type { ReactNode } from "react";

/** The copy and the remove icon a combobox shows only when it holds several values. */
export type ComboboxMultipleLabels = Readonly<{
	/** Names the group of tags, such as "Selected statuses". */
	selectedLabel: string;
	/** The remove control's own name, which the tag's name completes, such as "Remove". */
	removeLabel: string;
	/** The remove control's tooltip for a value, such as "Remove Jan Jansen". */
	removeHint: (itemLabel: string) => string;
	/** The remove control's icon, such as a cross. */
	removeIcon: ReactNode;
}>;

/**
 * One value or several. The shape of `value`, `defaultValue` and
 * `onValueChange` follows `multiple`.
 *
 * @example
 * const selection: ComboboxMode<User> = { value: user, onValueChange: setUser };
 */
export type ComboboxMode<TItem> =
	| Readonly<{
			multiple?: false;
			value?: TItem | null;
			defaultValue?: TItem | null;
			onValueChange?: (value: TItem | null) => void;
	  }>
	| (Readonly<{
			multiple: true;
			value?: readonly TItem[];
			defaultValue?: readonly TItem[];
			onValueChange?: (value: readonly TItem[]) => void;
	  }> &
			ComboboxMultipleLabels);

/**
 * A field's controlled value as a list, or `undefined` while it is
 * uncontrolled.
 *
 * @example
 * selectedValues({ value: user }); // [user]
 */
export const selectedValues = <TItem>(
	mode: ComboboxMode<TItem>,
): readonly TItem[] | undefined => {
	if (mode.multiple === true) {
		return mode.value;
	}
	if (mode.value === undefined) {
		return undefined;
	}
	return mode.value === null ? [] : [mode.value];
};

/**
 * A field's starting value as a list, for an uncontrolled field.
 *
 * @example
 * defaultValues({ defaultValue: null }); // []
 */
export const defaultValues = <TItem>(
	mode: ComboboxMode<TItem>,
): readonly TItem[] => {
	if (mode.multiple === true) {
		return mode.defaultValue ?? [];
	}
	return mode.defaultValue === undefined ||
		mode.defaultValue === null
		? []
		: [mode.defaultValue];
};

/**
 * Hands a new selection to `onValueChange` in its mode's shape: the list under
 * `multiple`, else its first value or `null`.
 *
 * @example
 * emitValues({ onValueChange: setUser }, [user]); // setUser(user)
 */
export const emitValues = <TItem>(
	mode: ComboboxMode<TItem>,
	next: readonly TItem[],
): void => {
	if (mode.multiple === true) {
		mode.onValueChange?.(next);
		return;
	}
	mode.onValueChange?.(next.at(0) ?? null);
};
