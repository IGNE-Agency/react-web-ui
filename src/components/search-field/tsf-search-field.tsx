import type { ReactNode } from "react";
import {
	connectTextPreset,
	type TSFTextPresetProps,
} from "../text-field/index.ts";
import {
	SearchField,
	type SearchFieldExtraProps,
} from "./search-field.tsx";

export type TSFSearchFieldProps =
	TSFTextPresetProps<SearchFieldExtraProps>;

/**
 * `SearchField` connected to the TanStack Form field it renders in. Registered as
 * `field.SearchField`.
 *
 * @example
 * <form.AppField name="query">
 * 	{field => <field.SearchField label="Search clients" />}
 * </form.AppField>
 */
export const TSFSearchField: (
	props: TSFSearchFieldProps,
) => ReactNode =
	connectTextPreset<SearchFieldExtraProps>(SearchField);
