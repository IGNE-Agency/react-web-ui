/**
 * Detaches a headless library's hidden form input from any enclosing `<form>`,
 * so the value it carries is never submitted natively.
 *
 * @example
 * <Select.Root inputRef={detachHiddenInput} />
 */
export const detachHiddenInput = (
	node: HTMLInputElement | null,
): void => {
	node?.setAttribute("form", "");
};
