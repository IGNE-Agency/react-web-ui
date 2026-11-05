import type { ComponentType, ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import type { TextPresetProps } from "./text-preset.ts";

/** The props a text preset's bridge takes: the preset's own, less what the form supplies. */
export type TSFTextPresetProps<TExtra extends object> =
	Omit<
		TextPresetProps,
		keyof ConnectedFieldProps | "value" | "onValueChange"
	> &
		TExtra;

/**
 * Wraps a text preset as a TanStack Form bridge. The format is the preset's;
 * the rule behind it belongs to the form's schema.
 *
 * @example
 * export const TSFEmailField = connectTextPreset(EmailField);
 */
export const connectTextPreset = <TExtra extends object>(
	Preset: ComponentType<TextPresetProps & TExtra>,
): ((props: TSFTextPresetProps<TExtra>) => ReactNode) => {
	const Connected = (
		props: TSFTextPresetProps<TExtra>,
	): ReactNode => {
		const { field, props: connected } =
			useConnectedField<string>();
		return (
			<Preset
				{...props}
				{...connected}
				value={field.state.value}
				onValueChange={field.handleChange}
			/>
		);
	};
	return Connected;
};
