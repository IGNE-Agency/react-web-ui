import { type ReactNode, useRef } from "react";
import {
	Field,
	type FieldBlurHandler,
	type FieldProps,
	type FieldState,
	type OptionsLoad,
	useFieldState,
} from "../field/index.ts";
import { detachHiddenInput } from "../field/hidden-input.ts";
import { OPTIONS_LOADED } from "../field/options-load.ts";
import { Select, type SelectRootProps } from "./select.tsx";
import style from "./select.module.scss";

export type SelectFieldProps<T extends string> =
	FieldProps &
		Omit<SelectRootProps<T>, "children" | "required"> &
		Readonly<{
			/** Shown on the trigger while nothing is selected. */
			placeholder?: string;
			/** How far the options have loaded, when they come from a query. */
			load?: OptionsLoad;
			/** Called once focus has left the field, its popup included. */
			onBlur?: FieldBlurHandler;
			/** Applied to the trigger, so callers can size the control. */
			className?: string;
		}>;

/**
 * The assembled select: a labelled trigger over the shared popup surface, then
 * the description and the error.
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
	errors,
	requiredness,
	dirty,
	touched,
	pending = false,
	placeholder,
	load = OPTIONS_LOADED,
	onBlur,
	className,
	onOpenChange,
	onOpenChangeComplete,
	...rootProps
}: SelectFieldProps<T>): ReactNode => {
	const ids = Select.useIds();
	const open = useRef(false);
	const focused = useRef(false);
	const inside = useRef(false);
	const field = useFieldState({
		errors,
		requiredness,
		dirty,
		touched,
		pending,
		disabled: rootProps.disabled,
		readOnly: rootProps.readOnly,
		filled:
			rootProps.value !== undefined &&
			rootProps.value !== null &&
			rootProps.value !== "",
	});
	const fieldState: FieldState = {
		...field.state,
		pending:
			field.state.pending === true ||
			load.status === "pending",
	};
	const describedBy = ids.describedBy(
		description !== undefined,
		field.invalid,
	);
	const leave = () => {
		if (
			inside.current &&
			!open.current &&
			!focused.current
		) {
			inside.current = false;
			onBlur?.();
		}
	};

	return (
		<Field.Root
			className={style.field}
			invalid={field.invalid}
			dirty={dirty}
			touched={touched}>
			<Select.Root<T>
				name={ids.controlId}
				inputRef={detachHiddenInput}
				{...rootProps}
				disabled={field.disabled}
				required={requiredness === "required"}
				onOpenChange={(next, details) => {
					open.current = next;
					if (next) {
						inside.current = true;
					}
					onOpenChange?.(next, details);
				}}
				onOpenChangeComplete={next => {
					onOpenChangeComplete?.(next);
					if (!next) {
						requestAnimationFrame(leave);
					}
				}}>
				<Select.Label>
					{label}{" "}
					<Field.Requiredness requiredness={requiredness} />
				</Select.Label>
				<Select.Control
					placeholder={placeholder}
					load={load}
					state={fieldState}
					className={className}
					aria-describedby={describedBy}
					onFocus={() => {
						focused.current = true;
						inside.current = true;
					}}
					onBlur={() => {
						focused.current = false;
						leave();
					}}
				/>
			</Select.Root>

			<Select.Description id={ids.descriptionId}>
				{description}
			</Select.Description>
			<Select.Error id={ids.errorId}>{errors}</Select.Error>
		</Field.Root>
	);
};
