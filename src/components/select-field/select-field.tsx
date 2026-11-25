import type { ReactNode } from "react";
import {
	Field,
	type FieldProps,
	type OptionsLoad,
} from "../field/index.ts";
import { Select, type SelectRootProps } from "./select.tsx";

export type SelectFieldProps<T extends string> =
	FieldProps &
		Omit<SelectRootProps<T>, "children"> &
		Readonly<{
			/** Shown on the trigger while nothing is selected. */
			placeholder?: string;
			/** How far the options have loaded, when they come from a query. */
			load?: OptionsLoad;
		}>;

/**
 * The assembled select: a labelled trigger over the shared popup surface, then
 * the description and the error. Assembled from `Select`'s parts; `className`
 * lands on the field frame, so callers can size the field.
 *
 * @example
 * <SelectField
 * 	label="Status"
 * 	options={statusOptions}
 * 	value={status}
 * 	onValueChange={setStatus}
 * />
 */
export const SelectField = <T extends string>({
	label,
	description,
	placeholder,
	load,
	...rootProps
}: SelectFieldProps<T>): ReactNode => (
	<Select.Root<T> {...rootProps}>
		<Select.Label>
			{label} <Field.Requiredness />
		</Select.Label>
		<Select.Control placeholder={placeholder} load={load} />
		<Select.Description>{description}</Select.Description>
		<Select.Error />
	</Select.Root>
);
