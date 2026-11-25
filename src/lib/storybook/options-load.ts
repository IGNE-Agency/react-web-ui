import { fn } from "storybook/test";
import { OPTIONS_LOADED } from "../../components/field/options-load.ts";

/**
 * The options loads a select or combobox story maps its `load` arg from, with
 * `failed`'s `retry` as a logged action.
 *
 * @example
 * argTypes: { load: { options: Object.keys(OPTIONS_LOADS), mapping: OPTIONS_LOADS } }
 */
export const OPTIONS_LOADS = {
	loaded: OPTIONS_LOADED,
	loading: { status: "pending" },
	failed: {
		status: "error",
		retry: fn().mockName("retry"),
	},
	broken: { status: "error" },
} as const;
