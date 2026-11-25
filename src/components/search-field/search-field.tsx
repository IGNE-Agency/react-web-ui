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
>;

export type SearchFieldProps = TextPresetProps &
	SearchFieldExtraProps;

/**
 * A search box: a `TextField` with an optional leading glyph and the clear
 * button. `labelHidden` keeps the name for screen readers where the layout
 * carries no room for a visible label.
 *
 * @example
 * <SearchField label="Search clients" icon={<SearchIcon />} value={search} onValueChange={setSearch} />
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
