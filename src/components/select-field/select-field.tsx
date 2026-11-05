import { type ReactNode, useRef } from "react";
import { useBusyPhase } from "../../lib/hooks/use-busy-phase.ts";
import { normalizeFieldErrors } from "../../lib/forms/errors.ts";
import {
	detachHiddenInput,
	Field,
	type FieldProps,
	type FieldState,
	OPTIONS_LOADED,
	type OptionsLoad,
	type OptionsLoadLabels,
} from "../field/index.ts";
import { useFormDisabled } from "../form/index.ts";
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
			onBlur?: () => void;
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
	const messages = normalizeFieldErrors(errors);
	const invalid = messages.length > 0;
	const formDisabled = useFormDisabled();
	const phase = useBusyPhase({ busy: pending });
	const open = useRef(false);
	const focused = useRef(false);
	const disabled =
		rootProps.disabled === true || formDisabled;

	const fieldState: FieldState = {
		disabled,
		readonly: rootProps.readOnly,
		requiredness,
		invalid,
		dirty,
		touched,
		pending: phase !== "fresh" || load.status === "pending",
		filled:
			rootProps.value !== undefined &&
			rootProps.value !== null &&
			rootProps.value !== "",
	};
	const describedBy = ids.describedBy(
		description !== undefined,
		invalid,
	);

	return (
		<Field.Root
			className={style.field}
			invalid={invalid}
			dirty={dirty}
			touched={touched}>
			<Select.Root<T>
				name={ids.controlId}
				inputRef={detachHiddenInput}
				{...rootProps}
				disabled={disabled}
				required={requiredness === "required"}
				onOpenChange={(next, details) => {
					open.current = next;
					onOpenChange?.(next, details);
				}}
				onOpenChangeComplete={next => {
					onOpenChangeComplete?.(next);
					if (!next) {
						requestAnimationFrame(() => {
							if (!open.current && !focused.current) {
								onBlur?.();
							}
						});
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
					}}
					onBlur={() => {
						focused.current = false;
						if (!open.current) {
							onBlur?.();
						}
					}}
				/>
			</Select.Root>

			<Select.Description id={ids.descriptionId}>
				{description}
			</Select.Description>
			<Select.Error id={ids.errorId}>
				{messages}
			</Select.Error>
		</Field.Root>
	);
};
