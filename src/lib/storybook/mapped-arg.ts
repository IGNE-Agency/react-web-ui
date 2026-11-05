/**
 * A key of an argTypes `mapping`, set as a story's arg and typed as the value
 * the story renders with.
 *
 * @example
 * export const Failed: Story = {
 * 	args: { load: mappedArg(OPTIONS_LOADS, "failed") },
 * };
 */
export const mappedArg = <
	TMapping extends Readonly<Record<string, unknown>>,
	TKey extends keyof TMapping & string,
>(
	_mapping: TMapping,
	key: TKey,
): TMapping[TKey] =>
	// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion -- Storybook types args as their mapped values, but a story sets the key it maps from.
	key as unknown as TMapping[TKey];
