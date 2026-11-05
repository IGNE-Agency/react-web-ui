import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Field } from "../field/index.ts";
import { useTextInputContext } from "../text-field/text-input-context.ts";
import textInputStyle from "../text-field/text-field.module.scss";
import { useAutosize } from "./use-autosize.ts";
import style from "./textarea-field.module.scss";

export type TextareaProps = Omit<
	BaseField.Control.Props,
	"value" | "defaultValue" | "onValueChange" | "render"
> &
	Readonly<{
		/**
		 * Rows the control starts at, and never shrinks below. Two is the floor
		 * that tells a textarea apart from a single-line field. @default 3
		 */
		rows?: number;
		/** Rows it grows to before scrolling instead. */
		maxRows?: number;
	}>;

const MIN_ROWS = 2;

/**
 * The bare `<textarea>` for a `TextInput.Group`, growing with its content
 * between `rows` and `maxRows`.
 *
 * @example
 * <TextInput.Group><Textarea rows={4} maxRows={12} /></TextInput.Group>
 */
export const Textarea = ({
	rows = 3,
	maxRows,
	className,
	...props
}: TextareaProps): ReactNode => {
	const { value, setValue, state, setControl } =
		useTextInputContext();
	const fit = useAutosize();
	const minRows = Math.max(rows, MIN_ROWS);
	return (
		<Field.Control
			render={
				<textarea
					ref={element => {
						setControl(element);
						return fit(element);
					}}
					rows={minRows}
					style={{
						minBlockSize: `calc(${minRows} * 1lh)`,
						maxBlockSize:
							maxRows === undefined
								? undefined
								: `calc(${maxRows} * 1lh)`,
					}}
				/>
			}
			value={value}
			onValueChange={setValue}
			disabled={state.disabled}
			readOnly={state.readonly}
			required={state.requiredness === "required"}
			className={clsx(
				textInputStyle.control,
				style.textarea,
				className,
			)}
			{...props}
		/>
	);
};
