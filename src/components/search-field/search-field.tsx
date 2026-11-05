import type { ReactNode } from "react";
import {
	TextField,
	type TextFieldBaseProps,
	type TextPresetProps,
} from "../text-field/index.ts";

/** What a search field takes beside the preset props. */
export type SearchFieldExtraProps = Pick<
	TextFieldBaseProps,
	"labelHidden" | "placeholder" | "icon"
> &
	Readonly<{
		/** The clear button's accessible name and tooltip, such as "Clear search". */
		clearLabel: string;
		/** The clear button's icon. */
		clearIcon: ReactNode;
	}>;

export type SearchFieldProps = TextPresetProps &
	SearchFieldExtraProps;

/**
 * A search box: a `TextField` with an optional leading glyph and the clear
 * button. `labelHidden` keeps the name for screen readers where the layout
 * carries no room for a visible label.
 *
 * @example
 * <SearchField label="Search clients" optionalLabel="optional" clearLabel="Clear search" clearIcon={<CloseIcon />} icon={<SearchIcon />} value={search} onValueChange={setSearch} />
 */
export const SearchField = ({
	enterKeyHint = "search",
	...props
}: SearchFieldProps): ReactNode => (
	<TextField
		{...props}
		enterKeyHint={enterKeyHint}
		type="search"
		clearable
		autoComplete="off"
		spellCheck={false}
	/>
);
