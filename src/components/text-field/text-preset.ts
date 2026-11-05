import type { TextFieldBaseProps } from "./text-field.tsx";

/**
 * The props every text preset, such as `EmailField`, takes. Everything that
 * fixes the field's format, such as `type`, `inputMode`, `autoCapitalize` and
 * `spellCheck`, is the preset's own business and is absent.
 */
export type TextPresetProps = Pick<
	TextFieldBaseProps,
	| "label"
	| "description"
	| "errors"
	| "requiredness"
	| "optionalLabel"
	| "dirty"
	| "touched"
	| "pending"
	| "value"
	| "onValueChange"
	| "onBlur"
	| "onFocus"
	| "name"
	| "id"
	| "disabled"
	| "readOnly"
	| "state"
	| "className"
	| "enterKeyHint"
>;
