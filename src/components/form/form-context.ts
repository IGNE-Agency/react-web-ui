import {
	type Context,
	createContext,
	useContext,
} from "react";

const FormDisabledContext: Context<boolean> =
	createContext(false);

/** Provides whether the enclosing `Form.Root` is busy. */
export const FormDisabledProvider: typeof FormDisabledContext.Provider =
	FormDisabledContext.Provider;

/**
 * Whether an enclosing `Form.Root` is busy, so its controls are disabled. A
 * control whose primitive ignores the disabled `<fieldset>` reads this.
 *
 * @example
 * const formDisabled = useFormDisabled();
 */
export const useFormDisabled = (): boolean =>
	useContext(FormDisabledContext);

const FormStatusContext: Context<HTMLElement | null> =
	createContext<HTMLElement | null>(null);

/** Provides the live region `Form.Submit` announces its wait in. */
export const FormStatusProvider: typeof FormStatusContext.Provider =
	FormStatusContext.Provider;

/**
 * The enclosing `Form.Root`'s live region, which sits outside its inert fields.
 *
 * @example
 * const status = useFormStatus();
 */
export const useFormStatus = (): HTMLElement | null =>
	useContext(FormStatusContext);
