import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	fieldStateAttributes,
	useFieldFocus,
} from "../field/index.ts";
import { useFormDisabled } from "../form/form-context.ts";
import { CheckboxGlyph } from "./checkbox-glyph.tsx";
import style from "./checkbox.module.scss";

export type CheckboxProps = BaseCheckbox.Root.Props;

/**
 * The checkbox control over base-ui's, drawing a tick, or a dash when
 * `indeterminate`. Name it with a wrapping label, or use `CheckboxField`.
 *
 * @example
 * <label>
 * 	<Checkbox checked={agreed} onCheckedChange={setAgreed} />
 * 	I agree to the terms
 * </label>
 */
export const Checkbox = ({
	className,
	indeterminate,
	disabled = false,
	...props
}: CheckboxProps): ReactNode => {
	const focus = useFieldFocus(props);
	const formDisabled = useFormDisabled();
	return (
		<BaseCheckbox.Root
			className={clsx(style.control, className)}
			indeterminate={indeterminate}
			disabled={disabled || formDisabled}
			{...fieldStateAttributes(focus)}
			{...props}
			{...focus.props}>
			<BaseCheckbox.Indicator
				keepMounted
				className={style.indicator}>
				<CheckboxGlyph
					indeterminate={indeterminate}
					className={style.glyph}
				/>
			</BaseCheckbox.Indicator>
		</BaseCheckbox.Root>
	);
};
