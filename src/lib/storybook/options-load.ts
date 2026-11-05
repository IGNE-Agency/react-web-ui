import { fn } from "storybook/test";
import {
	OPTIONS_LOADED,
	type OptionsLoadLabels,
} from "../../components/field/index.ts";

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

/**
 * The copy a select or combobox story passes about how its options load.
 *
 * @example
 * args: { ...OPTIONS_LOAD_LABELS }
 */
export const OPTIONS_LOAD_LABELS: OptionsLoadLabels = {
	loadingLabel: "Loading options…",
	loadFailedLabel: "Options could not be loaded.",
	loadBrokenLabel:
		"Options could not be loaded, and trying again won't help.",
	retryLabel: "Try again",
	noOptionsLabel: "No options available.",
};
