const flagged = "";

/**
 * Whether a field asserts anything about being required. Absent means it makes no
 * assertion, which is the case for anything outside a form.
 */
export type Requiredness = "required" | "optional";

/** The states a form control projects onto its markup. */
export type FieldState = Readonly<{
	disabled?: boolean;
	readonly?: boolean;
	requiredness?: Requiredness;
	invalid?: boolean;
	valid?: boolean;
	dirty?: boolean;
	touched?: boolean;
	filled?: boolean;
	/** Focus is here, however it got here: warms the field's border. */
	focused?: boolean;
	/** That focus is the keyboard's: shows the ring. */
	focusVisible?: boolean;
	pending?: boolean;
}>;

/**
 * Presence-style `data-*` props, matching Base UI's own convention, plus the one
 * state a screen reader reads as a property rather than a treatment.
 */
export type FieldStateAttributes = Readonly<{
	"aria-busy"?: true;
	"data-disabled"?: "";
	"data-readonly"?: "";
	"data-required"?: "";
	"data-optional"?: "";
	"data-invalid"?: "";
	"data-valid"?: "";
	"data-dirty"?: "";
	"data-touched"?: "";
	"data-filled"?: "";
	"data-focused"?: "";
	"data-focus-visible"?: "";
	"data-pending"?: "";
}>;

/**
 * Turns field state into `data-*` props: a true flag emits an empty attribute,
 * anything else is left out.
 *
 * @example
 * <div {...fieldStateAttributes({ invalid: true, disabled: false })} />
 * // <div data-invalid="" />
 */
export const fieldStateAttributes = (
	state: FieldState,
): FieldStateAttributes => ({
	...(state.disabled === true && {
		"data-disabled": flagged,
	}),
	...(state.readonly === true && {
		"data-readonly": flagged,
	}),
	...(state.requiredness === "required" && {
		"data-required": flagged,
	}),
	...(state.requiredness === "optional" && {
		"data-optional": flagged,
	}),
	...(state.invalid === true && {
		"data-invalid": flagged,
	}),
	...(state.valid === true && { "data-valid": flagged }),
	...(state.dirty === true && { "data-dirty": flagged }),
	...(state.touched === true && {
		"data-touched": flagged,
	}),
	...(state.filled === true && {
		"data-filled": flagged,
	}),
	...(state.focused === true && {
		"data-focused": flagged,
	}),
	...(state.focusVisible === true && {
		"data-focus-visible": flagged,
	}),
	...(state.pending === true && {
		"data-pending": flagged,
		"aria-busy": true,
	}),
});
