import type { QueryKey } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
	type ConnectedFieldProps,
	useConnectedField,
} from "../../lib/forms/use-connected-field.ts";
import {
	type ComboboxDerivations,
	ComboboxField,
	type ComboboxFieldChrome,
	type ComboboxItemLookup,
} from "./combobox-field.tsx";
import type { ComboboxItems } from "./combobox-items.ts";
import type { ComboboxMultipleLabels } from "./selection.ts";

type Connected<TItem, TData, TKey extends QueryKey> = Omit<
	ComboboxFieldChrome,
	keyof ConnectedFieldProps
> &
	ComboboxItems<TItem> &
	ComboboxDerivations<TItem> &
	ComboboxItemLookup<TItem, TData, TKey>;

export type TSFComboboxFieldProps<
	TItem,
	TData = TItem,
	TKey extends QueryKey = QueryKey,
> = Connected<TItem, TData, TKey> &
	(
		| Readonly<{ multiple?: false }>
		| (Readonly<{ multiple: true }> &
				ComboboxMultipleLabels)
	);

const SingleField = <TItem, TData, TKey extends QueryKey>({
	props,
}: Readonly<{
	props: Connected<TItem, TData, TKey>;
}>): ReactNode => {
	const { field, props: connected } =
		useConnectedField<TItem | null>(props.label);
	return (
		<ComboboxField<TItem, TData, TKey>
			{...props}
			{...connected}
			value={field.state.value}
			onValueChange={next => field.handleChange(next)}
		/>
	);
};

const MultipleField = <
	TItem,
	TData,
	TKey extends QueryKey,
>({
	props,
}: Readonly<{
	props: Connected<TItem, TData, TKey> &
		ComboboxMultipleLabels;
}>): ReactNode => {
	const { field, props: connected } = useConnectedField<
		readonly TItem[]
	>(props.label);
	return (
		<ComboboxField<TItem, TData, TKey>
			{...props}
			{...connected}
			multiple
			value={field.state.value}
			onValueChange={next => field.handleChange(next)}
		/>
	);
};

/**
 * `ComboboxField` bound to the TanStack Form field it renders in: the form
 * value is the item or `null`, or under `multiple` the list of items. Reach it
 * as `field.ComboboxField` inside `form.AppField`.
 *
 * @example
 * <form.AppField name="reviewer">
 * 	{field => (
 * 		<field.ComboboxField
 * 			label="Reviewer"
 * 			optionalLabel="optional"
 * 			items={reviewers}
 * 			itemKey={user => user.id}
 * 			{...comboboxCopy}>
 * 			{user => user.name}
 * 		</field.ComboboxField>
 * 	)}
 * </form.AppField>
 */
export const TSFComboboxField = <
	TItem,
	TData = TItem,
	TKey extends QueryKey = QueryKey,
>(
	props: TSFComboboxFieldProps<TItem, TData, TKey>,
): ReactNode =>
	props.multiple === true ? (
		<MultipleField<TItem, TData, TKey> props={props} />
	) : (
		<SingleField<TItem, TData, TKey> props={props} />
	);
