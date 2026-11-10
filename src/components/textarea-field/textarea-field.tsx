import type { ReactNode } from "react";
import { Field } from "../field/index.ts";
import {
	TextInput,
	type TextFieldBaseProps,
} from "../text-field/index.ts";
import {
	Textarea,
	type TextareaProps,
} from "./textarea.tsx";
import style from "./textarea-field.module.scss";
import { Spinner } from "../spinner/index.ts";

export type TextareaFieldProps = Omit<
	TextFieldBaseProps,
	| "type"
	| "icon"
	| "prefix"
	| "suffix"
	| "inputMode"
	| "enterKeyHint"
	| "labelHidden"
> &
	Pick<TextareaProps, "rows" | "maxRows">;

/**
 * A multi-line text field: `TextField`'s anatomy over a `<textarea>` that
 * autosizes with its content, with the counter and the pending spinner in a bar
 * along the bottom edge of the group.
 *
 * @example
 * <TextareaField
 * 	label="Note"
 * 	optionalLabel="optional"
 * 	value={note}
 * 	onValueChange={setNote}
 * 	maxLength={2000}
 * />
 */
export const TextareaField = ({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	rows,
	maxRows,
	value,
	onValueChange,
	disabled,
	readOnly,
	dirty,
	touched,
	pending,
	maxLength,
	state,
	className,
	...controlProps
}: TextareaFieldProps): ReactNode => (
	<TextInput.Root
		value={value}
		onValueChange={onValueChange}
		disabled={disabled}
		readOnly={readOnly}
		requiredness={requiredness}
		errors={errors}
		dirty={dirty}
		touched={touched}
		pending={pending}
		maxLength={maxLength}
		state={state}
		className={className}>
		<TextInput.Label>
			{label}{" "}
			<Field.Requiredness optionalLabel={optionalLabel} />
		</TextInput.Label>
		<TextInput.Group className={style.group}>
			<Textarea
				rows={rows}
				maxRows={maxRows}
				{...controlProps}
			/>
			<TextInput.Bar>
				<TextInput.Counter />
				<TextInput.Pending>
					<Spinner size={1} />
				</TextInput.Pending>
			</TextInput.Bar>
		</TextInput.Group>
		<TextInput.Description>
			{description}
		</TextInput.Description>
		<TextInput.Error />
	</TextInput.Root>
);
