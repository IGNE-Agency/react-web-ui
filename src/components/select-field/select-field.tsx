import { type ReactNode, useRef } from "react";
import {
	detachHiddenInput,
	Field,
	type FieldBlurHandler,
	type FieldProps,
	type FieldState,
	OPTIONS_LOADED,
	type OptionsLoad,
	type OptionsLoadLabels,
	useFieldState,
} from "../field/index.ts";
import { Select, type SelectRootProps } from "./select.tsx";
import style from "./select.module.scss";

export type SelectFieldProps<T extends string> =
	FieldProps &
		OptionsLoadLabels &
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
 * 	optionalLabel="optional"
 * 	options={statusOptions}
 * 	value={status}
 * 	onValueChange={setStatus}
 * 	loadingLabel="Loading options…"
 * 	loadFailedLabel="Options could not be loaded."
 * 	loadBrokenLabel="Options could not be loaded, and trying again won't help."
 * 	retryLabel="Try again"
 * 	noOptionsLabel="No options available."
 * />
 */
export const SelectField = <T extends string>({
	label,
	description,
	errors,
	requiredness,
	optionalLabel,
	dirty,
	touched,
	pending = false,
	placeholder,
	load = OPTIONS_LOADED,
	loadingLabel,
	loadFailedLabel,
	loadBrokenLabel,
	retryLabel,
	noOptionsLabel,
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
					<Field.Requiredness
						requiredness={requiredness}
						optionalLabel={optionalLabel}
					/>
				</Select.Label>
				<Select.Control
					placeholder={placeholder}
					load={load}
					loadingLabel={loadingLabel}
					loadFailedLabel={loadFailedLabel}
					loadBrokenLabel={loadBrokenLabel}
					retryLabel={retryLabel}
					noOptionsLabel={noOptionsLabel}
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
