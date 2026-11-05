/**
 * One choice of a radio group, toggle group or segmented control.
 *
 * @example
 * const views: readonly ChoiceOption[] = [{ value: "list", label: "List" }];
 */
export type ChoiceOption = Readonly<{
	label: string;
	value: string;
	disabled?: boolean;
}>;
